import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2 } from "lucide-react";
import { DashboardMobileCarousel } from "@/components/DashboardMobileCarousel";
import { useIsMobile } from "@/hooks/use-mobile";

const Calendar = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  const fetchWorkouts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: true });

    setWorkouts(data || []);
  };

  const weekStart = startOfWeek(new Date(), { locale: es });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getWorkoutsForDate = (date: Date) => {
    return workouts.filter((w) =>
      isSameDay(new Date(w.scheduled_date), date)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-20 sm:pb-24 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Calendario Semanal</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Visualiza tu planificación de entrenamientos
            </p>
          </div>

          {isMobile ? (
            <DashboardMobileCarousel
              sections={[
                // Primera división: Días de la semana
                <div className="h-full p-3 overflow-y-auto" key="week-days">
                  <div className="grid grid-cols-2 gap-3">
                    {weekDays.map((day) => {
                      const dayWorkouts = getWorkoutsForDate(day);
                      const isToday = isSameDay(day, new Date());
                      const isSelected = isSameDay(day, selectedDate);

                      return (
                        <Card
                          key={day.toISOString()}
                          className={`p-3 cursor-pointer transition-all ${
                            isToday ? "border-primary border-2" : ""
                          } ${isSelected ? "bg-primary/10" : ""}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className="text-center mb-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              {format(day, "EEE", { locale: es })}
                            </p>
                            <p className="text-xl font-bold">
                              {format(day, "d", { locale: es })}
                            </p>
                            {isToday && (
                              <span className="text-xs text-primary font-medium">Hoy</span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {dayWorkouts.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center">
                                Sin entrenamientos
                              </p>
                            ) : (
                              dayWorkouts.map((workout) => (
                                <div
                                  key={workout.id}
                                  className={`text-xs p-1.5 rounded ${
                                    workout.completed
                                      ? "bg-primary/20 text-primary"
                                      : "bg-muted"
                                  }`}
                                >
                                  <div className="flex items-center gap-1">
                                    {workout.completed && (
                                      <CheckCircle2 className="w-3 h-3" />
                                    )}
                                    <span className="truncate">{workout.name}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>,
                // Segunda división: Entrenamientos del día seleccionado
                <div className="h-full p-3 overflow-y-auto" key="day-workouts">
                  <Card className="p-4 shadow-card">
                    <h3 className="text-base font-semibold mb-3">
                      {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                    </h3>
                    {getWorkoutsForDate(selectedDate).length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No hay entrenamientos programados para este día
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {getWorkoutsForDate(selectedDate).map((workout) => (
                          <div
                            key={workout.id}
                            className="p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm">{workout.name}</h4>
                              {workout.completed && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                  Completado
                                </span>
                              )}
                            </div>
                            {workout.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {workout.description}
                              </p>
                            )}
                            <div className="flex gap-3 text-xs text-muted-foreground">
                              <span>{workout.duration_minutes} min</span>
                              <span>~{workout.estimated_calories} kcal</span>
                              <span className="capitalize">{workout.location}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              ]}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 sm:gap-3 lg:gap-4">
                {weekDays.map((day) => {
                  const dayWorkouts = getWorkoutsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <Card
                      key={day.toISOString()}
                      className={`p-4 cursor-pointer transition-all ${
                        isToday ? "border-primary border-2" : ""
                      } ${isSelected ? "bg-primary/5" : ""}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-center mb-3">
                        <p className="text-sm font-medium text-muted-foreground uppercase">
                          {format(day, "EEE", { locale: es })}
                        </p>
                        <p className="text-2xl font-bold">
                          {format(day, "d", { locale: es })}
                        </p>
                        {isToday && (
                          <span className="text-xs text-primary font-medium">Hoy</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {dayWorkouts.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center">
                            Sin entrenamientos
                          </p>
                        ) : (
                          dayWorkouts.map((workout) => (
                            <div
                              key={workout.id}
                              className={`text-xs p-2 rounded ${
                                workout.completed
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                {workout.completed && (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                <span className="truncate">{workout.name}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="p-4 sm:p-6 shadow-card">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                  Entrenamientos para {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                </h3>
                {getWorkoutsForDate(selectedDate).length === 0 ? (
                  <p className="text-muted-foreground">
                    No hay entrenamientos programados para este día
                  </p>
                ) : (
                  <div className="space-y-4">
                    {getWorkoutsForDate(selectedDate).map((workout) => (
                      <div
                        key={workout.id}
                        className="p-4 bg-muted rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{workout.name}</h4>
                          {workout.completed && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Completado
                            </span>
                          )}
                        </div>
                        {workout.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {workout.description}
                          </p>
                        )}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{workout.duration_minutes} min</span>
                          <span>~{workout.estimated_calories} kcal</span>
                          <span className="capitalize">{workout.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
