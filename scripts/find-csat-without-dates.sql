-- Buscar CSATs preenchidos SEM data_resposta_csat
SELECT 
  id, 
  nome, 
  analista, 
  csat, 
  created_at,
  data_resposta_csat
FROM public.conversas_sieg_financeiro
WHERE csat IS NOT NULL 
  AND csat <> '' 
  AND csat <> '-'
  AND data_resposta_csat IS NULL
ORDER BY created_at DESC;
