-- Migration: Create membros_workspace table and kpi_overview_daily view
-- Created: 2024-11-18
-- Description: Workspace members table and daily KPI aggregation view

-- Criar tabela membros_workspace
CREATE TABLE IF NOT EXISTS public.membros_workspace (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  role TEXT,
  PRIMARY KEY (user_id, workspace_id)
);

-- Criar índices para membros_workspace
CREATE INDEX IF NOT EXISTS idx_membros_workspace_user ON membros_workspace(user_id);
CREATE INDEX IF NOT EXISTS idx_membros_workspace_workspace ON membros_workspace(workspace_id);

-- Comentários para documentação
COMMENT ON TABLE membros_workspace IS 'Membros de workspaces (relação usuário-workspace)';
COMMENT ON COLUMN membros_workspace.role IS 'Papel do usuário no workspace (admin, member, viewer)';

-- Criar view kpi_overview_daily (visão agregada de KPIs diários)
CREATE OR REPLACE VIEW public.kpi_overview_daily AS
SELECT 
  l.empresa_id as workspace_id,
  DATE(l.criado_em) as day,
  COUNT(*) as leads_recebidos,
  COUNT(*) FILTER (WHERE l.status = 'qualificado' OR l.status = 'qualificados') as leads_qualificados,
  COUNT(*) FILTER (WHERE l.status = 'followup' OR l.status = 'follow-up') as leads_followup,
  COUNT(*) FILTER (WHERE l.status = 'descartado' OR l.status = 'descartados') as leads_descartados,
  COALESCE(SUM(c.valor), 0) as investimento,
  CASE 
    WHEN COUNT(*) FILTER (WHERE l.status = 'qualificado' OR l.status = 'qualificados') > 0 
    THEN COALESCE(SUM(c.valor), 0) / COUNT(*) FILTER (WHERE l.status = 'qualificado' OR l.status = 'qualificados')
    ELSE 0 
  END as cpl
FROM leads l
LEFT JOIN custos_anuncios_tenant c ON c.tenant_id = l.empresa_id AND DATE(c.dia) = DATE(l.criado_em)
GROUP BY l.empresa_id, DATE(l.criado_em);

-- Comentários para documentação
COMMENT ON VIEW kpi_overview_daily IS 'Visão agregada de KPIs diários por workspace (leads recebidos, qualificados, investimento, CPL)';

-- Remover versão antiga da função se existir
DROP FUNCTION IF EXISTS public.kpi_totais_periodo(text, text, text);

-- Criar função RPC kpi_totais_periodo
CREATE OR REPLACE FUNCTION public.kpi_totais_periodo(
  p_workspace_id UUID,
  p_from DATE,
  p_to DATE
)
RETURNS TABLE (
  total_leads_recebidos BIGINT,
  total_leads_qualificados BIGINT,
  total_leads_followup BIGINT,
  total_leads_descartados BIGINT,
  total_investimento NUMERIC,
  cpl_medio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(leads_recebidos)::BIGINT as total_leads_recebidos,
    SUM(leads_qualificados)::BIGINT as total_leads_qualificados,
    SUM(leads_followup)::BIGINT as total_leads_followup,
    SUM(leads_descartados)::BIGINT as total_leads_descartados,
    SUM(investimento)::NUMERIC as total_investimento,
    CASE 
      WHEN SUM(leads_qualificados) > 0 
      THEN (SUM(investimento) / SUM(leads_qualificados))::NUMERIC
      ELSE 0::NUMERIC
    END as cpl_medio
  FROM kpi_overview_daily
  WHERE workspace_id = p_workspace_id
    AND day >= p_from
    AND day <= p_to;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION kpi_totais_periodo IS 'Retorna totais agregados de KPIs para um período específico';
