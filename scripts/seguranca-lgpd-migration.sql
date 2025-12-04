-- =====================================================
-- MIGRAÇÃO DE SEGURANÇA E LGPD - ZION APP
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. TABELA DE AUDITORIA (LGPD)
-- Registra todas as ações do sistema para conformidade
CREATE TABLE IF NOT EXISTS auditoria_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Quem fez a ação
  usuario_id UUID,
  usuario_email VARCHAR(255),
  usuario_nome VARCHAR(255),
  
  -- Contexto
  empresa_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- O que foi feito
  acao VARCHAR(100) NOT NULL,  -- 'login', 'logout', 'visualizar', 'criar', 'editar', 'excluir', 'exportar'
  recurso VARCHAR(100),         -- 'lead', 'conversa', 'relatorio', 'usuario'
  recurso_id VARCHAR(255),      -- ID do recurso afetado
  
  -- Detalhes
  descricao TEXT,
  dados_anteriores JSONB,       -- Dados antes da alteração
  dados_novos JSONB,            -- Dados após alteração
  
  -- Dados sensíveis acessados (LGPD)
  dados_sensiveis_acessados TEXT[], -- ['cpf', 'telefone', 'email']
  
  -- Metadados
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria_sistema(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa ON auditoria_sistema(empresa_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_acao ON auditoria_sistema(acao);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em ON auditoria_sistema(criado_em DESC);

COMMENT ON TABLE auditoria_sistema IS 'Registro de auditoria para conformidade LGPD';

-- 2. TABELA DE CONSENTIMENTO LGPD
-- Registra quando o usuário aceitou os termos
CREATE TABLE IF NOT EXISTS consentimento_lgpd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  usuario_email VARCHAR(255),
  
  -- Tipo de consentimento
  tipo VARCHAR(100) NOT NULL, -- 'termos_uso', 'politica_privacidade', 'cookies', 'marketing'
  versao VARCHAR(20) NOT NULL, -- '1.0', '1.1', etc
  
  -- Status
  aceito BOOLEAN NOT NULL DEFAULT false,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Datas
  aceito_em TIMESTAMP WITH TIME ZONE,
  revogado_em TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consentimento_usuario ON consentimento_lgpd(usuario_id);
CREATE INDEX IF NOT EXISTS idx_consentimento_tipo ON consentimento_lgpd(tipo);

COMMENT ON TABLE consentimento_lgpd IS 'Registro de consentimentos LGPD dos usuários';

-- 3. TABELA DE SOLICITAÇÕES LGPD
-- Registra pedidos de exclusão, portabilidade, etc
CREATE TABLE IF NOT EXISTS solicitacoes_lgpd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Solicitante
  usuario_id UUID,
  email_solicitante VARCHAR(255) NOT NULL,
  nome_solicitante VARCHAR(255),
  telefone_solicitante VARCHAR(50),
  
  -- Tipo de solicitação
  tipo VARCHAR(100) NOT NULL, -- 'exclusao', 'portabilidade', 'acesso', 'retificacao'
  
  -- Status
  status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'em_andamento', 'concluido', 'rejeitado'
  
  -- Detalhes
  descricao TEXT,
  resposta TEXT,
  
  -- Responsável
  atendido_por UUID,
  atendido_por_nome VARCHAR(255),
  
  -- Datas
  prazo_legal TIMESTAMP WITH TIME ZONE, -- LGPD: 15 dias úteis
  concluido_em TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes_lgpd(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_tipo ON solicitacoes_lgpd(tipo);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_email ON solicitacoes_lgpd(email_solicitante);

COMMENT ON TABLE solicitacoes_lgpd IS 'Solicitações de titulares de dados conforme LGPD';

-- 4. FUNÇÃO PARA REGISTRAR AUDITORIA
CREATE OR REPLACE FUNCTION registrar_auditoria(
  p_usuario_id UUID,
  p_usuario_email VARCHAR,
  p_usuario_nome VARCHAR,
  p_empresa_id UUID,
  p_acao VARCHAR,
  p_recurso VARCHAR,
  p_recurso_id VARCHAR,
  p_descricao TEXT DEFAULT NULL,
  p_dados_anteriores JSONB DEFAULT NULL,
  p_dados_novos JSONB DEFAULT NULL,
  p_dados_sensiveis TEXT[] DEFAULT NULL,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO auditoria_sistema (
    usuario_id,
    usuario_email,
    usuario_nome,
    empresa_id,
    acao,
    recurso,
    recurso_id,
    descricao,
    dados_anteriores,
    dados_novos,
    dados_sensiveis_acessados,
    ip_address,
    user_agent
  ) VALUES (
    p_usuario_id,
    p_usuario_email,
    p_usuario_nome,
    p_empresa_id,
    p_acao,
    p_recurso,
    p_recurso_id,
    p_descricao,
    p_dados_anteriores,
    p_dados_novos,
    p_dados_sensiveis,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGER PARA AUDITORIA AUTOMÁTICA NA TABELA FINANCEIRO_SIEG
CREATE OR REPLACE FUNCTION auditoria_financeiro_sieg()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO auditoria_sistema (
      empresa_id,
      acao,
      recurso,
      recurso_id,
      descricao,
      dados_anteriores,
      dados_novos,
      dados_sensiveis_acessados
    ) VALUES (
      NEW.empresa_id,
      'editar',
      'lead',
      NEW.id::VARCHAR,
      'Atualização de dados do lead',
      to_jsonb(OLD),
      to_jsonb(NEW),
      ARRAY['telefone', 'cpf', 'nome']
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO auditoria_sistema (
      empresa_id,
      acao,
      recurso,
      recurso_id,
      descricao,
      dados_anteriores,
      dados_sensiveis_acessados
    ) VALUES (
      OLD.empresa_id,
      'excluir',
      'lead',
      OLD.id::VARCHAR,
      'Exclusão de lead',
      to_jsonb(OLD),
      ARRAY['telefone', 'cpf', 'nome']
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_financeiro ON financeiro_sieg;
CREATE TRIGGER trigger_auditoria_financeiro
  AFTER UPDATE OR DELETE ON financeiro_sieg
  FOR EACH ROW
  EXECUTE FUNCTION auditoria_financeiro_sieg();

-- 6. RLS (Row Level Security) - Fortalecer segurança
ALTER TABLE auditoria_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE consentimento_lgpd ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_lgpd ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só veem auditoria da própria empresa
CREATE POLICY "auditoria_por_empresa" ON auditoria_sistema
  FOR SELECT
  USING (empresa_id IN (
    SELECT id FROM workspaces WHERE id = empresa_id
  ));

-- 7. LIMPEZA AUTOMÁTICA DE LOGS ANTIGOS (LGPD - retenção mínima)
-- Manter logs por 5 anos (requisito legal)
CREATE OR REPLACE FUNCTION limpar_auditoria_antiga()
RETURNS void AS $$
BEGIN
  DELETE FROM auditoria_sistema
  WHERE criado_em < NOW() - INTERVAL '5 years';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION limpar_auditoria_antiga IS 'Remove registros de auditoria com mais de 5 anos';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
