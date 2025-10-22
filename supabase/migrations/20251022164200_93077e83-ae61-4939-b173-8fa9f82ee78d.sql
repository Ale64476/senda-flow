-- Eliminar la foreign key incorrecta que apunta a workouts
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_assigned_routine_id_fkey;

-- Cambiar el tipo de assigned_routine_id de uuid a text para que coincida con predesigned_plans.id
ALTER TABLE profiles ALTER COLUMN assigned_routine_id TYPE text USING assigned_routine_id::text;

-- Añadir la foreign key correcta que apunta a predesigned_plans
ALTER TABLE profiles 
ADD CONSTRAINT profiles_assigned_routine_id_fkey 
FOREIGN KEY (assigned_routine_id) 
REFERENCES predesigned_plans(id) 
ON DELETE SET NULL;

COMMENT ON COLUMN profiles.assigned_routine_id IS 'ID del plan prediseñado asignado (referencia a predesigned_plans.id)';