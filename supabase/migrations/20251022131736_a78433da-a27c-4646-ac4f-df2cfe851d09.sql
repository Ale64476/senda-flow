-- Adjust exercises table to allow CSV import
-- Make columns that aren't in the CSV nullable or provide defaults

ALTER TABLE public.exercises 
ALTER COLUMN lugar DROP NOT NULL,
ALTER COLUMN objetivo DROP NOT NULL;

-- Add default values for better data integrity
ALTER TABLE public.exercises 
ALTER COLUMN lugar SET DEFAULT 'casa',
ALTER COLUMN objetivo SET DEFAULT 'tonificar';

COMMENT ON COLUMN public.exercises.lugar IS 'Training location (casa/gimnasio/parque) - defaults to casa if not specified';
COMMENT ON COLUMN public.exercises.objetivo IS 'Training objective - defaults to tonificar if not specified';