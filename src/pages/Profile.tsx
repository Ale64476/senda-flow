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
import { MessageSquare, Pencil } from "lucide-react";
import { ProButton } from "@/components/ProButton";
import { calculateMacros, validateProfileData } from "@/lib/macrosCalculator";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "femenino",
    fitness_level: "principiante",
    fitness_goal: "mantener_peso",
    weight: "",
    height: "",
    age: "",
    available_days_per_week: "",
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

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error loading profile:", profileError);
      toast.error("Error al cargar el perfil");
      return;
    }

    if (profileData) {
      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || "",
        gender: profileData.gender || "femenino",
        fitness_level: profileData.fitness_level || "principiante",
        fitness_goal: profileData.fitness_goal || "mantener_peso",
        weight: profileData.weight?.toString() || "",
        height: profileData.height?.toString() || "",
        age: profileData.age?.toString() || "",
        available_days_per_week: profileData.available_days_per_week?.toString() || "",
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
      .maybeSingle();

    if (roleData) {
      setUserRole(roleData.role);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Recalcular macros si hay información completa
    let calculatedMacros = null;
    const profileData = {
      gender: formData.gender,
      age: parseInt(formData.age) || 0,
      weight: parseFloat(formData.weight) || 0,
      height: parseFloat(formData.height) || 0,
      availableDays: parseInt(formData.available_days_per_week) || 0,
      fitnessLevel: formData.fitness_level,
      fitnessGoal: formData.fitness_goal,
    };

    if (validateProfileData(profileData)) {
      calculatedMacros = calculateMacros(profileData);
      console.log("Macros recalculados:", calculatedMacros);
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        gender: formData.gender,
        fitness_level: formData.fitness_level as "principiante" | "intermedio" | "avanzado",
        fitness_goal: formData.fitness_goal as "bajar_peso" | "aumentar_masa" | "mantener_peso" | "tonificar" | "mejorar_resistencia" | "ganar_masa" | "bajar_grasa" | "rendimiento",
        weight: parseFloat(formData.weight) || null,
        height: parseFloat(formData.height) || null,
        age: parseInt(formData.age) || null,
        available_days_per_week: parseInt(formData.available_days_per_week) || null,
        // Usar macros calculados si están disponibles, si no mantener los valores actuales
        daily_calorie_goal: calculatedMacros?.dailyCalories || parseInt(formData.daily_calorie_goal) || 2000,
        daily_protein_goal: calculatedMacros?.protein || parseInt(formData.daily_protein_goal) || 150,
        daily_carbs_goal: calculatedMacros?.carbs || parseInt(formData.daily_carbs_goal) || 200,
        daily_fat_goal: calculatedMacros?.fat || parseInt(formData.daily_fat_goal) || 50,
      })
      .eq("id", user?.id);

    setLoading(false);

    if (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar perfil: " + error.message);
      return;
    }

    if (calculatedMacros) {
      toast.success("Perfil y macros actualizados correctamente");
    } else {
      toast.success("Perfil actualizado correctamente");
    }
    setIsEditing(false);
    fetchProfile();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-20 sm:pb-24 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Mi Perfil</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Configura tus datos personales y objetivos
            </p>
          </div>

          <Card className="p-4 sm:p-6 shadow-card bg-gradient-card">
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
              <div className="mt-4 space-y-3">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    🌟 Próximamente: Plan PRO
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Análisis con IA, integración con apps de ciclo menstrual, y más funciones exclusivas
                  </p>
                </div>
                
                <ProButton
                  icon={MessageSquare}
                  label="Chat Entrenador IA"
                  featureTitle="Chat Entrenador Personal IA"
                  featureDescription="Tu entrenador virtual 24/7 con conocimiento de tu progreso y rutina"
                  features={[
                    "Respuestas personalizadas basadas en tu perfil",
                    "Consejos de nutrición y entrenamiento",
                    "Ajustes a tu rutina en tiempo real",
                    "Motivación y seguimiento continuo",
                    "Análisis de tu progreso con IA"
                  ]}
                  className="w-full"
                  disabled
                />
              </div>
            )}
          </Card>

          <Card className="p-4 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold">Información Personal</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isEditing}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sexo Biológico</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Días de Entrenamiento (por semana)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="7"
                    value={formData.available_days_per_week}
                    onChange={(e) => setFormData({ ...formData, available_days_per_week: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nivel de Fitness</Label>
                  <Select
                    value={formData.fitness_level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, fitness_level: value })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu nivel" />
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
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu objetivo" />
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
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Edad</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Metas Nutricionales Diarias</h4>
                  <Badge variant="secondary" className="text-xs">Calculado automáticamente</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Estos valores se calculan automáticamente según tu perfil (edad, peso, altura, días de entrenamiento, nivel y objetivo).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Calorías (kcal)</Label>
                    <Input
                      type="number"
                      value={formData.daily_calorie_goal}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Proteína (g)</Label>
                    <Input
                      type="number"
                      value={formData.daily_protein_goal}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Carbohidratos (g)</Label>
                    <Input
                      type="number"
                      value={formData.daily_carbs_goal}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grasas (g)</Label>
                    <Input
                      type="number"
                      value={formData.daily_fat_goal}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={!isEditing || loading}>
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
