-- Filtrar dados do sistema para exibir apenas a partir de 01/10/2025
-- PARTE 1: Limpar dados antigos antes de aplicar constraints

-- 1. Deletar conversas anteriores a 01/10/2025
DELETE FROM historico_conversas 
WHERE created_at < '2025-10-01'::date 
AND workspace_id = '3f14bb25-0eda-4c58-8486-16b96dca6f9e';

-- 2. Deletar análises anteriores a 01/10/2025
DELETE FROM analise_ia 
WHERE started_at < '2025-10-01'::date 
AND workspace_id = '3f14bb25-0eda-4c58-8486-16b96dca6f9e';

-- 3. Deletar custos anteriores a 01/10/2025
DELETE FROM custo_anuncios 
WHERE day < '2025-10-01'::date 
AND workspace_id = '3f14bb25-0eda-4c58-8486-16b96dca6f9e';

-- 4. Deletar leads anteriores a 01/10/2025
DELETE FROM leads
WHERE created_at < '2025-10-01'::timestamp
AND workspace_id = '3f14bb25-0eda-4c58-8486-16b96dca6f9e';

-- 5. Recriar view kpi_overview_daily com filtro de data
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

-- 6. Recriar view v_analise_fluxos com filtro de data
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

-- 7. Recriar view v_qualificacao com filtro de data
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

-- 8. Adicionar check constraints para prevenir inserção de dados antigos

-- 8a. Constraint em historico_conversas
ALTER TABLE historico_conversas 
DROP CONSTRAINT IF EXISTS check_min_date_conversas;

ALTER TABLE historico_conversas 
ADD CONSTRAINT check_min_date_conversas 
CHECK (created_at >= '2025-10-01'::date);

-- 8b. Constraint em analise_ia
ALTER TABLE analise_ia 
DROP CONSTRAINT IF EXISTS check_min_date_analises;

ALTER TABLE analise_ia 
ADD CONSTRAINT check_min_date_analises 
CHECK (COALESCE(started_at::date, CURRENT_DATE) >= '2025-10-01'::date);

-- 8c. Constraint em custo_anuncios
ALTER TABLE custo_anuncios 
DROP CONSTRAINT IF EXISTS check_min_date_custos;

ALTER TABLE custo_anuncios 
ADD CONSTRAINT check_min_date_custos 
CHECK (day >= '2025-10-01'::date);

-- 8d. Constraint em leads
ALTER TABLE leads
DROP CONSTRAINT IF EXISTS check_min_date_leads;

ALTER TABLE leads
ADD CONSTRAINT check_min_date_leads
CHECK (created_at >= '2025-10-01'::timestamp);