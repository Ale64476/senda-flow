import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Step4Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const OnboardingStep4 = ({ data, onChange }: Step4Props) => {
  if (data.sex !== "femenino") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Esta sección solo aplica para usuarios femeninos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Seguimiento Menstrual</h2>
        <p className="text-muted-foreground">Optimiza tu entrenamiento según tu ciclo</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="menstrual_tracking">¿Deseas conectar tu seguimiento menstrual?</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Ajustaremos tu plan según tu ciclo menstrual
            </p>
          </div>
          <Switch
            id="menstrual_tracking"
            checked={data.menstrual_tracking_enabled || false}
            onCheckedChange={(checked) => onChange("menstrual_tracking_enabled", checked)}
          />
        </div>

        {data.menstrual_tracking_enabled && (
          <>
            <div>
              <Label htmlFor="tracking_app">App de Seguimiento</Label>
              <Select value={data.tracking_app || ""} onValueChange={(value) => onChange("tracking_app", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu app" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flo">Flo</SelectItem>
                  <SelectItem value="clue">Clue</SelectItem>
                  <SelectItem value="fitbit">Fitbit Cycle</SelectItem>
                  <SelectItem value="apple_health">Apple Health</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto_sync"
                checked={data.menstrual_auto_sync || false}
                onCheckedChange={(checked) => onChange("menstrual_auto_sync", checked)}
              />
              <label htmlFor="auto_sync" className="text-sm cursor-pointer">
                Sincronizar datos automáticamente
              </label>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                La IA usará esta información para:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Ajustar volumen de entrenamiento según fase del ciclo</li>
                <li>Adaptar recomendaciones de nutrición</li>
                <li>Evitar sobrecarga durante días de baja energía</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
