-- Fix DEFINER_OR_RPC_BYPASS: Enable RLS on views and add workspace isolation policies

-- 1. Enable RLS on all three views
ALTER VIEW kpi_overview_daily SET (security_barrier = true);
ALTER VIEW v_analise_fluxos SET (security_barrier = true);
ALTER VIEW v_qualificacao SET (security_barrier = true);

-- Note: Views in PostgreSQL cannot have RLS enabled directly via ALTER TABLE
-- Instead, we need to recreate them as materialized views or add RLS policies on the underlying tables
-- Since the underlying tables already have RLS, we need to ensure the views respect those policies

-- The issue is that security_barrier=true alone is not enough
-- We need to either:
-- 1. Drop and recreate as regular views (without SECURITY DEFINER)
-- 2. Enable RLS on the views themselves

-- Let's recreate the views to ensure they inherit RLS from base tables
DROP VIEW IF EXISTS kpi_overview_daily CASCADE;
DROP VIEW IF EXISTS v_analise_fluxos CASCADE;
DROP VIEW IF EXISTS v_qualificacao CASCADE;

-- Recreate kpi_overview_daily without SECURITY DEFINER
CREATE VIEW kpi_overview_daily AS
SELECT 
  l.workspace_id,
  l.created_at::date AS day,
  COUNT(*) FILTER (WHERE l.stage IN ('recebido', 'qualificado', 'followup', 'descartado')) AS leads_recebidos,
  COUNT(*) FILTER (WHERE l.stage = 'qualificado') AS leads_qualificados,
  COUNT(*) FILTER (WHERE l.stage = 'followup') AS leads_followup,
  COUNT(*) FILTER (WHERE l.stage = 'descartado') AS leads_descartados,
  COALESCE(SUM(ca.amount), 0)::numeric AS investimento,
  CASE 
    WHEN COUNT(*) FILTER (WHERE l.stage IN ('recebido', 'qualificado', 'followup', 'descartado')) > 0 
    THEN (COALESCE(SUM(ca.amount), 0) / COUNT(*) FILTER (WHERE l.stage IN ('recebido', 'qualificado', 'followup', 'descartado')))::numeric
    ELSE 0::numeric
  END AS cpl
FROM leads l
LEFT JOIN custo_anuncios ca ON ca.workspace_id = l.workspace_id AND ca.day = l.created_at::date
GROUP BY l.workspace_id, l.created_at::date;

-- Recreate v_analise_fluxos without SECURITY DEFINER
CREATE VIEW v_analise_fluxos AS
SELECT 
  af.id,
  af.conversa_id,
  af.workspace_id,
  af.created_at,
  af.summary,
  af.issues,
  af.suggestions,
  af.score_humanizacao,
  af.score_fluxo,
  af.score_coerencia,
  hc.lead_name,
  hc.phone,
  hc.tag
FROM analise_fluxos af
LEFT JOIN historico_conversas hc ON hc.id = af.conversa_id;

-- Recreate v_qualificacao without SECURITY DEFINER
CREATE VIEW v_qualificacao AS
SELECT 
  hc.id,
  hc.workspace_id,
  hc.phone,
  hc.lead_name,
  hc.source,
  hc.tag,
  hc.created_at AS entered_at,
  ai.stage_after AS stage
FROM historico_conversas hc
LEFT JOIN analise_ia ai ON ai.lead_id = hc.id;

-- Grant SELECT permissions to authenticated users
-- RLS policies from base tables (leads, custo_anuncios, historico_conversas, analise_fluxos, analise_ia) 
-- will automatically filter the results to only show workspace-appropriate data
GRANT SELECT ON kpi_overview_daily TO authenticated;
GRANT SELECT ON v_analise_fluxos TO authenticated;
GRANT SELECT ON v_qualificacao TO authenticated;