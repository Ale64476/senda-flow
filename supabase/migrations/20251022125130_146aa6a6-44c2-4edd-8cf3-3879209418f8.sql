-- Add available_weekdays column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN available_weekdays integer[] DEFAULT NULL;

COMMENT ON COLUMN public.profiles.available_weekdays IS 'Specific weekdays available for training (1=Monday, 2=Tuesday, ..., 7=Sunday)';