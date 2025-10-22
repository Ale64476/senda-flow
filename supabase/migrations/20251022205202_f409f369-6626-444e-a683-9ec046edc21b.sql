-- Cambiar el tipo de available_weekdays de integer[] a text[]
ALTER TABLE public.profiles 
ALTER COLUMN available_weekdays TYPE text[] USING available_weekdays::text[];