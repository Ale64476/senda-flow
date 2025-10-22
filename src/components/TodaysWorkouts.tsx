import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTodaysWorkouts } from "@/hooks/useBackendApi";
import { Dumbbell, Clock, Flame, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const TodaysWorkouts = () => {
  const { data, isLoading, error } = useTodaysWorkouts();
  const [completingWorkout, setCompletingWorkout] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleCompleteWorkout = async (workoutId: string, currentStatus: boolean) => {
    setCompletingWorkout(workoutId);
    try {
      const { error } = await supabase
        .from('workouts')
        .update({ 
          completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', workoutId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['todays-workouts'] });
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] });
      toast.success(!currentStatus ? 'Workout completed!' : 'Workout marked as incomplete');
    } catch (error) {
      console.error('Error updating workout:', error);
      toast.error('Failed to update workout');
    } finally {
      setCompletingWorkout(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Entrenamientos de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Entrenamientos de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Error cargando entrenamientos</p>
        </CardContent>
      </Card>
    );
  }

  const workouts = data?.workouts || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Entrenamientos de Hoy
          <Badge variant="secondary" className="ml-auto">
            {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay entrenamientos programados para hoy</p>
            <p className="text-xs mt-1">¡Disfruta tu día de descanso!</p>
          </div>
        ) : (
          workouts.map((workout: any) => (
            <div
              key={workout.id}
              className={`border rounded-lg p-4 transition-all ${
                workout.completed 
                  ? 'bg-muted/50 border-success/50' 
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={workout.completed}
                    onCheckedChange={() => handleCompleteWorkout(workout.id, workout.completed)}
                    disabled={completingWorkout === workout.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${workout.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {workout.name}
                    </h4>
                    {workout.description && (
                      <p className="text-sm text-muted-foreground mb-2">{workout.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {workout.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {workout.duration_minutes} min
                        </span>
                      )}
                      {workout.estimated_calories && (
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {workout.estimated_calories} cal
                        </span>
                      )}
                      {workout.location && (
                        <Badge variant="outline" className="text-xs">
                          {workout.location === 'casa' ? '🏠 Casa' : '🏋️ Gimnasio'}
                        </Badge>
                      )}
                      {workout.tipo && (
                        <Badge variant={workout.tipo === 'automatico' ? 'default' : 'secondary'} className="text-xs">
                          {workout.tipo === 'automatico' ? '⚡ Auto' : '✍️ Manual'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {workout.workout_exercises && workout.workout_exercises.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium mb-2 text-muted-foreground">
                    Ejercicios ({workout.workout_exercises.length}):
                  </p>
                  <div className="space-y-1">
                    {workout.workout_exercises.slice(0, 3).map((exercise: any, idx: number) => (
                      <div key={exercise.id || idx} className="text-xs flex items-center justify-between">
                        <span className={workout.completed ? 'text-muted-foreground line-through' : ''}>
                          {exercise.name}
                        </span>
                        <span className="text-muted-foreground">
                          {exercise.sets}x{exercise.reps}
                        </span>
                      </div>
                    ))}
                    {workout.workout_exercises.length > 3 && (
                      <p className="text-xs text-muted-foreground italic">
                        +{workout.workout_exercises.length - 3} más...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
