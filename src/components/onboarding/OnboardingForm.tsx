import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";
import { OnboardingStep4 } from "./OnboardingStep4";
import { OnboardingStep5 } from "./OnboardingStep5";
import { OnboardingStep6 } from "./OnboardingStep6";
import { OnboardingStep7 } from "./OnboardingStep7";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const OnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const navigate = useNavigate();

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.accept_terms) {
      toast.error("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Error: Usuario no autenticado");
        return;
      }

      // Save basic profile data that exists in current schema
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          age: parseInt(formData.age) || null,
          height: parseFloat(formData.height) || null,
          weight: parseFloat(formData.weight) || null,
          fitness_goal: formData.fitness_goal,
          fitness_level: formData.fitness_level,
          daily_calorie_goal: parseInt(formData.daily_calorie_goal) || 2000,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("¡Perfil completado! Bienvenido a SendaFit");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Error al guardar tu perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingStep1 data={formData} onChange={handleChange} />;
      case 2:
        return <OnboardingStep2 data={formData} onChange={handleChange} />;
      case 3:
        return <OnboardingStep3 data={formData} onChange={handleChange} />;
      case 4:
        return <OnboardingStep4 data={formData} onChange={handleChange} />;
      case 5:
        return <OnboardingStep5 data={formData} onChange={handleChange} />;
      case 6:
        return <OnboardingStep6 data={formData} onChange={handleChange} />;
      case 7:
        return <OnboardingStep7 data={formData} onChange={handleChange} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.full_name && formData.age && formData.sex && formData.height && formData.weight;
      case 2:
        return formData.fitness_goal && formData.fitness_level && formData.days_per_week;
      case 7:
        return formData.accept_terms;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Paso {currentStep} de {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mb-8">
          {renderStep()}
        </div>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
            >
              {loading ? "Guardando..." : "Completar Registro"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
