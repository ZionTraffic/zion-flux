-- Fix 1: Remove recursive RLS policy on user_roles and replace with non-recursive version
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'owner'::app_role) OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);