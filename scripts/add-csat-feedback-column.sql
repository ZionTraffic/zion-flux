-- Adicionar coluna csat_feedback na tabela conversas_leads
-- Executar no Supabase SQL Editor

-- Verificar se a coluna já existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'conversas_leads' AND column_name = 'csat_feedback';

-- Adicionar a coluna (texto para justificativa do cliente)
ALTER TABLE conversas_leads 
ADD COLUMN IF NOT EXISTS csat_feedback TEXT;

-- Comentário na coluna
COMMENT ON COLUMN conversas_leads.csat_feedback IS 'Justificativa/feedback do cliente sobre a avaliação CSAT';

-- Verificar resultado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversas_leads' 
ORDER BY ordinal_position;
