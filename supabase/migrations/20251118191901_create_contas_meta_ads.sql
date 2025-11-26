-- Migration: Create contas_meta_ads table
-- Created: 2024-11-18
-- Description: Meta Ads accounts table and sample data

-- Criar tabela contas_meta_ads (meta_ads_accounts)
CREATE TABLE IF NOT EXISTS public.contas_meta_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  access_token TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, account_id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_contas_meta_ads_workspace ON contas_meta_ads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contas_meta_ads_active ON contas_meta_ads(is_active) WHERE is_active = true;

-- Criar view de compatibilidade
CREATE OR REPLACE VIEW public.meta_ads_accounts AS
SELECT 
  id,
  workspace_id,
  account_id,
  account_name,
  is_active,
  access_token,
  criado_em as created_at,
  atualizado_em as updated_at
FROM public.contas_meta_ads;

-- Comentários
COMMENT ON TABLE contas_meta_ads IS 'Contas do Meta Ads vinculadas aos workspaces';
COMMENT ON VIEW meta_ads_accounts IS 'View de compatibilidade para contas_meta_ads';

-- Nota: Contas Meta Ads devem ser adicionadas manualmente com IDs reais
-- Para adicionar uma conta:
-- INSERT INTO public.contas_meta_ads (workspace_id, account_id, account_name, is_active)
-- VALUES ('workspace_uuid', 'account_id_sem_prefixo_act', 'Nome da Conta', true);

-- Inserir dados de exemplo de custos para os últimos 7 dias
INSERT INTO public.custos_anuncios_tenant (tenant_id, dia, valor, origem, impressoes, cliques, conversoes)
SELECT 
  e.id as tenant_id,
  CURRENT_DATE - i as dia,
  (50 + (random() * 100))::NUMERIC(10,2) as valor,
  'meta_ads' as origem,
  (1000 + (random() * 2000))::INTEGER as impressoes,
  (50 + (random() * 100))::INTEGER as cliques,
  (5 + (random() * 15))::INTEGER as conversoes
FROM public.empresas e
CROSS JOIN generate_series(0, 6) as i
WHERE e.nome = 'ASF Finance'
ON CONFLICT (tenant_id, dia, id_campanha) DO NOTHING;
