import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlanScore {
  plan: any;
  score: number;
}

// Mapeo de objetivos del perfil a objetivos de planes (ahora en minúsculas con guión bajo)
const goalMapping: Record<string, string[]> = {
  'ganar_masa': ['ganar_masa', 'tonificar'],
  'perder_peso': ['perder_grasa', 'tonificar'],
  'mantener_peso': ['tonificar', 'perder_grasa'],
  'tonificar': ['tonificar', 'perder_grasa']
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

    console.log(`Assigning routine for user ${user.id}`);

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

    console.log('User profile:', { 
      fitness_goal: profile.fitness_goal, 
      fitness_level: profile.fitness_level,
      available_days: profile.available_days_per_week,
      training_types: profile.training_types
    });

    // Get all available predesigned plans
    const { data: plans, error: plansError } = await supabase
      .from('predesigned_plans')
      .select('*');

    if (plansError || !plans || plans.length === 0) {
      console.error('Error fetching plans:', plansError);
      return new Response(
        JSON.stringify({ error: 'No predesigned plans available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${plans.length} predesigned plans`);

    // Score each plan based on user profile
    const scoredPlans: PlanScore[] = plans.map(plan => {
      let score = 0;
      
      // Match fitness goal (highest priority)
      const userGoals = goalMapping[profile.fitness_goal] || [];
      if (userGoals.includes(plan.objetivo)) {
        score += 50;
        if (userGoals[0] === plan.objetivo) {
          score += 20; // Extra points for primary match
        }
      }

      // Match fitness level (very important) - ahora en minúsculas
      if (plan.nivel === profile.fitness_level) {
        score += 30;
      } else if (
        (profile.fitness_level === 'principiante' && plan.nivel === 'intermedio') ||
        (profile.fitness_level === 'intermedio' && plan.nivel === 'avanzado')
      ) {
        score += 10; // Slightly higher level for progression
      }

      // Match days per week availability
      if (profile.available_days_per_week >= plan.dias_semana) {
        const daysDiff = Math.abs(profile.available_days_per_week - plan.dias_semana);
        score += Math.max(0, 20 - daysDiff * 3);
      }

      // Match training location preference - ahora en minúsculas
      if (profile.training_types && Array.isArray(profile.training_types)) {
        const placePreference = plan.lugar.toLowerCase();
        if (
          (placePreference.includes('casa') && profile.training_types.includes('casa')) ||
          (placePreference.includes('gimnasio') && profile.training_types.includes('gimnasio'))
        ) {
          score += 15;
        }
      }

      // Consider health conditions - ahora en minúsculas
      if (profile.health_conditions && profile.health_conditions.length > 0 && 
          plan.nivel === 'principiante') {
        score += 5; // Prefer beginner plans for people with health conditions
      }

      console.log(`Plan ${plan.id} (${plan.nombre_plan}) scored: ${score}`);
      return { plan, score };
    });

    // Sort by score and pick the best match
    scoredPlans.sort((a, b) => b.score - a.score);
    const bestPlan = scoredPlans[0].plan;

    console.log(`Best match: ${bestPlan.id} - ${bestPlan.nombre_plan} (score: ${scoredPlans[0].score})`);

    // Create base workout template from the best plan
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayDate = `${year}-${month}-${day}`;

    // Calculate estimated calories based on exercises
    let estimatedCalories = 0;
    const planExercisesIds = bestPlan.ejercicios_ids_ordenados;
    
    if (planExercisesIds && Array.isArray(planExercisesIds)) {
      const { data: exercises } = await supabase
        .from('exercises')
        .select('calorias_por_repeticion, repeticiones_sugeridas, series_sugeridas')
        .in('id', planExercisesIds);

      if (exercises && exercises.length > 0) {
        estimatedCalories = exercises.reduce((total, ex) => {
          const cals = (ex.calorias_por_repeticion || 0) * (ex.repeticiones_sugeridas || 10) * (ex.series_sugeridas || 3);
          return total + cals;
        }, 0);
      }
    }

    const { data: newWorkout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: bestPlan.nombre_plan,
        description: bestPlan.descripcion_plan,
        location: bestPlan.lugar.toLowerCase().includes('gimnasio') ? 'gimnasio' : 'casa',
        scheduled_date: todayDate,
        completed: false,
        duration_minutes: profile.session_duration_minutes || 60,
        estimated_calories: Math.round(estimatedCalories)
      })
      .select()
      .single();

    if (workoutError || !newWorkout) {
      console.error('Error creating workout:', workoutError);
      return new Response(
        JSON.stringify({ error: 'Failed to create workout from plan' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Created workout ${newWorkout.id} from plan ${bestPlan.id}`);

    // Add exercises to the workout
    const exercisesIds = bestPlan.ejercicios_ids_ordenados;
    if (exercisesIds && Array.isArray(exercisesIds)) {
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('id', exercisesIds);

      if (!exercisesError && exercises && exercises.length > 0) {
        const workoutExercises = exercises.map(exercise => ({
          workout_id: newWorkout.id,
          name: exercise.nombre,
          sets: exercise.series_sugeridas || 3,
          reps: exercise.repeticiones_sugeridas || 10,
          duration_minutes: exercise.duracion_promedio_segundos ? Math.ceil(exercise.duracion_promedio_segundos / 60) : null,
          notes: exercise.descripcion
        }));

        const { error: insertExercisesError } = await supabase
          .from('workout_exercises')
          .insert(workoutExercises);

        if (insertExercisesError) {
          console.error('Error adding exercises to workout:', insertExercisesError);
        } else {
          console.log(`Added ${workoutExercises.length} exercises to workout`);
        }
      }
    }

    // Assign workout to user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ assigned_routine_id: newWorkout.id })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error assigning routine to profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to assign routine to profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Assigned workout ${newWorkout.id} to user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        routine: newWorkout,
        plan: bestPlan,
        message: `Plan "${bestPlan.nombre_plan}" asignado exitosamente`
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
