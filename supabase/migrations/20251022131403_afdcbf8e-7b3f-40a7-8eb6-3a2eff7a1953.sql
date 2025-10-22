-- Rename plan_id to id in predesigned_plans table to match standard convention
ALTER TABLE public.predesigned_plans 
RENAME COLUMN plan_id TO id;

COMMENT ON COLUMN public.predesigned_plans.id IS 'Unique identifier for the predesigned plan';