import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import OnboardingStep1 from "./OnboardingStep1";
import OnboardingStep2 from "./OnboardingStep2";
import OnboardingStep3 from "./OnboardingStep3";
import OnboardingStep4 from "./OnboardingStep4";
import OnboardingStep5 from "./OnboardingStep5";
import OnboardingStep6 from "./OnboardingStep6";
import OnboardingStep7 from "./OnboardingStep7";

const OnboardingForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName || !formData.age || !formData.gender || !formData.height || !formData.weight) {
          toast.error("Por favor completa todos los campos obligatorios");
          return false;
        }
        break;
      case 2:
        if (!formData.primaryGoal || !formData.fitnessLevel) {
          toast.error("Por favor selecciona tu objetivo y nivel");
          return false;
        }
        break;
      case 7:
        if (!formData.termsAccepted) {
          toast.error("Debes aceptar los términos y condiciones");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
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
    if (!validateStep()) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuario no autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          fitness_level: formData.fitnessLevel,
          fitness_goal: formData.primaryGoal,
          primary_goal: formData.primaryGoal,
          training_types: formData.trainingTypes || [],
          available_days_per_week: formData.availableDays,
          session_duration_minutes: formData.sessionDuration,
          health_conditions: formData.healthConditions || [],
          current_medications: formData.medications,
          injuries_limitations: formData.injuries,
          menstrual_tracking_enabled: formData.menstrualTracking || false,
          menstrual_tracking_app: formData.trackingApp,
          menstrual_auto_sync: formData.autoSync || false,
          dietary_preferences: formData.dietaryPreferences || [],
          allergies_restrictions: formData.allergies,
          current_calorie_intake: formData.currentCalories,
          average_sleep_hours: formData.sleepHours,
          stress_level: formData.stressLevel,
          initial_measurements: {
            waist: formData.waist,
            chest: formData.chest,
            arms: formData.arms,
            legs: formData.legs
          },
          motivation_phrase: formData.motivation,
          theme_preference: formData.theme || 'auto',
          notifications_enabled: formData.notifications ?? true,
          wearables_sync_enabled: formData.wearables || false,
          terms_accepted: formData.termsAccepted,
          onboarding_completed: true
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("¡Perfil completado! Bienvenida a SendaFit");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const stepProps = { formData, updateFormData };
    
    switch (currentStep) {
      case 1: return <OnboardingStep1 {...stepProps} />;
      case 2: return <OnboardingStep2 {...stepProps} />;
      case 3: return <OnboardingStep3 {...stepProps} />;
      case 4: return <OnboardingStep4 {...stepProps} />;
      case 5: return <OnboardingStep5 {...stepProps} />;
      case 6: return <OnboardingStep6 {...stepProps} />;
      case 7: return <OnboardingStep7 {...stepProps} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Paso {currentStep} de {totalSteps}
            </p>
            <p className="text-sm font-medium">{Math.round(progress)}%</p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="bg-card border rounded-lg p-6 min-h-[500px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          {currentStep < totalSteps ? (
            <Button onClick={handleNext} className="flex-1">
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !formData.termsAccepted}
              className="flex-1"
            >
              {loading ? "Guardando..." : "Finalizar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
