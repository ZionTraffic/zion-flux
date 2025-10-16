-- Adicionar policy na tabela workspaces para permitir visualização do nome
-- quando consultado via pending_invites (para aceitar convites)
CREATE POLICY "Anyone can view workspace name from pending invites"
ON public.workspaces
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.pending_invites
    WHERE pending_invites.workspace_id = workspaces.id
      AND pending_invites.used_at IS NULL
      AND pending_invites.expires_at > now()
  )
);