import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface Step5Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const OnboardingStep5 = ({ data, onChange }: Step5Props) => {
  const dietPreferences = [
    { value: "normal", label: "Normal" },
    { value: "vegano", label: "Vegano" },
    { value: "vegetariano", label: "Vegetariano" },
    { value: "keto", label: "Keto" },
    { value: "paleo", label: "Paleo" }
  ];

  const toggleDietPreference = (pref: string) => {
    const current = data.diet_preferences || [];
    const updated = current.includes(pref)
      ? current.filter((p: string) => p !== pref)
      : [...current, pref];
    onChange("diet_preferences", updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Nutrición y Hábitos</h2>
        <p className="text-muted-foreground">Tu alimentación y estilo de vida</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Preferencias Alimenticias</Label>
          <div className="space-y-2 mt-2">
            {dietPreferences.map((pref) => (
              <div key={pref.value} className="flex items-center space-x-2">
                <Checkbox
                  id={pref.value}
                  checked={(data.diet_preferences || []).includes(pref.value)}
                  onCheckedChange={() => toggleDietPreference(pref.value)}
                />
                <label htmlFor={pref.value} className="text-sm cursor-pointer">
                  {pref.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="allergies">Alergias o Restricciones (opcional)</Label>
          <Textarea
            id="allergies"
            value={data.allergies || ""}
            onChange={(e) => onChange("allergies", e.target.value)}
            placeholder="Ej: Lactosa, gluten, frutos secos..."
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="daily_calories">Consumo Calórico Actual (si lo sabes)</Label>
          <Input
            id="daily_calories"
            type="number"
            value={data.daily_calorie_goal || ""}
            onChange={(e) => onChange("daily_calorie_goal", e.target.value)}
            placeholder="Ej: 2000"
          />
        </div>

        <div>
          <Label htmlFor="sleep_hours">Horas de Sueño Promedio por Noche</Label>
          <Input
            id="sleep_hours"
            type="number"
            step="0.5"
            value={data.sleep_hours || ""}
            onChange={(e) => onChange("sleep_hours", e.target.value)}
            placeholder="Ej: 7.5"
          />
        </div>

        <div>
          <Label htmlFor="stress_level">Nivel de Estrés Percibido</Label>
          <div className="mt-4">
            <Slider
              value={[data.stress_level || 3]}
              onValueChange={(value) => onChange("stress_level", value[0])}
              max={5}
              min={1}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Bajo (1)</span>
              <span>Medio (3)</span>
              <span>Alto (5)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
