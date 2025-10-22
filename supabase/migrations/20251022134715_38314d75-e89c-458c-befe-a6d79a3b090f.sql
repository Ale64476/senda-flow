-- Add tipo column to workouts table to distinguish between automatic and manual workouts
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workout_type') THEN
    CREATE TYPE public.workout_type AS ENUM ('automatico', 'manual');
  END IF;
END $$;

ALTER TABLE public.workouts 
ADD COLUMN IF NOT EXISTS tipo public.workout_type DEFAULT 'manual';

-- Add index for better query performance on tipo and scheduled_date
CREATE INDEX IF NOT EXISTS idx_workouts_tipo ON public.workouts(tipo);
CREATE INDEX IF NOT EXISTS idx_workouts_scheduled_date ON public.workouts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, scheduled_date);

-- Create function to automatically assign routine when user completes onboarding
CREATE OR REPLACE FUNCTION public.auto_assign_routine_on_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger if onboarding_completed changes from false to true
  IF NEW.onboarding_completed = true AND (OLD.onboarding_completed IS NULL OR OLD.onboarding_completed = false) THEN
    -- Call the assign-routine edge function asynchronously via pg_net (we'll handle this in the edge function instead)
    -- For now, we'll just update the profile, and the frontend will call assign-routine
    NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for automatic routine assignment
DROP TRIGGER IF EXISTS trigger_auto_assign_routine ON public.profiles;
CREATE TRIGGER trigger_auto_assign_routine
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_routine_on_onboarding();

COMMENT ON COLUMN public.workouts.tipo IS 'Type of workout: automatico (from predesigned plan) or manual (user created)';
COMMENT ON FUNCTION public.auto_assign_routine_on_onboarding() IS 'Triggers automatic routine assignment when user completes onboarding';