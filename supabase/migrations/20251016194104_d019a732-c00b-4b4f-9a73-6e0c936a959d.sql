-- Criar tabela de convites pendentes
CREATE TABLE public.pending_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  token text NOT NULL UNIQUE,
  invited_by uuid REFERENCES auth.users(id),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para performance
CREATE INDEX idx_pending_invites_token ON public.pending_invites(token);
CREATE INDEX idx_pending_invites_email ON public.pending_invites(email);
CREATE INDEX idx_pending_invites_workspace ON public.pending_invites(workspace_id);

-- Habilitar RLS
ALTER TABLE public.pending_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem criar convites
CREATE POLICY "Admins can create invites"
ON public.pending_invites
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.membros_workspace
    WHERE workspace_id = pending_invites.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);

-- Policy: Admins podem ver convites do workspace
CREATE POLICY "Admins can view workspace invites"
ON public.pending_invites
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.membros_workspace
    WHERE workspace_id = pending_invites.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);

-- Policy: Admins podem deletar convites
CREATE POLICY "Admins can delete invites"
ON public.pending_invites
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.membros_workspace
    WHERE workspace_id = pending_invites.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);

-- Policy: Qualquer pessoa pode visualizar convite pelo token (necessário para página pública de aceite)
CREATE POLICY "Anyone can view invite by token"
ON public.pending_invites
FOR SELECT
TO anon
USING (true);