import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Workouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "casa",
    estimated_calories: "",
    duration_minutes: "",
    scheduled_date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  const fetchWorkouts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: false });

    setWorkouts(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("workouts").insert([{
      user_id: user?.id!,
      name: formData.name,
      description: formData.description,
      location: formData.location as any,
      estimated_calories: parseInt(formData.estimated_calories) || 0,
      duration_minutes: parseInt(formData.duration_minutes) || 0,
      scheduled_date: formData.scheduled_date,
      completed: false,
    }]);

    if (error) {
      toast.error("Error al crear entrenamiento");
      return;
    }

    toast.success("Entrenamiento creado");
    setOpen(false);
    setFormData({
      name: "",
      description: "",
      location: "casa",
      estimated_calories: "",
      duration_minutes: "",
      scheduled_date: format(new Date(), "yyyy-MM-dd"),
    });
    fetchWorkouts();
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from("workouts")
      .update({
        completed: !completed,
        completed_at: !completed ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar");
      return;
    }

    toast.success(!completed ? "¡Entrenamiento completado!" : "Marcado como pendiente");
    fetchWorkouts();
  };

  const homeWorkouts = workouts.filter((w) => w.location === "casa");
  const gymWorkouts = workouts.filter((w) => w.location === "gimnasio");
  const outdoorWorkouts = workouts.filter((w) => w.location === "exterior");

  const WorkoutList = ({ workouts }: { workouts: any[] }) => (
    <div className="space-y-4">
      {workouts.length === 0 ? (
        <p className="text-muted-foreground">No hay entrenamientos registrados</p>
      ) : (
        workouts.map((workout) => (
          <Card
            key={workout.id}
            className={`p-6 shadow-card transition-all ${
              workout.completed ? "bg-primary/5 border-primary/20" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => toggleComplete(workout.id, workout.completed)}>
                    {workout.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold">{workout.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(workout.scheduled_date), "d 'de' MMMM, yyyy")}
                    </p>
                  </div>
                </div>
                {workout.description && (
                  <p className="text-sm text-muted-foreground ml-9 mb-2">
                    {workout.description}
                  </p>
                )}
                <div className="flex gap-4 ml-9 text-sm text-muted-foreground">
                  <span>{workout.duration_minutes} min</span>
                  <span>~{workout.estimated_calories} kcal</span>
                  <span className="capitalize">{workout.location}</span>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-28 px-4">
        <div className="container mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Entrenamientos</h1>
              <p className="text-muted-foreground">
                Planifica y registra tus rutinas de ejercicio
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Nuevo Entrenamiento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Crear Entrenamiento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Rutina de Piernas"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Detalles del entrenamiento..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ubicación</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casa">Casa</SelectItem>
                        <SelectItem value="gimnasio">Gimnasio</SelectItem>
                        <SelectItem value="exterior">Exterior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duración (min)</Label>
                      <Input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) =>
                          setFormData({ ...formData, duration_minutes: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Calorías (aprox)</Label>
                      <Input
                        type="number"
                        value={formData.estimated_calories}
                        onChange={(e) =>
                          setFormData({ ...formData, estimated_calories: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Programada</Label>
                    <Input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduled_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Crear Entrenamiento
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="casa">Casa</TabsTrigger>
              <TabsTrigger value="gimnasio">Gimnasio</TabsTrigger>
              <TabsTrigger value="exterior">Exterior</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <WorkoutList workouts={workouts} />
            </TabsContent>
            <TabsContent value="casa" className="mt-6">
              <WorkoutList workouts={homeWorkouts} />
            </TabsContent>
            <TabsContent value="gimnasio" className="mt-6">
              <WorkoutList workouts={gymWorkouts} />
            </TabsContent>
            <TabsContent value="exterior" className="mt-6">
              <WorkoutList workouts={outdoorWorkouts} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Workouts;
