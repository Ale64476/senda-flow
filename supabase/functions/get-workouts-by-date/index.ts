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

    // Get authenticated user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    console.log('Fetching workouts for user:', user.id, 'date:', date, 'range:', startDate, '-', endDate);

    // Build query
    let query = supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (*)
      `)
      .eq('user_id', user.id);

    if (date) {
      query = query.eq('scheduled_date', date);
    } else if (startDate && endDate) {
      query = query.gte('scheduled_date', startDate).lte('scheduled_date', endDate);
    } else if (startDate) {
      query = query.gte('scheduled_date', startDate);
    } else if (endDate) {
      query = query.lte('scheduled_date', endDate);
    }

    query = query.order('scheduled_date', { ascending: true });

    const { data: workouts, error: workoutsError } = await query;

    if (workoutsError) {
      console.error('Error fetching workouts:', workoutsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workouts', details: workoutsError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found', workouts?.length || 0, 'workouts');

    return new Response(
      JSON.stringify({
        workouts: workouts || [],
        count: workouts?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-workouts-by-date:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
