-- Migração: Atualizar nomenclatura de stages na tabela leads

-- Passo 1: Remover o constraint antigo
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_stage_check;

-- Passo 2: Atualizar todos os dados existentes para os novos valores
UPDATE public.leads
SET stage = CASE 
  WHEN stage IN ('recebidos', 'Recebidos') THEN 'novo_lead'
  WHEN stage IN ('qualificacao', 'Qualificacao', 'qualificação', 'Qualificação') THEN 'qualificacao'
  WHEN stage IN ('qualificados', 'Qualificados') THEN 'qualificados'
  WHEN stage IN ('descartados', 'Descartados') THEN 'descartados'
  WHEN stage IN ('followup', 'Follow-up', 'follow-up', 'Follow Up') THEN 'followup'
  ELSE stage
END;

-- Passo 3: Adicionar o novo constraint com os valores corretos
ALTER TABLE public.leads 
ADD CONSTRAINT leads_stage_check 
CHECK (stage IN ('novo_lead', 'qualificacao', 'qualificados', 'descartados', 'followup'));