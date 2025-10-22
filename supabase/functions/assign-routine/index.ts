// @ts-nocheck
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

    // Get current date for generating weekly workouts
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);

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

    // --- Scoring Mappings ---
    // Normalize goal strings to match between DB and profile formats
    const normalizeGoal = (goal: string): string => {
      return goal
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/\s+/g, '_')
        .trim();
    };

    const goalMapping: Record<string, string[]> = {
      ganar_masa: ['ganar_masa', 'fuerza', 'aumentar_masa'],
      bajar_peso: ['perder_grasa', 'tonificar', 'bajar_grasa', 'definir'],
      perder_peso: ['perder_grasa', 'tonificar', 'bajar_grasa', 'definir'],
      bajar_grasa: ['perder_grasa', 'tonificar', 'definir'],
      mantener_peso: ['mantener_peso', 'mantener', 'tonificar'],
      tonificar: ['tonificar', 'definir', 'perder_grasa'],
    };

    const levelMapping: Record<string, string> = {
      principiante: 'B',
      intermedio: 'I',
      avanzado: 'P'
    };

    // Score each plan based on user profile
    const scoredPlans: PlanScore[] = plans.map(plan => {
      let score = 0;
      
      // 1. Match fitness goal (highest priority)
      const userPrimaryGoal = profile.fitness_goal;
      const equivalentGoals = goalMapping[userPrimaryGoal] || [userPrimaryGoal];
      
      // Normalize plan objectives (e.g., "Ganar Masa, Perder Grasa" -> ["ganar_masa", "perder_grasa"])
      const planGoals = plan.objetivo
        .split(',')
        .map((g: string) => normalizeGoal(g));

      // Check for exact match with primary goal
      const hasExactMatch = planGoals.some(pg => equivalentGoals.includes(pg));
      
      if (hasExactMatch) {
        score += 70; // Perfect match on primary goal
      } else if (equivalentGoals.length > 1) {
        // Check for secondary goals
        const hasSecondaryMatch = planGoals.some(pg => equivalentGoals.slice(1).includes(pg));
        if (hasSecondaryMatch) {
          score += 50; // Match on secondary equivalent goal
        }
      }

      // 2. Match fitness level (very important)
      const userLevelCode = levelMapping[profile.fitness_level];
      if (plan.nivel === userLevelCode) {
        score += 30;
      } else if (
        (userLevelCode === 'B' && plan.nivel === 'I') || // Principiante -> Intermedio
        (userLevelCode === 'I' && plan.nivel === 'P')    // Intermedio -> Avanzado
      ) {
        score += 15; // Slightly higher level for progression
      }

      // 3. Match days per week availability
      if (profile.available_days_per_week >= plan.dias_semana) {
        const daysDiff = Math.abs(profile.available_days_per_week - plan.dias_semana);
        score += Math.max(0, 20 - daysDiff * 3);
      } else {
        score -= 30; // Penalize heavily if the plan requires more days than available
      }
      
      // 4. Match training location preference
      let userTrainingTypes = profile.training_types;
      if (userTrainingTypes && typeof userTrainingTypes === 'string') {
        try {
          userTrainingTypes = JSON.parse(userTrainingTypes);
        } catch (e) {
          userTrainingTypes = [userTrainingTypes];
        }
      }
      
      if (userTrainingTypes && Array.isArray(userTrainingTypes)) {
        // Normalize plan location (e.g., "Gimnasio" -> "gimnasio")
        const planLocation = normalizeGoal(plan.lugar);
        
        // Normalize user training types
        const normalizedUserTypes = userTrainingTypes.map((t: string) => normalizeGoal(t));
        
        // Check if there's a match
        if (normalizedUserTypes.includes(planLocation) || normalizedUserTypes.includes('mixto')) {
          score += 15;
        }
      }

      // 5. Consider health conditions
      if (profile.health_conditions && !profile.health_conditions.includes('ninguna') && 
          plan.nivel === 'B') {
        score += 10; // Prefer beginner plans for people with health conditions
      }

      console.log(`Plan ${plan.id} (${plan.nombre_plan}) scored: ${score}`, {
        goalMatch: hasExactMatch ? 'exact' : 'none',
        levelMatch: plan.nivel === userLevelCode,
        daysAvailable: profile.available_days_per_week >= plan.dias_semana,
        locationMatch: userTrainingTypes && Array.isArray(userTrainingTypes) ? userTrainingTypes.map((t: string) => normalizeGoal(t)).includes(normalizeGoal(plan.lugar)) : false
      });
      return { plan, score };
    });

    // Sort by score and pick the best match
    scoredPlans.sort((a, b) => b.score - a.score);
    const selectedPlan = scoredPlans[0].plan;

    console.log(`Best match: ${selectedPlan.id} - ${selectedPlan.nombre_plan} (score: ${scoredPlans[0].score})`);

    // Fetch exercises from plan_ejercicios for the selected plan
    const { data: planExercises, error: planExercisesError } = await supabase
      .from('plan_ejercicios')
      .select(`
        *,
        exercises:ejercicio_id (*)
      `)
      .eq('plan_id', selectedPlan.id)
      .order('dia', { ascending: true })
      .order('orden', { ascending: true });

    if (planExercisesError) {
      console.error('Error fetching plan exercises:', planExercisesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch plan exercises', details: planExercisesError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetched plan exercises:', planExercises?.length || 0);

    // Group exercises by day
    const exercisesByDay: { [key: number]: any[] } = {};
    planExercises?.forEach((pe: any) => {
      if (!exercisesByDay[pe.dia]) {
        exercisesByDay[pe.dia] = [];
      }
      exercisesByDay[pe.dia].push(pe);
    });

    console.log('Exercises grouped by day:', Object.keys(exercisesByDay).length, 'days');

    // Generate workouts for the week
    const workoutsToCreate = [];
    const days = Object.keys(exercisesByDay).map(Number).sort((a, b) => a - b);
    
    for (const dayNum of days) {
      const dayExercises = exercisesByDay[dayNum];
      if (!dayExercises || dayExercises.length === 0) continue;

      // Calculate date for this day (starting from Monday)
      const workoutDate = new Date(monday);
      workoutDate.setDate(monday.getDate() + dayNum - 1);
      const dateStr = workoutDate.toISOString().split('T')[0];

      // Calculate estimated calories for this day's exercises
      const estimatedCalories = dayExercises.reduce((total: number, pe: any) => {
        const exercise = pe.exercises;
        if (!exercise) return total;
        const caloriesPerRep = exercise.calorias_por_repeticion || 0;
        const reps = exercise.repeticiones_sugeridas || 10;
        const sets = exercise.series_sugeridas || 3;
        return total + (caloriesPerRep * reps * sets);
      }, 0);

      // Get muscle group from first exercise
      const muscleGroup = dayExercises[0]?.exercises?.grupo_muscular || 'General';

      // Normalizar el valor de location al enum correcto (casa, gimnasio, exterior)
      const normalizeLocation = (lugar: string): 'casa' | 'gimnasio' | 'exterior' => {
        const normalized = lugar?.toLowerCase() || 'casa';
        if (normalized.includes('casa')) return 'casa';
        if (normalized.includes('gimnasio') || normalized.includes('gym')) return 'gimnasio';
        if (normalized.includes('exterior') || normalized.includes('parque')) return 'exterior';
        return 'casa'; // default
      };

      workoutsToCreate.push({
        user_id: user.id,
        name: `${selectedPlan.nombre_plan} - Día ${dayNum}`,
        description: `${muscleGroup} - ${selectedPlan.descripcion_plan}`,
        scheduled_date: dateStr,
        location: normalizeLocation(selectedPlan.lugar),
        duration_minutes: dayExercises.length * 5, // Estimate 5 min per exercise
        estimated_calories: Math.round(estimatedCalories),
        completed: false,
        tipo: 'automatico',
        exercises: dayExercises,
      });
    }

    console.log('Creating', workoutsToCreate.length, 'workouts for the week');

    // Create all workouts
    const createdWorkouts = [];
    for (const workoutData of workoutsToCreate) {
      const { exercises, ...workoutInsertData } = workoutData;

      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert(workoutInsertData)
        .select()
        .single();

      if (workoutError) {
        console.error('Error creating workout:', workoutError);
        continue;
      }

      console.log('Created workout:', workout.id, 'for date:', workoutData.scheduled_date);

      // Add exercises to the workout
      if (exercises && exercises.length > 0) {
        const workoutExercises = exercises.map((pe: any) => {
          const exercise = pe.exercises;
          return {
            workout_id: workout.id,
            name: exercise.nombre,
            sets: exercise.series_sugeridas || 3,
            reps: exercise.repeticiones_sugeridas || 10,
            notes: `${exercise.grupo_muscular} - ${exercise.nivel}`,
            duration_minutes: exercise.duracion_promedio_segundos ? Math.ceil(exercise.duracion_promedio_segundos / 60) : null,
          };
        });

        const { error: exercisesError } = await supabase
          .from('workout_exercises')
          .insert(workoutExercises);

        if (exercisesError) {
          console.error('Error adding exercises to workout:', workout.id, exercisesError);
        } else {
          console.log('Added', workoutExercises.length, 'exercises to workout:', workout.id);
        }
      }

      createdWorkouts.push(workout);
    }

    // Update user profile with the plan reference
    if (createdWorkouts.length > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ assigned_routine_id: selectedPlan.id, onboarding_completed: true })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile with assigned plan:', updateError);
      }
    }

    console.log('Routine assigned successfully:', createdWorkouts.length, 'workouts created');

      return new Response(
        JSON.stringify({
          success: true,
          message: `Routine assigned successfully: ${selectedPlan.nombre_plan}`,
          plan: selectedPlan,
          workouts_created: createdWorkouts.length,
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
