import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface Step3Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const OnboardingStep3 = ({ data, onChange }: Step3Props) => {
  const conditions = [
    "hipotiroidismo",
    "diabetes",
    "hipertension",
    "sop",
    "depresion",
    "ansiedad",
    "problemas_cardiacos",
    "ninguna"
  ];

  const conditionLabels: Record<string, string> = {
    hipotiroidismo: "Hipotiroidismo",
    diabetes: "Diabetes",
    hipertension: "Hipertensión",
    sop: "SOP (Síndrome de Ovario Poliquístico)",
    depresion: "Depresión",
    ansiedad: "Ansiedad",
    problemas_cardiacos: "Problemas cardíacos",
    ninguna: "Ninguna"
  };

  const toggleCondition = (condition: string) => {
    const current = data.health_conditions || [];
    
    if (condition === "ninguna") {
      onChange("health_conditions", current.includes("ninguna") ? [] : ["ninguna"]);
    } else {
      const filtered = current.filter((c: string) => c !== "ninguna");
      const updated = filtered.includes(condition)
        ? filtered.filter((c: string) => c !== condition)
        : [...filtered, condition];
      onChange("health_conditions", updated);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Salud y Condiciones</h2>
        <p className="text-muted-foreground">Ayúdanos a adaptar tu plan</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>¿Tienes alguna condición o enfermedad diagnosticada?</Label>
          <div className="space-y-2 mt-2">
            {conditions.map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={condition}
                  checked={(data.health_conditions || []).includes(condition)}
                  onCheckedChange={() => toggleCondition(condition)}
                />
                <label htmlFor={condition} className="text-sm cursor-pointer">
                  {conditionLabels[condition]}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="medications">Medicamentos Actuales (opcional)</Label>
          <Textarea
            id="medications"
            value={data.medications || ""}
            onChange={(e) => onChange("medications", e.target.value)}
            placeholder="Lista tus medicamentos actuales"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="injuries">Lesiones o Limitaciones Físicas (opcional)</Label>
          <Textarea
            id="injuries"
            value={data.injuries || ""}
            onChange={(e) => onChange("injuries", e.target.value)}
            placeholder="Describe cualquier lesión o limitación física"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};
