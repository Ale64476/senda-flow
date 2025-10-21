import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    fitness_level: "principiante",
    fitness_goal: "mantener_peso",
    weight: "",
    height: "",
    age: "",
    daily_calorie_goal: "",
    daily_protein_goal: "",
    daily_carbs_goal: "",
    daily_fat_goal: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || "",
        fitness_level: (profileData.fitness_level || "principiante") as any,
        fitness_goal: (profileData.fitness_goal || "mantener_peso") as any,
        weight: profileData.weight?.toString() || "",
        height: profileData.height?.toString() || "",
        age: profileData.age?.toString() || "",
        daily_calorie_goal: profileData.daily_calorie_goal?.toString() || "",
        daily_protein_goal: profileData.daily_protein_goal?.toString() || "",
        daily_carbs_goal: profileData.daily_carbs_goal?.toString() || "",
        daily_fat_goal: profileData.daily_fat_goal?.toString() || "",
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData) {
      setUserRole(roleData.role);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        fitness_level: formData.fitness_level as any,
        fitness_goal: formData.fitness_goal as any,
        weight: parseFloat(formData.weight) || null,
        height: parseFloat(formData.height) || null,
        age: parseInt(formData.age) || null,
        daily_calorie_goal: parseInt(formData.daily_calorie_goal) || 2000,
        daily_protein_goal: parseInt(formData.daily_protein_goal) || 150,
        daily_carbs_goal: parseInt(formData.daily_carbs_goal) || 200,
        daily_fat_goal: parseInt(formData.daily_fat_goal) || 50,
      })
      .eq("id", user?.id);

    setLoading(false);

    if (error) {
      toast.error("Error al actualizar perfil");
      return;
    }

    toast.success("Perfil actualizado correctamente");
    fetchProfile();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mi Perfil</h1>
            <p className="text-muted-foreground">
              Configura tus datos personales y objetivos
            </p>
          </div>

          <Card className="p-6 shadow-card bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Plan Actual</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <Badge variant={userRole === "pro" ? "default" : "secondary"} className="text-lg px-4 py-2">
                {userRole === "pro" ? "PRO" : "Básico"}
              </Badge>
            </div>
            {userRole === "user" && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  🌟 Próximamente: Plan PRO
                </p>
                <p className="text-sm text-muted-foreground">
                  Análisis con IA, integración con apps de ciclo menstrual, y más funciones exclusivas
                </p>
              </div>
            )}
          </Card>

          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-6">Información Personal</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nivel de Fitness</Label>
                  <Select
                    value={formData.fitness_level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, fitness_level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principiante">Principiante</SelectItem>
                      <SelectItem value="intermedio">Intermedio</SelectItem>
                      <SelectItem value="avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Objetivo</Label>
                  <Select
                    value={formData.fitness_goal}
                    onValueChange={(value) =>
                      setFormData({ ...formData, fitness_goal: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bajar_peso">Bajar de peso</SelectItem>
                      <SelectItem value="aumentar_masa">Aumentar masa muscular</SelectItem>
                      <SelectItem value="mantener_peso">Mantener peso</SelectItem>
                      <SelectItem value="tonificar">Tonificar</SelectItem>
                      <SelectItem value="mejorar_resistencia">Mejorar resistencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Edad</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Metas Nutricionales Diarias</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Calorías (kcal)</Label>
                    <Input
                      type="number"
                      value={formData.daily_calorie_goal}
                      onChange={(e) =>
                        setFormData({ ...formData, daily_calorie_goal: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Proteína (g)</Label>
                    <Input
                      type="number"
                      value={formData.daily_protein_goal}
                      onChange={(e) =>
                        setFormData({ ...formData, daily_protein_goal: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Carbohidratos (g)</Label>
                    <Input
                      type="number"
                      value={formData.daily_carbs_goal}
                      onChange={(e) =>
                        setFormData({ ...formData, daily_carbs_goal: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grasas (g)</Label>
                    <Input
                      type="number"
                      value={formData.daily_fat_goal}
                      onChange={(e) =>
                        setFormData({ ...formData, daily_fat_goal: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
