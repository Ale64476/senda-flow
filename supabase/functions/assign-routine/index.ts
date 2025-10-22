import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RoutineScore {
  routine: any;
  score: number;
}

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
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all available workouts/routines
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises(*)
      `);

    if (workoutsError || !workouts || workouts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No routines available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Score each routine based on user profile
    const scoredRoutines: RoutineScore[] = workouts.map(workout => {
      let score = 0;
      
      // Match duration with available time
      if (workout.duration_minutes && profile.session_duration_minutes) {
        const timeDiff = Math.abs(workout.duration_minutes - profile.session_duration_minutes);
        score += Math.max(0, 10 - timeDiff / 10);
      }

      // Match fitness level (if stored in workout description or location)
      if (profile.fitness_level === 'principiante') {
        score += workout.location === 'casa' ? 5 : 0;
      } else if (profile.fitness_level === 'intermedio') {
        score += 3;
      } else if (profile.fitness_level === 'avanzado') {
        score += workout.location === 'gimnasio' ? 5 : 0;
      }

      // Consider health conditions - avoid high intensity if there are health issues
      if (profile.health_conditions && profile.health_conditions.length > 0) {
        score -= 2; // Slightly lower score for more cautious approach
      }

      // Gender considerations for menstrual cycle tracking
      if (profile.gender === 'female' && profile.menstrual_tracking_enabled) {
        score += 2; // Prefer routines that can be adapted
      }

      return { routine: workout, score };
    });

    // Sort by score and pick the best match
    scoredRoutines.sort((a, b) => b.score - a.score);
    const bestRoutine = scoredRoutines[0].routine;

    // Assign routine to user
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ assigned_routine_id: bestRoutine.id })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error assigning routine:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to assign routine' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Assigned routine ${bestRoutine.id} to user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        routine: bestRoutine,
        message: 'Routine assigned successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in assign-routine:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});