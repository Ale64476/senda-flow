import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Exercise {
  id: string;
  nombre: string;
  descripcion: string;
  grupo_muscular: string;
  lugar: string;
  nivel: string;
  calorias_por_repeticion?: number;
}

interface ConfiguredExercise {
  exercise: Exercise;
  series: number;
  repeticiones: number;
  peso: number;
  estimatedCalories: number;
}

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExercise: (exercise: ConfiguredExercise) => void;
  location: string;
}

export const AddExerciseDialog = ({ open, onOpenChange, onAddExercise, location }: AddExerciseDialogProps) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [series, setSeries] = useState("3");
  const [repeticiones, setRepeticiones] = useState("10");
  const [peso, setPeso] = useState("0");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [estimatedCalories, setEstimatedCalories] = useState(0);

  useEffect(() => {
    fetchExercises();
    fetchUserProfile();
  }, [location]);

  const fetchExercises = async () => {
    // Para exterior, mostramos ejercicios de casa (se pueden hacer afuera)
    const filterLocation = location === "exterior" ? "casa" : location;
    
    const { data } = await supabase
      .from("exercises")
      .select("*")
      .eq("lugar", filterLocation)
      .order("nombre");
    
    setExercises(data || []);
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("weight, fitness_level")
      .eq("id", user.id)
      .single();
    
    setUserProfile(data);
  };

  const calculateCalories = () => {
    if (!selectedExercise || !userProfile?.weight) return 0;

    // Datos base
    const caloriasPorRepeticion = selectedExercise.calorias_por_repeticion || 0.3;
    const userWeight = userProfile.weight;
    const loadWeight = parseFloat(peso) || 0;
    const reps = parseInt(repeticiones) || 1;
    const sets = parseInt(series) || 1;

    // Factor de nivel
    const levelFactor = {
      'principiante': 1.0,
      'intermedio': 1.2,
      'avanzado': 1.5
    }[userProfile.fitness_level] || 1.0;

    // Factor de carga (porcentaje del peso corporal que se está levantando)
    const loadPercentage = loadWeight / userWeight;
    const loadFactor = 1 + (loadPercentage * 0.5); // Ajuste: 50% adicional por cada 100% del peso corporal

    // Calorías ajustadas por repetición
    const adjustedCaloriesPerRep = caloriasPorRepeticion * levelFactor * loadFactor;

    // Total de calorías
    const totalCalories = adjustedCaloriesPerRep * reps * sets;

    return Math.round(totalCalories);
  };

  useEffect(() => {
    if (selectedExercise) {
      setEstimatedCalories(calculateCalories());
    }
  }, [selectedExercise, series, repeticiones, peso, userProfile]);

  const handleAdd = () => {
    if (!selectedExercise) return;

    onAddExercise({
      exercise: selectedExercise,
      series: parseInt(series),
      repeticiones: parseInt(repeticiones),
      peso: parseFloat(peso),
      estimatedCalories
    });

    // Reset form
    setSelectedExercise(null);
    setSeries("3");
    setRepeticiones("10");
    setPeso("0");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Ejercicio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Ejercicio</Label>
            <Select
              value={selectedExercise?.id}
              onValueChange={(value) => {
                const exercise = exercises.find(e => e.id === value);
                setSelectedExercise(exercise || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ejercicio" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedExercise && (
            <>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">{selectedExercise.nombre}</p>
                <p className="text-muted-foreground text-xs">{selectedExercise.descripcion}</p>
                <p className="text-xs mt-2">
                  <span className="font-medium">Grupo muscular:</span> {selectedExercise.grupo_muscular}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Series</Label>
                  <Input
                    type="number"
                    min="1"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Repeticiones</Label>
                  <Input
                    type="number"
                    min="1"
                    value={repeticiones}
                    onChange={(e) => setRepeticiones(e.target.value)}
                  />
                </div>
              </div>

              {location === "gimnasio" && (
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                  />
                </div>
              )}

              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium mb-1">Calorías Estimadas</p>
                <p className="text-2xl font-bold text-primary">{estimatedCalories} kcal</p>
              </div>

              <Button onClick={handleAdd} className="w-full">
                Agregar Ejercicio
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
