import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Dumbbell, CheckCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  useUserRoutine,
  useAssignRoutine,
  useRecordProgress,
  useProgressStats
} from "@/hooks/useBackendApi";

/**
 * Demo component showing how to use the backend API
 * Displays user's routine, allows assigning a new one, and recording progress
 */
export function RoutineManager() {
  const [energyLevel, setEnergyLevel] = useState(3);

  // Fetch user's assigned routine
  const { data: routineData, isLoading: isLoadingRoutine } = useUserRoutine();
  
  // Mutation to assign a new routine
  const assignMutation = useAssignRoutine();
  
  // Mutation to record progress
  const recordMutation = useRecordProgress();
  
  // Fetch progress stats
  const { data: statsData } = useProgressStats(30);

  const handleAssignRoutine = async () => {
    try {
      const result = await assignMutation.mutateAsync();
      toast.success(`Rutina asignada: ${result.routine.name}`);
    } catch (error) {
      toast.error('Error al asignar rutina');
      console.error(error);
    }
  };

  const handleCompleteWorkout = async () => {
    if (!routineData?.routine) {
      toast.error('No hay rutina asignada');
      return;
    }

    try {
      await recordMutation.mutateAsync({
        workout_id: routineData.routine.id,
        energy_level: energyLevel,
        notes: 'Completado mediante Routine Manager',
        date: new Date().toISOString().split('T')[0]
      });
      toast.success('¡Progreso registrado!');
    } catch (error) {
      toast.error('Error al registrar progreso');
      console.error(error);
    }
  };

  if (isLoadingRoutine) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestor de Rutinas</h1>
        <Button
          onClick={handleAssignRoutine}
          disabled={assignMutation.isPending}
          variant="outline"
        >
          {assignMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Asignando...
            </>
          ) : (
            <>
              <Dumbbell className="mr-2 h-4 w-4" />
              Asignar Nueva Rutina
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Entrenamientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.stats.total_workouts}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Racha Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.stats.workout_streak}</div>
              <p className="text-xs text-muted-foreground">días consecutivos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Cambio de Peso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {statsData.stats.weight_change > 0 ? '+' : ''}
                  {statsData.stats.weight_change.toFixed(1)} kg
                </div>
                <TrendingUp className={`h-4 w-4 ${statsData.stats.weight_change > 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Routine */}
      {routineData?.routine ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{routineData.routine.name}</CardTitle>
                <CardDescription>{routineData.routine.description}</CardDescription>
              </div>
              <Badge variant="secondary">
                {routineData.routine.location}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Duración:</span>
                <span className="ml-2 font-medium">{routineData.routine.duration_minutes} min</span>
              </div>
              <div>
                <span className="text-muted-foreground">Calorías estimadas:</span>
                <span className="ml-2 font-medium">{routineData.routine.estimated_calories} kcal</span>
              </div>
            </div>

            {routineData.routine.workout_exercises && routineData.routine.workout_exercises.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Ejercicios:</h4>
                <ul className="space-y-2">
                  {routineData.routine.workout_exercises.map((exercise: any) => (
                    <li key={exercise.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{exercise.name}</span>
                      {exercise.sets && exercise.reps && (
                        <span className="text-muted-foreground">
                          ({exercise.sets} x {exercise.reps})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-2 block">
                Nivel de Energía (1-5): {energyLevel}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full"
              />
              <Button
                onClick={handleCompleteWorkout}
                disabled={recordMutation.isPending}
                className="w-full mt-4"
              >
                {recordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Marcar como Completado'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay rutina asignada</h3>
            <p className="text-muted-foreground mb-4">
              Haz clic en "Asignar Nueva Rutina" para obtener una rutina personalizada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}