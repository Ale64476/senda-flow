-- Create exercises table
CREATE TABLE public.exercises (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  grupo_muscular TEXT NOT NULL,
  nivel TEXT NOT NULL,
  lugar TEXT NOT NULL,
  objetivo TEXT NOT NULL,
  tipo_entrenamiento TEXT NOT NULL,
  equipamiento TEXT,
  maquina_gym TEXT,
  descripcion TEXT NOT NULL,
  repeticiones_sugeridas INTEGER,
  series_sugeridas INTEGER,
  duracion_promedio_segundos INTEGER,
  calorias_por_repeticion NUMERIC,
  imagen TEXT,
  video TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on exercises
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Everyone can view exercises (reference data)
CREATE POLICY "Anyone can view exercises"
ON public.exercises
FOR SELECT
USING (true);

-- Create pre-designed plans table
CREATE TABLE public.predesigned_plans (
  plan_id TEXT PRIMARY KEY,
  nombre_plan TEXT NOT NULL,
  objetivo TEXT NOT NULL,
  nivel TEXT NOT NULL,
  lugar TEXT NOT NULL,
  dias_semana INTEGER NOT NULL,
  ejercicios_ids_ordenados JSONB NOT NULL,
  descripcion_plan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on predesigned plans
ALTER TABLE public.predesigned_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can view predesigned plans (reference data)
CREATE POLICY "Anyone can view predesigned plans"
ON public.predesigned_plans
FOR SELECT
USING (true);