-- Convert regular views to SECURITY BARRIER views to enforce base table RLS
-- This ensures that even direct queries to these views respect workspace isolation

-- Drop and recreate kpi_overview_daily as a SECURITY BARRIER view
DROP VIEW IF EXISTS public.kpi_overview_daily CASCADE;

CREATE VIEW public.kpi_overview_daily
WITH (security_barrier = true)
AS
SELECT 
  l.workspace_id,
  l.created_at::date AS day,
  count(*) FILTER (WHERE l.stage = ANY (ARRAY['recebido'::text, 'qualificado'::text, 'followup'::text, 'descartado'::text])) AS leads_recebidos,
  count(*) FILTER (WHERE l.stage = 'qualificado'::text) AS leads_qualificados,
  count(*) FILTER (WHERE l.stage = 'followup'::text) AS leads_followup,
  count(*) FILTER (WHERE l.stage = 'descartado'::text) AS leads_descartados,
  COALESCE(sum(ca.amount), 0::numeric) AS investimento,
  CASE
    WHEN count(*) FILTER (WHERE l.stage = ANY (ARRAY['recebido'::text, 'qualificado'::text, 'followup'::text, 'descartado'::text])) > 0 
    THEN COALESCE(sum(ca.amount), 0::numeric) / count(*) FILTER (WHERE l.stage = ANY (ARRAY['recebido'::text, 'qualificado'::text, 'followup'::text, 'descartado'::text]))::numeric
    ELSE 0::numeric
  END AS cpl
FROM public.leads l
LEFT JOIN public.custo_anuncios ca ON ca.workspace_id = l.workspace_id AND ca.day = l.created_at::date
GROUP BY l.workspace_id, (l.created_at::date);

-- Drop and recreate v_analise_fluxos as a SECURITY BARRIER view  
DROP VIEW IF EXISTS public.v_analise_fluxos CASCADE;

CREATE VIEW public.v_analise_fluxos
WITH (security_barrier = true)
AS
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

-- Drop and recreate v_qualificacao as a SECURITY BARRIER view
DROP VIEW IF EXISTS public.v_qualificacao CASCADE;

CREATE VIEW public.v_qualificacao
WITH (security_barrier = true)
AS
SELECT 
  hc.id,
  hc.workspace_id,
  hc.phone,
  hc.lead_name,
  hc.source,
  hc.tag,
  hc.created_at AS entered_at,
  ai.stage_after AS stage
FROM public.historico_conversas hc
LEFT JOIN public.analise_ia ai ON ai.lead_id = hc.id;