import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import { Flame, Activity, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RoutineManager } from "@/components/RoutineManager";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardMobileCarousel } from "@/components/DashboardMobileCarousel";

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [todayMacros, setTodayMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [todayWorkouts, setTodayWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(profileData);

        const today = format(new Date(), "yyyy-MM-dd");

        const { data: mealsData } = await supabase
          .from("meals")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today);

        if (mealsData) {
          const totals = mealsData.reduce(
            (acc, meal) => ({
              calories: acc.calories + meal.calories,
              protein: acc.protein + meal.protein,
              carbs: acc.carbs + meal.carbs,
              fat: acc.fat + meal.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          );
          setTodayMacros(totals);
        }

        const { data: workoutsData } = await supabase
          .from("workouts")
          .select("*, workout_exercises(*)")
          .eq("user_id", user.id)
          .eq("scheduled_date", today);

        setTodayWorkouts(workoutsData || []);

        if ((!workoutsData || workoutsData.length === 0) && profileData?.assigned_routine_id) {
          const { data: assignedWorkout } = await supabase
            .from("workouts")
            .select("*, workout_exercises(*)")
            .eq("id", profileData.assigned_routine_id)
            .single();

          if (assignedWorkout) {
            setTodayWorkouts([assignedWorkout]);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Esperar a que se determine el tamaño de pantalla en la primera carga
  if (loading || isMobile === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-28 px-4">
          <div className="container mx-auto flex items-center justify-center">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  const caloriesProgress = profile
    ? (todayMacros.calories / profile.daily_calorie_goal) * 100
    : 0;
  const proteinProgress = profile
    ? (todayMacros.protein / profile.daily_protein_goal) * 100
    : 0;

  // Secciones para el carrusel móvil
  const sections = [
    // Sección 1: Stats + Progreso
    <div key="stats" className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Calorías Hoy"
          value={todayMacros.calories}
          subtitle={`${profile?.daily_calorie_goal || 2000} kcal`}
          icon={Flame}
          variant="primary"
        />
        <StatCard
          title="Proteína"
          value={`${todayMacros.protein}g`}
          subtitle={`${profile?.daily_protein_goal || 150}g`}
          icon={Target}
          variant="secondary"
        />
        <StatCard
          title="Entrenamientos Hoy"
          value={todayWorkouts.length}
          subtitle={`${todayWorkouts.filter((w) => w.completed).length} completos`}
          icon={Activity}
          variant="accent"
        />
        <StatCard
          title="Nivel"
          value={profile?.fitness_level || "Principiante"}
          icon={TrendingUp}
        />
      </div>
      <Card className="p-4 shadow-card">
        <h3 className="text-lg font-semibold mb-3">Progreso de Calorías</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Consumidas</span>
              <span className="text-sm text-muted-foreground">
                {todayMacros.calories} / {profile?.daily_calorie_goal || 2000} kcal
              </span>
            </div>
            <Progress value={Math.min(caloriesProgress, 100)} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Proteína</span>
              <span className="text-sm text-muted-foreground">
                {todayMacros.protein}g / {profile?.daily_protein_goal || 150}g
              </span>
            </div>
            <Progress value={Math.min(proteinProgress, 100)} className="h-3" />
          </div>
        </div>
      </Card>
    </div>,

    // Sección 2: Entrenamientos de Hoy
    <Card key="workouts" className="p-4 shadow-card h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-3">Entrenamientos de Hoy</h3>
      {todayWorkouts.length === 0 ? (
        <p className="text-muted-foreground">No hay entrenamientos programados para hoy</p>
      ) : (
        <div className="space-y-3 flex-1 overflow-auto">
          {todayWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div>
                <p className="font-medium">{workout.name}</p>
                <p className="text-sm text-muted-foreground">
                  {workout.duration_minutes} min · {workout.estimated_calories} kcal
                </p>
              </div>
              {workout.completed && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  Completado
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>,

    // Sección 3: Gestor de Rutinas
    <div key="routine-manager">
      <RoutineManager />
    </div>,

    // Sección 4: Consejos del Día
    <Card key="tips" className="p-4 shadow-card bg-gradient-card h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-3">Consejos del Día</h3>
      <div className="space-y-3 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            💧
          </div>
          <div>
            <p className="font-medium">Mantente hidratada</p>
            <p className="text-sm text-muted-foreground">
              Bebe al menos 2 litros de agua durante el día
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            🥗
          </div>
          <div>
            <p className="font-medium">Alimentación balanceada</p>
            <p className="text-sm text-muted-foreground">
              Incluye proteínas, carbohidratos y grasas saludables en cada comida
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            😊
          </div>
          <div>
            <p className="font-medium">Bienestar emocional</p>
            <p className="text-sm text-muted-foreground">
              Dedica 10 minutos al día para meditar o relajarte
            </p>
          </div>
        </div>
      </div>
    </Card>,
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-20 sm:pb-24 px-3 sm:px-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
            ¡Hola, {profile?.full_name || "Usuario"}!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>

        {/* Vista móvil: Carrusel */}
        {isMobile ? (
          <DashboardMobileCarousel sections={sections} />
        ) : (
          /* Vista desktop: Layout normal */
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <StatCard
                title="Calorías Hoy"
                value={todayMacros.calories}
                subtitle={`${profile?.daily_calorie_goal || 2000} kcal`}
                icon={Flame}
                variant="primary"
              />
              <StatCard
                title="Proteína"
                value={`${todayMacros.protein}g`}
                subtitle={`${profile?.daily_protein_goal || 150}g`}
                icon={Target}
                variant="secondary"
              />
              <StatCard
                title="Entrenamientos Hoy"
                value={todayWorkouts.length}
                subtitle={`${todayWorkouts.filter((w) => w.completed).length} completos`}
                icon={Activity}
                variant="accent"
              />
              <StatCard
                title="Nivel"
                value={profile?.fitness_level || "Principiante"}
                icon={TrendingUp}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="p-4 sm:p-6 shadow-card">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Progreso de Calorías</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Consumidas</span>
                      <span className="text-sm text-muted-foreground">
                        {todayMacros.calories} / {profile?.daily_calorie_goal || 2000} kcal
                      </span>
                    </div>
                    <Progress value={Math.min(caloriesProgress, 100)} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Proteína</span>
                      <span className="text-sm text-muted-foreground">
                        {todayMacros.protein}g / {profile?.daily_protein_goal || 150}g
                      </span>
                    </div>
                    <Progress value={Math.min(proteinProgress, 100)} className="h-3" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 shadow-card">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Entrenamientos de Hoy</h3>
                {todayWorkouts.length === 0 ? (
                  <p className="text-muted-foreground">No hay entrenamientos programados para hoy</p>
                ) : (
                  <div className="space-y-3">
                    {todayWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{workout.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {workout.duration_minutes} min · {workout.estimated_calories} kcal
                          </p>
                        </div>
                        {workout.completed && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Completado
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <RoutineManager />

            <Card className="p-4 sm:p-6 shadow-card bg-gradient-card">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Consejos del Día</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    💧
                  </div>
                  <div>
                    <p className="font-medium">Mantente hidratada</p>
                    <p className="text-sm text-muted-foreground">
                      Bebe al menos 2 litros de agua durante el día
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    🥗
                  </div>
                  <div>
                    <p className="font-medium">Alimentación balanceada</p>
                    <p className="text-sm text-muted-foreground">
                      Incluye proteínas, carbohidratos y grasas saludables en cada comida
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    😊
                  </div>
                  <div>
                    <p className="font-medium">Bienestar emocional</p>
                    <p className="text-sm text-muted-foreground">
                      Dedica 10 minutos al día para meditar o relajarte
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;