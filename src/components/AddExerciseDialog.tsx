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
  tipo_entrenamiento: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchExercises();
    fetchUserProfile();
  }, []);

  const fetchExercises = async () => {
    // Traer TODOS los ejercicios sin filtrar por ubicación
    const { data } = await supabase
      .from("exercises")
      .select("*")
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

  // Filtrar ejercicios basado en búsqueda y filtros
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup = !muscleGroupFilter || muscleGroupFilter === "all" || exercise.grupo_muscular === muscleGroupFilter;
    
    // Lógica de nivel: B=principiante, I=intermedio, P=avanzado
    // Principiante: solo B
    // Intermedio: B o I
    // Avanzado: B, I o P (todos)
    let matchesLevel = true;
    if (levelFilter && levelFilter !== "all") {
      if (levelFilter === "principiante") {
        matchesLevel = exercise.nivel === "B";
      } else if (levelFilter === "intermedio") {
        matchesLevel = exercise.nivel === "B" || exercise.nivel === "I";
      } else if (levelFilter === "avanzado") {
        matchesLevel = exercise.nivel === "B" || exercise.nivel === "I" || exercise.nivel === "P";
      }
    }
    
    const matchesType = !typeFilter || typeFilter === "all" || exercise.tipo_entrenamiento === typeFilter;
    
    return matchesSearch && matchesMuscleGroup && matchesLevel && matchesType;
  });

  // Obtener valores únicos para los filtros
  const uniqueMuscleGroups = Array.from(new Set(exercises.map(e => e.grupo_muscular))).sort();
  const uniqueLevels = Array.from(new Set(exercises.map(e => e.nivel))).sort();
  const uniqueTypes = Array.from(new Set(exercises.map(e => e.tipo_entrenamiento))).sort();

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
    setSearchTerm("");
    setMuscleGroupFilter("all");
    setLevelFilter("all");
    setTypeFilter("all");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Ejercicio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Buscador */}
          <div className="space-y-2">
            <Label>Buscar ejercicio</Label>
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Grupo muscular</Label>
              <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueMuscleGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nivel</Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Tipo de ejercicio</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selector de ejercicio */}
          <div className="space-y-2">
            <Label>Ejercicio ({filteredExercises.length} disponibles)</Label>
            <Select
              value={selectedExercise?.id}
              onValueChange={(value) => {
                const exercise = filteredExercises.find(e => e.id === value);
                setSelectedExercise(exercise || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ejercicio" />
              </SelectTrigger>
              <SelectContent>
                {filteredExercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.nombre} - {exercise.grupo_muscular}
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
