-- Atualizar data_resposta_csat para os registros informados
-- Data: 28/10/2025

UPDATE public.conversas_sieg_financeiro
SET data_resposta_csat = '2025-10-28 00:00:00+00'::timestamptz
WHERE id IN (5588, 4556, 5992, 5949, 5623, 5388, 5819, 5190, 6245, 3230, 2303);

-- Verificar os registros atualizados
SELECT id, nome, analista, csat, data_resposta_csat
FROM public.conversas_sieg_financeiro
WHERE id IN (5588, 4556, 5992, 5949, 5623, 5388, 5819, 5190, 6245, 3230, 2303)
ORDER BY id;
