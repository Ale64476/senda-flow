-- Permitir que los usuarios creen su propio rol durante el registro
CREATE POLICY "Users can insert own role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);