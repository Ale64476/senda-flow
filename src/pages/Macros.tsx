import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { StatCard } from "@/components/StatCard";
import { Flame, Pizza, Beef, Droplet } from "lucide-react";

const mealTypes = [
  { value: "desayuno", label: "Desayuno" },
  { value: "colacion_am", label: "Colación AM" },
  { value: "comida", label: "Comida" },
  { value: "colacion_pm", label: "Colación PM" },
  { value: "cena", label: "Cena" },
];

const Macros = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    meal_type: "desayuno",
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

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
      .eq("date", today)
      .order("created_at", { ascending: false });

    setMeals(mealsData || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("meals").insert([{
      user_id: user?.id!,
      meal_type: formData.meal_type as any,
      name: formData.name,
      calories: parseInt(formData.calories),
      protein: parseInt(formData.protein) || 0,
      carbs: parseInt(formData.carbs) || 0,
      fat: parseInt(formData.fat) || 0,
      date: format(new Date(), "yyyy-MM-dd"),
    }]);

    if (error) {
      toast.error("Error al registrar comida");
      return;
    }

    toast.success("Comida registrada");
    setOpen(false);
    setFormData({
      meal_type: "desayuno",
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("meals").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar");
      return;
    }

    toast.success("Comida eliminada");
    fetchData();
  };

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const mealsByType = mealTypes.map((type) => ({
    ...type,
    meals: meals.filter((m) => m.meal_type === type.value),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-28 px-4">
        <div className="container mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Seguimiento de Macros</h1>
              <p className="text-muted-foreground">
                Registra tus comidas y mantén el control de tu nutrición
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Registrar Comida
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Comida</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Comida</Label>
                    <Select
                      value={formData.meal_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, meal_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mealTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre del Alimento</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Calorías</Label>
                      <Input
                        type="number"
                        value={formData.calories}
                        onChange={(e) =>
                          setFormData({ ...formData, calories: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Proteína (g)</Label>
                      <Input
                        type="number"
                        value={formData.protein}
                        onChange={(e) =>
                          setFormData({ ...formData, protein: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Carbohidratos (g)</Label>
                      <Input
                        type="number"
                        value={formData.carbs}
                        onChange={(e) =>
                          setFormData({ ...formData, carbs: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grasas (g)</Label>
                      <Input
                        type="number"
                        value={formData.fat}
                        onChange={(e) =>
                          setFormData({ ...formData, fat: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Registrar
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Calorías"
              value={totals.calories}
              subtitle={`${profile?.daily_calorie_goal || 2000 - totals.calories} restantes`}
              icon={Flame}
              variant="primary"
            />
            <StatCard
              title="Proteína"
              value={`${totals.protein}g`}
              subtitle={`Meta: ${profile?.daily_protein_goal || 150}g`}
              icon={Beef}
              variant="secondary"
            />
            <StatCard
              title="Carbohidratos"
              value={`${totals.carbs}g`}
              subtitle={`Meta: ${profile?.daily_carbs_goal || 200}g`}
              icon={Pizza}
            />
            <StatCard
              title="Grasas"
              value={`${totals.fat}g`}
              subtitle={`Meta: ${profile?.daily_fat_goal || 50}g`}
              icon={Droplet}
            />
          </div>

          <div className="space-y-6">
            {mealsByType.map((type) => (
              <Card key={type.value} className="p-6 shadow-card">
                <h3 className="text-xl font-semibold mb-4">{type.label}</h3>
                {type.meals.length === 0 ? (
                  <p className="text-muted-foreground">
                    No has registrado nada para {type.label.toLowerCase()}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {type.meals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{meal.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {meal.calories} kcal · {meal.protein}g proteína · {meal.carbs}g
                            carbos · {meal.fat}g grasa
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(meal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Macros;
