-- Modify predesigned_plans table to accommodate CSV data
-- Make ejercicios_ids_ordenados nullable since CSV doesn't include exercises
ALTER TABLE public.predesigned_plans 
ALTER COLUMN ejercicios_ids_ordenados DROP NOT NULL,
ALTER COLUMN ejercicios_ids_ordenados SET DEFAULT '[]'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.predesigned_plans.ejercicios_ids_ordenados IS 'Array of exercise IDs in order - can be empty for plans without assigned exercises yet';
COMMENT ON COLUMN public.predesigned_plans.nivel IS 'B = Principiante/Básico, I = Intermedio, P = Profesional/Avanzado';
COMMENT ON COLUMN public.predesigned_plans.objetivo IS 'Can contain multiple objectives separated by commas (e.g., "Ganar Masa, Perder Grasa, Definir, Mantener" or single like "Fuerza")';