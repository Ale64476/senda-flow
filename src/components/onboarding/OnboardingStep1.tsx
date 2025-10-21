import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step1Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const OnboardingStep1 = ({ data, onChange }: Step1Props) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Datos Personales</h2>
        <p className="text-muted-foreground">Cuéntanos un poco sobre ti</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">Nombre Completo</Label>
          <Input
            id="full_name"
            value={data.full_name || ""}
            onChange={(e) => onChange("full_name", e.target.value)}
            placeholder="Tu nombre completo"
          />
        </div>

        <div>
          <Label htmlFor="age">Edad</Label>
          <Input
            id="age"
            type="number"
            value={data.age || ""}
            onChange={(e) => onChange("age", e.target.value)}
            placeholder="Tu edad"
          />
        </div>

        <div>
          <Label htmlFor="sex">Sexo</Label>
          <Select value={data.sex || ""} onValueChange={(value) => onChange("sex", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="femenino">Femenino</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            id="height"
            type="number"
            value={data.height || ""}
            onChange={(e) => onChange("height", e.target.value)}
            placeholder="Tu altura en centímetros"
          />
        </div>

        <div>
          <Label htmlFor="weight">Peso Actual (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={data.weight || ""}
            onChange={(e) => onChange("weight", e.target.value)}
            placeholder="Tu peso en kilogramos"
          />
        </div>
      </div>
    </div>
  );
};
