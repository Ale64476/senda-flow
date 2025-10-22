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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching predesigned plans');

    // Parse query parameters for filtering
    const url = new URL(req.url);
    const objetivo = url.searchParams.get('objetivo'); // 'ganar_masa', 'perder_grasa', 'tonificar'
    const nivel = url.searchParams.get('nivel'); // 'principiante', 'intermedio', 'avanzado'
    const lugar = url.searchParams.get('lugar'); // 'casa', 'gimnasio', 'ambos'
    const diasSemana = url.searchParams.get('dias_semana'); // number

    // Build query
    let query = supabase
      .from('predesigned_plans')
      .select('*')
      .order('nombre_plan', { ascending: true });

    // Apply filters
    if (objetivo) {
      query = query.eq('objetivo', objetivo);
    }
    if (nivel) {
      query = query.eq('nivel', nivel);
    }
    if (lugar) {
      query = query.eq('lugar', lugar);
    }
    if (diasSemana) {
      query = query.eq('dias_semana', parseInt(diasSemana));
    }

    const { data: plans, error: plansError } = await query;

    if (plansError) {
      console.error('Error fetching predesigned plans:', plansError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch plans', details: plansError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Retrieved ${plans?.length || 0} predesigned plans`);

    // Get exercise count for each plan
    const plansWithDetails = await Promise.all(
      (plans || []).map(async (plan) => {
        const { data: exercises, error } = await supabase
          .from('plan_ejercicios')
          .select('ejercicio_id')
          .eq('plan_id', plan.id);

        return {
          ...plan,
          total_exercises: exercises?.length || 0,
        };
      })
    );

    return new Response(
      JSON.stringify({ 
        plans: plansWithDetails,
        count: plansWithDetails.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-predesigned-plans:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
