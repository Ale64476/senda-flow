import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Step6Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const OnboardingStep6 = ({ data, onChange }: Step6Props) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Progreso Inicial</h2>
        <p className="text-muted-foreground">Establece tu punto de partida</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-4">
            Medidas Iniciales (opcional)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="waist">Cintura (cm)</Label>
              <Input
                id="waist"
                type="number"
                value={data.initial_waist || ""}
                onChange={(e) => onChange("initial_waist", e.target.value)}
                placeholder="Ej: 80"
              />
            </div>
            <div>
              <Label htmlFor="chest">Pecho (cm)</Label>
              <Input
                id="chest"
                type="number"
                value={data.initial_chest || ""}
                onChange={(e) => onChange("initial_chest", e.target.value)}
                placeholder="Ej: 95"
              />
            </div>
            <div>
              <Label htmlFor="arms">Brazos (cm)</Label>
              <Input
                id="arms"
                type="number"
                value={data.initial_arms || ""}
                onChange={(e) => onChange("initial_arms", e.target.value)}
                placeholder="Ej: 35"
              />
            </div>
            <div>
              <Label htmlFor="legs">Piernas (cm)</Label>
              <Input
                id="legs"
                type="number"
                value={data.initial_legs || ""}
                onChange={(e) => onChange("initial_legs", e.target.value)}
                placeholder="Ej: 55"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="motivation">Motivación Personal o Frase Meta (opcional)</Label>
          <Textarea
            id="motivation"
            value={data.motivation_phrase || ""}
            onChange={(e) => onChange("motivation_phrase", e.target.value)}
            placeholder="Ej: Quiero sentirme más fuerte y saludable cada día"
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            La IA usará esto para enviarte notificaciones motivacionales personalizadas
          </p>
        </div>
      </div>
    </div>
  );
};
