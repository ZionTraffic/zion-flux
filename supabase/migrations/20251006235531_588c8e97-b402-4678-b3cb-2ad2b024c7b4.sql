-- Corrigir função get_user_workspaces para usar o nome correto da tabela
DROP FUNCTION IF EXISTS public.get_user_workspaces(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_workspaces(_user_id uuid)
RETURNS TABLE(workspace_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select workspace_id
  from public.membros_workspace
  where user_id = _user_id;
$$;