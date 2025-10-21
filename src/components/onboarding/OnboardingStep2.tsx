import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Step2Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const OnboardingStep2 = ({ data, onChange }: Step2Props) => {
  const trainingTypes = ["gimnasio", "casa", "funcional", "cardio", "mixto"];

  const toggleTrainingType = (type: string) => {
    const current = data.training_types || [];
    const updated = current.includes(type)
      ? current.filter((t: string) => t !== type)
      : [...current, type];
    onChange("training_types", updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Objetivos y Nivel</h2>
        <p className="text-muted-foreground">Define tus metas de entrenamiento</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fitness_goal">Objetivo Principal</Label>
          <Select value={data.fitness_goal || ""} onValueChange={(value) => onChange("fitness_goal", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="perder_peso">Bajar grasa</SelectItem>
              <SelectItem value="ganar_musculo">Ganar masa muscular</SelectItem>
              <SelectItem value="mantener_peso">Mantener peso</SelectItem>
              <SelectItem value="mejorar_resistencia">Mejorar rendimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fitness_level">Nivel Actual</Label>
          <Select value={data.fitness_level || ""} onValueChange={(value) => onChange("fitness_level", value)}>
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

        <div>
          <Label>Tipo de Entrenamiento Preferido</Label>
          <div className="space-y-2 mt-2">
            {trainingTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={(data.training_types || []).includes(type)}
                  onCheckedChange={() => toggleTrainingType(type)}
                />
                <label htmlFor={type} className="text-sm capitalize cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="days_per_week">Días Disponibles por Semana</Label>
          <Select value={data.days_per_week?.toString() || ""} onValueChange={(value) => onChange("days_per_week", parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona días" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day} {day === 1 ? "día" : "días"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="session_duration">Duración Promedio por Sesión (minutos)</Label>
          <Input
            id="session_duration"
            type="number"
            value={data.session_duration || ""}
            onChange={(e) => onChange("session_duration", e.target.value)}
            placeholder="Ej: 60"
          />
        </div>
      </div>
    </div>
  );
};
