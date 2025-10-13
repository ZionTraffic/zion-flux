-- Fix Security Issues - Corrected Version

-- 1. Recreate views without SECURITY DEFINER to fix security issues
-- Views inherit RLS from their underlying tables which already have proper policies

-- Fix v_analise_fluxos view
DROP VIEW IF EXISTS public.v_analise_fluxos CASCADE;
CREATE VIEW public.v_analise_fluxos AS
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
FROM public.analise_fluxos af
LEFT JOIN public.historico_conversas hc ON hc.id = af.conversa_id;

-- Fix v_qualificacao view (use correct column names from historico_conversas)
DROP VIEW IF EXISTS public.v_qualificacao CASCADE;
CREATE VIEW public.v_qualificacao AS
SELECT 
  hc.id,
  hc.workspace_id,
  hc.phone,
  hc.lead_name,
  hc.source,
  hc.tag,
  hc.created_at as entered_at,
  ai.stage_after as stage
FROM public.historico_conversas hc
LEFT JOIN public.analise_ia ai ON ai.lead_id = hc.id;

-- Fix kpi_overview_daily view
DROP VIEW IF EXISTS public.kpi_overview_daily CASCADE;
CREATE VIEW public.kpi_overview_daily AS
SELECT
  l.workspace_id,
  l.created_at::date as day,
  COUNT(*) FILTER (WHERE l.stage IN ('recebido', 'qualificado', 'followup', 'descartado')) as leads_recebidos,
  COUNT(*) FILTER (WHERE l.stage = 'qualificado') as leads_qualificados,
  COUNT(*) FILTER (WHERE l.stage = 'followup') as leads_followup,
  COUNT(*) FILTER (WHERE l.stage = 'descartado') as leads_descartados,
  COALESCE(SUM(ca.amount), 0) as investimento,
  CASE 
    WHEN COUNT(*) FILTER (WHERE l.stage IN ('recebido', 'qualificado', 'followup', 'descartado')) > 0
    THEN COALESCE(SUM(ca.amount), 0) / COUNT(*) FILTER (WHERE l.stage IN ('recebido', 'qualificado', 'followup', 'descartado'))
    ELSE 0
  END as cpl
FROM public.leads l
LEFT JOIN public.custo_anuncios ca ON ca.workspace_id = l.workspace_id AND ca.day = l.created_at::date
GROUP BY l.workspace_id, l.created_at::date;

-- Add documentation comments
COMMENT ON VIEW public.v_analise_fluxos IS 'View inherits RLS from analise_fluxos and historico_conversas tables';
COMMENT ON VIEW public.v_qualificacao IS 'View inherits RLS from historico_conversas and analise_ia tables';  
COMMENT ON VIEW public.kpi_overview_daily IS 'View inherits RLS from leads and custo_anuncios tables';