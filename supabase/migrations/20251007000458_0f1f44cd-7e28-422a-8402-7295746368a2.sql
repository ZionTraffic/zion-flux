-- Recreate kpi_overview_daily view with SECURITY INVOKER
-- This ensures the view respects user-level RLS policies

DROP VIEW IF EXISTS public.kpi_overview_daily CASCADE;

CREATE OR REPLACE VIEW public.kpi_overview_daily
WITH (security_invoker=true)
AS
SELECT 
  w.id as workspace_id,
  d.day::date as day,
  COALESCE(SUM(ca.amount), 0) as investimento,
  COALESCE(COUNT(DISTINCT CASE WHEN l.entered_at::date = d.day::date THEN l.id END), 0) as leads_recebidos,
  COALESCE(COUNT(DISTINCT CASE WHEN l.stage = 'qualificado' THEN l.id END), 0) as leads_qualificados,
  COALESCE(COUNT(DISTINCT CASE WHEN l.stage = 'follow_up' THEN l.id END), 0) as leads_followup,
  COALESCE(COUNT(DISTINCT CASE WHEN l.stage = 'descartado' THEN l.id END), 0) as leads_descartados,
  CASE 
    WHEN COUNT(DISTINCT CASE WHEN l.entered_at::date = d.day::date THEN l.id END) > 0 
    THEN (SUM(ca.amount) / COUNT(DISTINCT CASE WHEN l.entered_at::date = d.day::date THEN l.id END))::numeric(12,2)
    ELSE 0::numeric(12,2)
  END as cpl
FROM 
  public.workspaces w
  CROSS JOIN generate_series(
    (CURRENT_DATE - INTERVAL '90 days')::timestamp,
    CURRENT_DATE::timestamp,
    INTERVAL '1 day'
  ) as d(day)
  LEFT JOIN public.custo_anuncios ca ON ca.workspace_id = w.id AND ca.day = d.day::date
  LEFT JOIN public.leads l ON l.workspace_id = w.id
GROUP BY w.id, d.day;