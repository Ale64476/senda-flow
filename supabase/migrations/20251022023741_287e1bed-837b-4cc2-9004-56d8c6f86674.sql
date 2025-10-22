-- Add assigned_routine_id to profiles table
ALTER TABLE public.profiles
ADD COLUMN assigned_routine_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL;

-- Create progress_tracking table
CREATE TABLE public.progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC,
  body_measurements JSONB,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  menstrual_phase TEXT,
  notes TEXT,
  exercises_completed JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on progress_tracking
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for progress_tracking
CREATE POLICY "Users can view own progress"
ON public.progress_tracking
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON public.progress_tracking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.progress_tracking
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
ON public.progress_tracking
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for progress_tracking updated_at
CREATE TRIGGER update_progress_tracking_updated_at
BEFORE UPDATE ON public.progress_tracking
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add index for better query performance
CREATE INDEX idx_progress_tracking_user_date ON public.progress_tracking(user_id, date DESC);
CREATE INDEX idx_profiles_assigned_routine ON public.profiles(assigned_routine_id);