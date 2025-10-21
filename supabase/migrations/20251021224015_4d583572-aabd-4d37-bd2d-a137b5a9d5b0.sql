-- Eliminar el trigger que causa el error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar la función del trigger
DROP FUNCTION IF EXISTS public.handle_new_user();

-- El user_role se creará desde la aplicación junto con el perfil