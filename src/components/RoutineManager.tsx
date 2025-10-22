import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Dumbbell, CheckCircle, TrendingUp } from "lucide-react";
import {
  useUserRoutine,
  useProgressStats
} from "@/hooks/useBackendApi";

/**
 * Displays user's assigned routine and progress statistics
 */
export function RoutineManager() {
  // Fetch user's assigned routine
  const { data: routineData, isLoading: isLoadingRoutine } = useUserRoutine();
  
  // Fetch progress stats
  const { data: statsData } = useProgressStats(30);

  if (isLoadingRoutine) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6 p-3 sm:p-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold">Gestor de Rutinas</h1>
      </div>

      {/* Stats Cards - Más compactas */}
      {statsData && (
        <div className="grid gap-2 grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Entrenamientos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{statsData.stats.total_workouts}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">30 días</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Racha
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{statsData.stats.workout_streak}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">días</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Peso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-1">
                <div className="text-lg sm:text-2xl font-bold">
                  {statsData.stats.weight_change > 0 ? '+' : ''}
                  {statsData.stats.weight_change.toFixed(1)}
                </div>
                <TrendingUp className={`h-3 w-3 sm:h-4 sm:w-4 ${statsData.stats.weight_change > 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">kg</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Routine */}
      {routineData?.routine ? (
        <Card className="shadow-sm">
          <CardHeader className="p-3 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-lg truncate">{routineData.routine.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm line-clamp-2">{routineData.routine.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {routineData.routine.location}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-3 sm:p-6 pt-0">
            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground">Duración:</span>
                <span className="ml-2 font-medium">{routineData.routine.duration_minutes} min</span>
              </div>
              <div>
                <span className="text-muted-foreground">Calorías:</span>
                <span className="ml-2 font-medium">{routineData.routine.estimated_calories} kcal</span>
              </div>
            </div>

            {routineData.routine.workout_exercises && routineData.routine.workout_exercises.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Ejercicios:</h4>
                <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                  {routineData.routine.workout_exercises.map((exercise: any) => (
                    <li key={exercise.id} className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 shrink-0" />
                      <span className="flex-1 truncate">{exercise.name}</span>
                      {exercise.sets && exercise.reps && (
                        <span className="text-muted-foreground text-xs shrink-0">
                          ({exercise.sets} x {exercise.reps})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
            <Dumbbell className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No hay rutina asignada</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Completa el proceso de onboarding para obtener tu rutina personalizada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}