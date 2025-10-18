-- Filtrar dados do sistema para exibir apenas a partir de 01/10/2025
-- Esta migração recria APENAS as views com filtro de data (sem constraints)

-- 1. Recriar view kpi_overview_daily com filtro de data
DROP VIEW IF EXISTS kpi_overview_daily CASCADE;

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
WHERE l.created_at >= '2025-10-01'::date
GROUP BY l.workspace_id, l.created_at::date;

GRANT SELECT ON kpi_overview_daily TO authenticated;

-- 2. Recriar view v_analise_fluxos com filtro de data
DROP VIEW IF EXISTS v_analise_fluxos CASCADE;

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
LEFT JOIN historico_conversas hc ON hc.id = af.conversa_id
WHERE af.created_at >= '2025-10-01'::date;

GRANT SELECT ON v_analise_fluxos TO authenticated;

-- 3. Recriar view v_qualificacao com filtro de data
DROP VIEW IF EXISTS v_qualificacao CASCADE;

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
LEFT JOIN analise_ia ai ON ai.lead_id = hc.id
WHERE hc.created_at >= '2025-10-01'::date;

GRANT SELECT ON v_qualificacao TO authenticated;