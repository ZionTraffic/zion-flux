-- Migration: Create mapeamentos_tags_tenant and custos_anuncios_tenant tables
-- Created: 2024-11-18
-- Description: Tables for tag mappings and ad costs tracking per tenant (Portuguese names)

-- Create mapeamentos_tags_tenant table
CREATE TABLE IF NOT EXISTS public.mapeamentos_tags_tenant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Mapeamento de tags
  tag_externa TEXT NOT NULL, -- Tag externa (do webhook, Meta Ads, etc)
  estagio_interno TEXT NOT NULL, -- Stage interno do sistema
  rotulo_exibicao TEXT NOT NULL, -- Label para exibição
  descricao TEXT, -- Descrição opcional
  ordem_exibicao INTEGER DEFAULT 0, -- Ordem de exibição
  
  -- Controle
  ativo BOOLEAN DEFAULT true,
  
  -- Auditoria
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id),
  
  -- Constraint: uma tag externa por tenant
  UNIQUE(tenant_id, tag_externa)
);

-- Create custos_anuncios_tenant table
CREATE TABLE IF NOT EXISTS public.custos_anuncios_tenant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Dados do custo
  dia DATE NOT NULL, -- Dia do custo
  valor DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Valor gasto
  moeda TEXT DEFAULT 'BRL', -- Moeda
  
  -- Origem dos dados
  origem TEXT DEFAULT 'manual', -- 'manual', 'meta_ads', 'google_ads', etc
  id_campanha TEXT, -- ID da campanha (opcional)
  nome_campanha TEXT, -- Nome da campanha (opcional)
  
  -- Métricas adicionais (opcional)
  impressoes INTEGER,
  cliques INTEGER,
  conversoes INTEGER,
  
  -- Auditoria
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id),
  
  -- Constraint: um registro por dia/tenant/campanha
  UNIQUE(tenant_id, dia, id_campanha)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mapeamentos_tags_tenant_tenant ON mapeamentos_tags_tenant(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mapeamentos_tags_tenant_tag_externa ON mapeamentos_tags_tenant(tag_externa);
CREATE INDEX IF NOT EXISTS idx_mapeamentos_tags_tenant_ativo ON mapeamentos_tags_tenant(tenant_id, ativo) WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_custos_anuncios_tenant_tenant ON custos_anuncios_tenant(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custos_anuncios_tenant_dia ON custos_anuncios_tenant(dia);
CREATE INDEX IF NOT EXISTS idx_custos_anuncios_tenant_tenant_dia ON custos_anuncios_tenant(tenant_id, dia);

-- Triggers para atualizado_em
CREATE TRIGGER update_mapeamentos_tags_tenant_atualizado_em 
    BEFORE UPDATE ON mapeamentos_tags_tenant 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custos_anuncios_tenant_atualizado_em 
    BEFORE UPDATE ON custos_anuncios_tenant 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE mapeamentos_tags_tenant IS 'Mapeamento de tags externas para stages internos por tenant';
COMMENT ON TABLE custos_anuncios_tenant IS 'Custos de anúncios por dia e tenant';

COMMENT ON COLUMN mapeamentos_tags_tenant.tag_externa IS 'Tag externa recebida de webhooks ou APIs';
COMMENT ON COLUMN mapeamentos_tags_tenant.estagio_interno IS 'Stage interno do sistema (novo_lead, qualificado, etc)';
COMMENT ON COLUMN mapeamentos_tags_tenant.rotulo_exibicao IS 'Label amigável para exibição na UI';

COMMENT ON COLUMN custos_anuncios_tenant.dia IS 'Data do custo (formato: YYYY-MM-DD)';
COMMENT ON COLUMN custos_anuncios_tenant.valor IS 'Valor gasto em anúncios';
COMMENT ON COLUMN custos_anuncios_tenant.origem IS 'Origem dos dados (manual, meta_ads, google_ads)';

-- Inserir dados de exemplo para o tenant existente (se houver)
-- Você pode ajustar isso conforme necessário
DO $$
DECLARE
  tenant_record RECORD;
BEGIN
  -- Para cada tenant ativo, criar mapeamentos padrão
  FOR tenant_record IN SELECT id FROM public.empresas WHERE ativa = true LIMIT 1
  LOOP
    -- Inserir mapeamentos de tags padrão
    INSERT INTO public.mapeamentos_tags_tenant (tenant_id, tag_externa, estagio_interno, rotulo_exibicao, ordem_exibicao)
    VALUES 
      (tenant_record.id, 'novo_lead', 'novo_lead', 'Novo Lead', 1),
      (tenant_record.id, 'qualificado', 'qualificado', 'Qualificado', 2),
      (tenant_record.id, 'em_negociacao', 'em_negociacao', 'Em Negociação', 3),
      (tenant_record.id, 'fechado', 'fechado', 'Fechado', 4),
      (tenant_record.id, 'perdido', 'perdido', 'Perdido', 5)
    ON CONFLICT (tenant_id, tag_externa) DO NOTHING;
    
    RAISE NOTICE 'Mapeamentos de tags criados para tenant %', tenant_record.id;
  END LOOP;
END $$;
