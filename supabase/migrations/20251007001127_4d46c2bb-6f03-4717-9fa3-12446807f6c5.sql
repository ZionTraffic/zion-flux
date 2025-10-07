-- Fix infinite recursion in membros_workspace RLS policies
-- Create a security definer function to check workspace membership

CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.membros_workspace
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
  )
$$;

-- Drop existing recursive policies on membros_workspace
DROP POLICY IF EXISTS "Users can view workspace members" ON public.membros_workspace;
DROP POLICY IF EXISTS "insert_workspace_members" ON public.membros_workspace;
DROP POLICY IF EXISTS "update_workspace_members" ON public.membros_workspace;
DROP POLICY IF EXISTS "delete_workspace_members" ON public.membros_workspace;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view workspace members"
ON public.membros_workspace
FOR SELECT
USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "insert_workspace_members"
ON public.membros_workspace
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.membros_workspace wm
    WHERE wm.workspace_id = membros_workspace.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "update_workspace_members"
ON public.membros_workspace
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.membros_workspace wm
    WHERE wm.workspace_id = membros_workspace.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.membros_workspace wm
    WHERE wm.workspace_id = membros_workspace.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "delete_workspace_members"
ON public.membros_workspace
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.membros_workspace wm
    WHERE wm.workspace_id = membros_workspace.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'owner'
  )
);