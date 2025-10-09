-- Migração: Criar tabela historico_leads e atualizar stages na tabela leads

-- Passo 1: Criar tabela historico_leads se não existir
CREATE TABLE IF NOT EXISTS public.historico_leads (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  lead_id bigint NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  from_stage text,
  to_stage text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.historico_leads ENABLE ROW LEVEL SECURITY;

-- Política para visualizar histórico do workspace
CREATE POLICY "Users can view workspace lead history"
  ON public.historico_leads
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.membros_workspace WHERE user_id = auth.uid()
    )
  );

-- Passo 2: Remover o constraint antigo da tabela leads
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_stage_check;

-- Passo 3: Atualizar todos os dados existentes para os novos valores
UPDATE public.leads
SET stage = CASE 
  WHEN stage IN ('recebidos', 'Recebidos') THEN 'novo_lead'
  WHEN stage IN ('qualificacao', 'Qualificacao', 'qualificação', 'Qualificação') THEN 'qualificacao'
  WHEN stage IN ('qualificados', 'Qualificados') THEN 'qualificados'
  WHEN stage IN ('descartados', 'Descartados') THEN 'descartados'
  WHEN stage IN ('followup', 'Follow-up', 'follow-up', 'Follow Up') THEN 'followup'
  ELSE stage
END;

-- Passo 4: Adicionar o novo constraint
ALTER TABLE public.leads 
ADD CONSTRAINT leads_stage_check 
CHECK (stage IN ('novo_lead', 'qualificacao', 'qualificados', 'descartados', 'followup'));