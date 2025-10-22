import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, assigned_routine_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile or profile not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile.assigned_routine_id) {
      return new Response(
        JSON.stringify({ routine: null, message: 'No routine assigned yet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the assigned plan details
    const { data: plan, error: planError } = await supabase
      .from('predesigned_plans')
      .select('*')
      .eq('id', profile.assigned_routine_id)
      .maybeSingle();

    if (planError) {
      console.error('Error fetching assigned plan:', planError);
      return new Response(
        JSON.stringify({ error: 'Database error fetching plan' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!plan) {
      console.warn('No plan found for routine ID:', profile.assigned_routine_id);
      return new Response(
        JSON.stringify({ error: 'Assigned plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the exercises for the plan
    const { data: planExercises, error: exercisesError } = await supabase
      .from('plan_ejercicios')
      .select('*, exercises:ejercicio_id(*)')
      .eq('plan_id', plan.id)
      .order('dia', { ascending: true })
      .order('orden', { ascending: true });

    if (exercisesError) {
      console.error('Error fetching plan exercises:', exercisesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch exercises for the plan' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Structure the routine object
    const routine = {
      ...plan,
      days: planExercises?.reduce((acc, pe) => {
        const day = pe.dia;
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(pe.exercises);
        return acc;
      }, {}),
    };

    console.log(`Retrieved routine '${plan.nombre_plan}' for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        routine,
        profile: {
          fitness_level: profile.fitness_level,
          fitness_goal: profile.fitness_goal,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-user-routine:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
