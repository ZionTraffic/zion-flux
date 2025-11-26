-- ============================================================
-- MIGRATIONS PARA SIEG FINANCEIRO
-- Execute este script no Supabase SQL Editor
-- ============================================================

-- 1. Adicionar coluna csat_feedback na tabela conversas_leads
-- Armazena justificativas escritas pelos clientes após avaliarem o atendimento
ALTER TABLE conversas_leads
ADD COLUMN IF NOT EXISTS csat_feedback TEXT;

-- 2. Adicionar coluna origem_atendimento na tabela conversas_leads
-- Identifica se o atendimento foi IA ou humano
ALTER TABLE conversas_leads
ADD COLUMN IF NOT EXISTS origem_atendimento TEXT;

-- 3. Criar tabela financeiro_sieg para dados financeiros reais
CREATE TABLE IF NOT EXISTS financeiro_sieg (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID,
  nome TEXT,
  cnpj TEXT,
  telefone TEXT,
  valor_em_aberto NUMERIC DEFAULT 0,
  valor_recuperado_ia NUMERIC DEFAULT 0,
  valor_recuperado_humano NUMERIC DEFAULT 0,
  em_negociacao NUMERIC DEFAULT 0,
  situacao TEXT,
  data_pagamento DATE,
  data_vencimento DATE,
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_financeiro_sieg_empresa_id ON financeiro_sieg(empresa_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_sieg_situacao ON financeiro_sieg(situacao);
CREATE INDEX IF NOT EXISTS idx_conversas_leads_origem ON conversas_leads(origem_atendimento);
CREATE INDEX IF NOT EXISTS idx_conversas_leads_csat ON conversas_leads(csat);

-- 5. Habilitar RLS na tabela financeiro_sieg (OPCIONAL - descomente se necessário)
-- ALTER TABLE financeiro_sieg ENABLE ROW LEVEL SECURITY;

-- NOTA: As políticas RLS foram comentadas pois dependem da estrutura de permissões do seu banco.
-- Se precisar de RLS, ajuste as políticas abaixo conforme sua tabela de usuários/workspaces.

-- CREATE POLICY "acesso_financeiro_sieg" ON financeiro_sieg FOR ALL USING (true);

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- Execute para verificar se as colunas foram criadas:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'conversas_leads' AND column_name IN ('csat_feedback', 'origem_atendimento');

-- Execute para verificar se a tabela foi criada:
-- SELECT * FROM information_schema.tables WHERE table_name = 'financeiro_sieg';
