-- Fix all database security issues

-- 1. Enable RLS on analise_ia and create policies
ALTER TABLE public.analise_ia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspace analysis"
ON public.analise_ia
FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can insert analysis"
ON public.analise_ia
FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

-- 2. Enable RLS on custo_anuncios and create policies
ALTER TABLE public.custo_anuncios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspace ad costs"
ON public.custo_anuncios
FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage ad costs"
ON public.custo_anuncios
FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
  )
);

-- 3. Enable RLS on historico_conversas and create policies
ALTER TABLE public.historico_conversas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspace conversations"
ON public.historico_conversas
FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can insert conversations"
ON public.historico_conversas
FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

-- 4. Enable RLS on historico_leads and create policies
ALTER TABLE public.historico_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspace lead history"
ON public.historico_leads
FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert lead history"
ON public.historico_leads
FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

-- 5. Enable RLS on leads and create policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspace leads"
ON public.leads
FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can update leads"
ON public.leads
FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete leads"
ON public.leads
FOR DELETE
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- 6. Enable RLS on contas_anuncios and create policies
ALTER TABLE public.contas_anuncios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspace ad accounts"
ON public.contas_anuncios
FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage ad accounts"
ON public.contas_anuncios
FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- 7. Add SELECT policy to workspaces
CREATE POLICY "Users can view their workspaces"
ON public.workspaces
FOR SELECT
USING (
  id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);

-- 8. Add SELECT policy to membros_workspace
CREATE POLICY "Users can view workspace members"
ON public.membros_workspace
FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.membros_workspace 
    WHERE user_id = auth.uid()
  )
);