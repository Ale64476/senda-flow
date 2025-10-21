-- Actualizamos el enum fitness_goal para incluir los valores correctos
-- Primero agregamos los nuevos valores al enum existente
ALTER TYPE public.fitness_goal ADD VALUE IF NOT EXISTS 'bajar_grasa';
ALTER TYPE public.fitness_goal ADD VALUE IF NOT EXISTS 'ganar_masa';
ALTER TYPE public.fitness_goal ADD VALUE IF NOT EXISTS 'rendimiento';