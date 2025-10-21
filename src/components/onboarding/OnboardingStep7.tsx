import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Step7Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const OnboardingStep7 = ({ data, onChange }: Step7Props) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Preferencias de App</h2>
        <p className="text-muted-foreground">Personaliza tu experiencia</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="theme">Tema de Interfaz</Label>
          <Select value={data.theme || "auto"} onValueChange={(value) => onChange("theme", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Oscuro</SelectItem>
              <SelectItem value="auto">Automático</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="notifications">Activar Notificaciones</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Recordatorios y actualizaciones de progreso
            </p>
          </div>
          <Switch
            id="notifications"
            checked={data.notifications_enabled || false}
            onCheckedChange={(checked) => onChange("notifications_enabled", checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="wearables">Sincronización con Wearables</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Google Fit, Apple Health, Fitbit, etc.
            </p>
          </div>
          <Switch
            id="wearables"
            checked={data.wearables_sync || false}
            onCheckedChange={(checked) => onChange("wearables_sync", checked)}
          />
        </div>

        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={data.accept_terms || false}
              onCheckedChange={(checked) => onChange("accept_terms", checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm cursor-pointer leading-tight">
              Acepto los términos y condiciones de uso y la política de privacidad de SendaFit
            </label>
          </div>
        </div>

        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm font-medium mb-2">🎉 ¡Casi listo!</p>
          <p className="text-sm text-muted-foreground">
            Una vez completes el registro, SendaFit creará tu plan personalizado basado en toda la información que proporcionaste.
          </p>
        </div>
      </div>
    </div>
  );
};
