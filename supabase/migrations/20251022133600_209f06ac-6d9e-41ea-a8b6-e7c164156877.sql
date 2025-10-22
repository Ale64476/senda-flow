-- Create plan_ejercicios table to link exercises to predesigned plans
CREATE TABLE public.plan_ejercicios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES public.predesigned_plans(id) ON DELETE CASCADE,
  ejercicio_id TEXT NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  dia INTEGER NOT NULL,
  orden INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_plan_ejercicios_plan_id ON public.plan_ejercicios(plan_id);
CREATE INDEX idx_plan_ejercicios_ejercicio_id ON public.plan_ejercicios(ejercicio_id);
CREATE INDEX idx_plan_ejercicios_plan_dia ON public.plan_ejercicios(plan_id, dia);

-- Enable Row Level Security
ALTER TABLE public.plan_ejercicios ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (predesigned plans are public)
CREATE POLICY "Anyone can view plan exercises"
ON public.plan_ejercicios
FOR SELECT
USING (true);

-- Add comments for clarity
COMMENT ON TABLE public.plan_ejercicios IS 'Links exercises to predesigned workout plans with day and order information';
COMMENT ON COLUMN public.plan_ejercicios.plan_id IS 'Reference to the predesigned plan';
COMMENT ON COLUMN public.plan_ejercicios.ejercicio_id IS 'Reference to the exercise';
COMMENT ON COLUMN public.plan_ejercicios.dia IS 'Day number in the plan (1, 2, 3, etc.)';
COMMENT ON COLUMN public.plan_ejercicios.orden IS 'Order/position of the exercise within that day';