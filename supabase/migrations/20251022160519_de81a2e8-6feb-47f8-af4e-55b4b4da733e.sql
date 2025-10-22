-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view predesigned plans" ON public.predesigned_plans;

-- Create new policy for authenticated users only
CREATE POLICY "Authenticated users can view predesigned plans"
ON public.predesigned_plans
FOR SELECT
TO authenticated
USING (true);