import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface OnboardingStep4Props {
  formData: any;
  updateFormData: (data: any) => void;
}

const trackingApps = [
  { id: "flo", label: "Flo" },
  { id: "clue", label: "Clue" },
  { id: "fitbit", label: "Fitbit Cycle" },
  { id: "apple_health", label: "Apple Health" },
  { id: "otro", label: "Otra app" }
];

const OnboardingStep4 = ({ formData, updateFormData }: OnboardingStep4Props) => {
  // Solo mostrar esta pantalla si el género es femenino
  if (formData.gender !== "femenino") {
    return (
      <div className="space-y-6 animate-fade-in flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Esta sección solo aplica para usuarios femeninos.
          </p>
          <p className="text-sm text-muted-foreground">
            Puedes continuar al siguiente paso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Seguimiento Menstrual</h2>
        <p className="text-muted-foreground">Optimiza tu entrenamiento según tu ciclo</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="menstrualTracking" className="text-base">
              ¿Deseas conectar tu seguimiento menstrual?
            </Label>
            <p className="text-sm text-muted-foreground">
              La IA ajustará tu entrenamiento según tu ciclo
            </p>
          </div>
          <Switch
            id="menstrualTracking"
            checked={formData.menstrualTracking || false}
            onCheckedChange={(checked) => updateFormData({ menstrualTracking: checked })}
          />
        </div>

        {formData.menstrualTracking && (
          <>
            <div className="space-y-2">
              <Label htmlFor="trackingApp">App de seguimiento</Label>
              <Select
                value={formData.trackingApp || ""}
                onValueChange={(value) => updateFormData({ trackingApp: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu app" />
                </SelectTrigger>
                <SelectContent>
                  {trackingApps.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoSync"
                checked={formData.autoSync || false}
                onCheckedChange={(checked) => updateFormData({ autoSync: checked })}
              />
              <Label htmlFor="autoSync" className="cursor-pointer font-normal">
                Sincronizar datos automáticamente
              </Label>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">La IA usará esta información para:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
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

export default OnboardingStep4;
