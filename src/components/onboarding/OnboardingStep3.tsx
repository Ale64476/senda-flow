import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface OnboardingStep3Props {
  formData: any;
  updateFormData: (data: any) => void;
}

const healthConditions = [
  { id: "hipotiroidismo", label: "Hipotiroidismo" },
  { id: "diabetes", label: "Diabetes" },
  { id: "hipertension", label: "Hipertensión" },
  { id: "sop", label: "SOP (Síndrome de Ovario Poliquístico)" },
  { id: "depresion", label: "Depresión" },
  { id: "ansiedad", label: "Ansiedad" },
  { id: "problemas_cardiacos", label: "Problemas cardíacos" },
  { id: "ninguna", label: "Ninguna" }
];

const OnboardingStep3 = ({ formData, updateFormData }: OnboardingStep3Props) => {
  const toggleCondition = (condition: string) => {
    let current = formData.healthConditions || [];
    
    if (condition === "ninguna") {
      updateFormData({ healthConditions: ["ninguna"] });
      return;
    }
    
    current = current.filter((c: string) => c !== "ninguna");
    
    const updated = current.includes(condition)
      ? current.filter((c: string) => c !== condition)
      : [...current, condition];
    
    updateFormData({ healthConditions: updated.length ? updated : ["ninguna"] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Salud y Condiciones</h2>
        <p className="text-muted-foreground">Información importante para tu plan</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label>¿Tienes alguna condición o enfermedad diagnosticada?</Label>
          {healthConditions.map((condition) => (
            <div key={condition.id} className="flex items-center space-x-2">
              <Checkbox
                id={condition.id}
                checked={formData.healthConditions?.includes(condition.id) || false}
                onCheckedChange={() => toggleCondition(condition.id)}
              />
              <Label htmlFor={condition.id} className="cursor-pointer font-normal">
                {condition.label}
              </Label>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="medications">Medicamentos actuales (opcional)</Label>
          <Textarea
            id="medications"
            value={formData.medications || ""}
            onChange={(e) => updateFormData({ medications: e.target.value })}
            placeholder="Lista los medicamentos que tomas actualmente"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="injuries">Lesiones o limitaciones físicas (opcional)</Label>
          <Textarea
            id="injuries"
            value={formData.injuries || ""}
            onChange={(e) => updateFormData({ injuries: e.target.value })}
            placeholder="Describe cualquier lesión o limitación física"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep3;
