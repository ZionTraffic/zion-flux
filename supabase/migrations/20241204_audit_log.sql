-- =====================================================
-- SISTEMA DE AUDIT LOG - ZION APP
-- Rastreia todas as alterações importantes no sistema
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. CRIAR TABELA DE AUDIT LOG
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  tenant_id UUID REFERENCES public.empresas(id),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  
  -- Detalhes da ação
  tabela TEXT NOT NULL,
  registro_id TEXT,
  acao TEXT NOT NULL CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Dados alterados
  dados_anteriores JSONB,
  dados_novos JSONB,
  campos_alterados TEXT[],
  
  -- Contexto
  ip_address TEXT,
  user_agent TEXT,
  descricao TEXT,
  
  -- Timestamp
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON public.audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_tabela ON public.audit_log(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_log_criado_em ON public.audit_log(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_acao ON public.audit_log(acao);
CREATE INDEX IF NOT EXISTS idx_audit_log_registro_id ON public.audit_log(registro_id);

-- 3. COMENTÁRIO NA TABELA
COMMENT ON TABLE public.audit_log IS 'Histórico de todas as alterações importantes no sistema (Audit Trail)';

-- 4. FUNÇÃO GENÉRICA DE AUDIT LOG
CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_tenant_id UUID;
  v_registro_id TEXT;
  v_dados_anteriores JSONB;
  v_dados_novos JSONB;
  v_campos_alterados TEXT[];
  v_descricao TEXT;
  v_key TEXT;
  v_old_json JSONB;
  v_new_json JSONB;
BEGIN
  -- Obter usuário atual (se disponível)
  BEGIN
    v_user_id := auth.uid();
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
    v_user_email := 'sistema';
  END;

  -- Converter registros para JSONB
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    v_old_json := to_jsonb(OLD);
  END IF;
  
  IF TG_OP IN ('UPDATE', 'INSERT') THEN
    v_new_json := to_jsonb(NEW);
  END IF;

  -- Determinar tenant_id e registro_id baseado na operação
  IF TG_OP = 'DELETE' THEN
    v_registro_id := (v_old_json->>'id')::TEXT;
    v_dados_anteriores := v_old_json;
    v_dados_novos := NULL;
    v_descricao := 'Registro excluído da tabela ' || TG_TABLE_NAME;
    
    -- Tentar extrair tenant_id de diferentes campos
    v_tenant_id := COALESCE(
      (v_old_json->>'empresa_id')::UUID,
      (v_old_json->>'tenant_id')::UUID,
      (v_old_json->>'workspace_id')::UUID
    );
    
  ELSIF TG_OP = 'INSERT' THEN
    v_registro_id := (v_new_json->>'id')::TEXT;
    v_dados_anteriores := NULL;
    v_dados_novos := v_new_json;
    v_descricao := 'Novo registro criado na tabela ' || TG_TABLE_NAME;
    
    -- Tentar extrair tenant_id
    v_tenant_id := COALESCE(
      (v_new_json->>'empresa_id')::UUID,
      (v_new_json->>'tenant_id')::UUID,
      (v_new_json->>'workspace_id')::UUID
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_registro_id := (v_new_json->>'id')::TEXT;
    v_dados_anteriores := v_old_json;
    v_dados_novos := v_new_json;
    
    -- Identificar campos alterados
    v_campos_alterados := ARRAY[]::TEXT[];
    FOR v_key IN SELECT jsonb_object_keys(v_new_json)
    LOOP
      IF v_old_json->v_key IS DISTINCT FROM v_new_json->v_key THEN
        -- Ignorar campos de timestamp automáticos
        IF v_key NOT IN ('atualizado_em', 'updated_at') THEN
          v_campos_alterados := array_append(v_campos_alterados, v_key);
        END IF;
      END IF;
    END LOOP;
    
    -- Se não houve alteração real (apenas timestamp), não logar
    IF array_length(v_campos_alterados, 1) IS NULL OR array_length(v_campos_alterados, 1) = 0 THEN
      RETURN NEW;
    END IF;
    
    v_descricao := 'Campos alterados: ' || array_to_string(v_campos_alterados, ', ');
    
    -- Tentar extrair tenant_id
    v_tenant_id := COALESCE(
      (v_new_json->>'empresa_id')::UUID,
      (v_new_json->>'tenant_id')::UUID,
      (v_new_json->>'workspace_id')::UUID
    );
  END IF;

  -- Inserir log
  INSERT INTO public.audit_log (
    tenant_id,
    user_id,
    user_email,
    tabela,
    registro_id,
    acao,
    dados_anteriores,
    dados_novos,
    campos_alterados,
    descricao
  ) VALUES (
    v_tenant_id,
    v_user_id,
    v_user_email,
    TG_TABLE_NAME,
    v_registro_id,
    TG_OP,
    v_dados_anteriores,
    v_dados_novos,
    v_campos_alterados,
    v_descricao
  );

  -- Retornar o registro apropriado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 5. CRIAR TRIGGERS NAS TABELAS PRINCIPAIS

-- Leads
DROP TRIGGER IF EXISTS trg_audit_leads ON public.leads;
CREATE TRIGGER trg_audit_leads
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- Conversas
DROP TRIGGER IF EXISTS trg_audit_conversas_leads ON public.conversas_leads;
CREATE TRIGGER trg_audit_conversas_leads
  AFTER INSERT OR UPDATE OR DELETE ON public.conversas_leads
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- Financeiro SIEG
DROP TRIGGER IF EXISTS trg_audit_financeiro_sieg ON public.financeiro_sieg;
CREATE TRIGGER trg_audit_financeiro_sieg
  AFTER INSERT OR UPDATE OR DELETE ON public.financeiro_sieg
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- Campanhas
DROP TRIGGER IF EXISTS trg_audit_campanhas ON public.campanhas;
CREATE TRIGGER trg_audit_campanhas
  AFTER INSERT OR UPDATE OR DELETE ON public.campanhas
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- Tenant Users
DROP TRIGGER IF EXISTS trg_audit_tenant_users ON public.tenant_users;
CREATE TRIGGER trg_audit_tenant_users
  AFTER INSERT OR UPDATE OR DELETE ON public.tenant_users
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- Mapeamentos de Tags
DROP TRIGGER IF EXISTS trg_audit_mapeamentos_tags ON public.mapeamentos_tags_tenant;
CREATE TRIGGER trg_audit_mapeamentos_tags
  AFTER INSERT OR UPDATE OR DELETE ON public.mapeamentos_tags_tenant
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- Custos de Anúncios
DROP TRIGGER IF EXISTS trg_audit_custos_anuncios ON public.custos_anuncios_tenant;
CREATE TRIGGER trg_audit_custos_anuncios
  AFTER INSERT OR UPDATE OR DELETE ON public.custos_anuncios_tenant
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- 6. FUNÇÃO RPC PARA BUSCAR LOGS (com filtros)
CREATE OR REPLACE FUNCTION public.get_audit_logs(
  p_tenant_id UUID DEFAULT NULL,
  p_tabela TEXT DEFAULT NULL,
  p_acao TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_data_fim TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_limite INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  user_id UUID,
  user_email TEXT,
  tabela TEXT,
  registro_id TEXT,
  acao TEXT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  campos_alterados TEXT[],
  descricao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.tenant_id,
    al.user_id,
    al.user_email,
    al.tabela,
    al.registro_id,
    al.acao,
    al.dados_anteriores,
    al.dados_novos,
    al.campos_alterados,
    al.descricao,
    al.criado_em
  FROM public.audit_log al
  WHERE 
    (p_tenant_id IS NULL OR al.tenant_id = p_tenant_id)
    AND (p_tabela IS NULL OR al.tabela = p_tabela)
    AND (p_acao IS NULL OR al.acao = p_acao)
    AND (p_user_id IS NULL OR al.user_id = p_user_id)
    AND (p_data_inicio IS NULL OR al.criado_em >= p_data_inicio)
    AND (p_data_fim IS NULL OR al.criado_em <= p_data_fim)
  ORDER BY al.criado_em DESC
  LIMIT p_limite
  OFFSET p_offset;
END;
$$;

-- 7. FUNÇÃO PARA CONTAR LOGS
CREATE OR REPLACE FUNCTION public.count_audit_logs(
  p_tenant_id UUID DEFAULT NULL,
  p_tabela TEXT DEFAULT NULL,
  p_acao TEXT DEFAULT NULL,
  p_data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_data_fim TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.audit_log al
  WHERE 
    (p_tenant_id IS NULL OR al.tenant_id = p_tenant_id)
    AND (p_tabela IS NULL OR al.tabela = p_tabela)
    AND (p_acao IS NULL OR al.acao = p_acao)
    AND (p_data_inicio IS NULL OR al.criado_em >= p_data_inicio)
    AND (p_data_fim IS NULL OR al.criado_em <= p_data_fim);
  
  RETURN v_count;
END;
$$;

-- 8. GRANT PERMISSIONS
GRANT SELECT ON public.audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_audit_logs TO authenticated;

-- 9. Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Audit Log configurado com sucesso!';
  RAISE NOTICE '📋 Tabelas monitoradas: leads, conversas_leads, financeiro_sieg, campanhas, tenant_users, mapeamentos_tags_tenant, custos_anuncios_tenant';
END $$;
