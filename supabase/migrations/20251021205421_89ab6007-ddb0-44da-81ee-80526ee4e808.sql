-- Agregar nuevos campos a la tabla profiles para el formulario completo de onboarding

-- Sección 1: Datos personales básicos (edad ya existe, añadimos los demás)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('masculino', 'femenino')),
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Sección 2: Objetivos y nivel
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS primary_goal text,
ADD COLUMN IF NOT EXISTS training_types text[], -- Array para múltiples opciones
ADD COLUMN IF NOT EXISTS available_days_per_week integer CHECK (available_days_per_week >= 1 AND available_days_per_week <= 7),
ADD COLUMN IF NOT EXISTS session_duration_minutes integer;

-- Sección 3: Salud y condiciones fisiológicas
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS health_conditions text[], -- Array para múltiples condiciones
ADD COLUMN IF NOT EXISTS current_medications text,
ADD COLUMN IF NOT EXISTS injuries_limitations text;

-- Sección 4: Seguimiento menstrual
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS menstrual_tracking_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS menstrual_tracking_app text,
ADD COLUMN IF NOT EXISTS menstrual_auto_sync boolean DEFAULT false;

-- Sección 5: Nutrición y hábitos
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dietary_preferences text[], -- Array para múltiples preferencias
ADD COLUMN IF NOT EXISTS allergies_restrictions text,
ADD COLUMN IF NOT EXISTS current_calorie_intake integer,
ADD COLUMN IF NOT EXISTS average_sleep_hours numeric(3,1),
ADD COLUMN IF NOT EXISTS stress_level integer CHECK (stress_level >= 1 AND stress_level <= 5);

-- Sección 6: Progreso inicial y motivación
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS initial_measurements jsonb, -- {waist, chest, arms, legs}
ADD COLUMN IF NOT EXISTS initial_photo_url text,
ADD COLUMN IF NOT EXISTS motivation_phrase text;

-- Sección 7: Preferencias de app
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'auto' CHECK (theme_preference IN ('light', 'dark', 'auto')),
ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS wearables_sync_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false;