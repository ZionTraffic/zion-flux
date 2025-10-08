-- Fix SECURITY DEFINER views to use SECURITY INVOKER
-- This ensures RLS policies from underlying tables are properly enforced

-- kpi_overview_daily view: Aggregates KPI data from various sources
CREATE OR REPLACE VIEW public.kpi_overview_daily
WITH (security_invoker = true)
AS
SELECT 
  w.id as workspace_id,
  d.day,
  COALESCE(SUM(ca.amount), 0) as investimento,
  COUNT(DISTINCT CASE WHEN l.created_at::date = d.day THEN l.id END) as leads_recebidos,
  COUNT(DISTINCT CASE WHEN l.stage = 'Qualificado' AND l.entered_at::date = d.day THEN l.id END) as leads_qualificados,
  COUNT(DISTINCT CASE WHEN l.stage = 'Follow-up' AND l.entered_at::date = d.day THEN l.id END) as leads_followup,
  COUNT(DISTINCT CASE WHEN l.stage = 'Descartado' AND l.entered_at::date = d.day THEN l.id END) as leads_descartados,
  CASE 
    WHEN COUNT(DISTINCT CASE WHEN l.created_at::date = d.day THEN l.id END) > 0 
    THEN (COALESCE(SUM(ca.amount), 0) / COUNT(DISTINCT CASE WHEN l.created_at::date = d.day THEN l.id END))::numeric(12,2)
    ELSE 0::numeric(12,2)
  END as cpl
FROM 
  public.workspaces w
  CROSS JOIN LATERAL (
    SELECT day::date
    FROM generate_series(
      CURRENT_DATE - INTERVAL '90 days',
      CURRENT_DATE,
      '1 day'::interval
    ) AS day
  ) d
  LEFT JOIN public.custo_anuncios ca ON ca.workspace_id = w.id AND ca.day = d.day
  LEFT JOIN public.leads l ON l.workspace_id = w.id
GROUP BY w.id, d.day;

-- v_qualificacao view: Shows qualification data from conversations and leads
CREATE OR REPLACE VIEW public.v_qualificacao
WITH (security_invoker = true)
AS
SELECT 
  hc.workspace_id,
  hc.id,
  hc.lead_name,
  hc.phone,
  hc.source,
  hc.tag,
  l.stage,
  l.entered_at
FROM public.historico_conversas hc
LEFT JOIN public.leads l ON l.telefone = hc.phone AND l.workspace_id = hc.workspace_id;