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
import { Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { StatCard } from "@/components/StatCard";
import { Flame, Pizza, Beef, Droplet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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
  const [foods, setFoods] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [portion, setPortion] = useState("1");
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
    fetchFoods();
  }, [user]);

  const fetchFoods = async () => {
    const { data } = await supabase
      .from("foods")
      .select("*")
      .order("nombre", { ascending: true });
    
    setFoods(data || []);
  };

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
    resetForm();
    fetchData();
  };

  const handleSubmitFromDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFood) {
      toast.error("Selecciona un alimento");
      return;
    }

    const portionMultiplier = parseFloat(portion);
    
    const { error } = await supabase.from("meals").insert([{
      user_id: user?.id!,
      meal_type: formData.meal_type as any,
      name: `${selectedFood.nombre} (${portion} × ${selectedFood.racion}${selectedFood.unidad})`,
      calories: Math.round(selectedFood.calorias * portionMultiplier),
      protein: Math.round(selectedFood.proteinas * portionMultiplier),
      carbs: Math.round(selectedFood.carbohidratos * portionMultiplier),
      fat: Math.round(selectedFood.grasas * portionMultiplier),
      date: format(new Date(), "yyyy-MM-dd"),
    }]);

    if (error) {
      toast.error("Error al registrar comida");
      return;
    }

    toast.success("Comida registrada");
    resetForm();
    fetchData();
  };

  const resetForm = () => {
    setOpen(false);
    setFormData({
      meal_type: "desayuno",
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
    setSelectedFood(null);
    setPortion("1");
    setSearchQuery("");
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Comida</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
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

                  <Tabs defaultValue="database" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="database">
                        <Search className="w-4 h-4 mr-2" />
                        Base de Datos
                      </TabsTrigger>
                      <TabsTrigger value="manual">
                        <Plus className="w-4 h-4 mr-2" />
                        Manual
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="database" className="space-y-4">
                      <form onSubmit={handleSubmitFromDatabase} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Buscar Alimento</Label>
                          <Command className="rounded-lg border">
                            <CommandInput 
                              placeholder="Busca un alimento..." 
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                            />
                            <CommandList className="max-h-[200px]">
                              <CommandEmpty>No se encontraron alimentos.</CommandEmpty>
                              <CommandGroup>
                                {foods
                                  .filter((food) =>
                                    food.nombre.toLowerCase().includes(searchQuery.toLowerCase())
                                  )
                                  .slice(0, 10)
                                  .map((food) => (
                                    <CommandItem
                                      key={food.id}
                                      value={food.nombre}
                                      onSelect={() => {
                                        setSelectedFood(food);
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">{food.nombre}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {food.calorias} kcal · {food.proteinas}g prot · {food.carbohidratos}g carbs · {food.grasas}g grasa
                                          <span className="ml-2">({food.racion}{food.unidad})</span>
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>

                        {selectedFood && (
                          <Card className="p-4 bg-muted">
                            <div className="space-y-3">
                              <div>
                                <p className="font-semibold text-lg">{selectedFood.nombre}</p>
                                <p className="text-sm text-muted-foreground">
                                  Porción base: {selectedFood.racion}{selectedFood.unidad}
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Cantidad de Porciones</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={portion}
                                  onChange={(e) => setPortion(e.target.value)}
                                  placeholder="1"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                <div>
                                  <p className="text-xs text-muted-foreground">Calorías</p>
                                  <p className="text-lg font-bold">
                                    {Math.round(selectedFood.calorias * parseFloat(portion || "1"))} kcal
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Proteína</p>
                                  <p className="text-lg font-bold">
                                    {Math.round(selectedFood.proteinas * parseFloat(portion || "1"))}g
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Carbohidratos</p>
                                  <p className="text-lg font-bold">
                                    {Math.round(selectedFood.carbohidratos * parseFloat(portion || "1"))}g
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Grasas</p>
                                  <p className="text-lg font-bold">
                                    {Math.round(selectedFood.grasas * parseFloat(portion || "1"))}g
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}

                        <Button type="submit" className="w-full" disabled={!selectedFood}>
                          Registrar Alimento
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="manual" className="space-y-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
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
                    </TabsContent>
                  </Tabs>
                </div>
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
