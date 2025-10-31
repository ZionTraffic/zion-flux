# 🔧 Instruções para Corrigir os Erros do Console

## Erros Identificados:
- ❌ Banco asf não encontrado
- ❌ Banco sieg não encontrado  
- ❌ column "analista" does not exist (erro na função RPC)

## 📋 Solução (Execute no SQL Editor do Supabase)

### Passo 1: Acesse o SQL Editor
1. Vá para: https://supabase.com/dashboard/project/wrebkgazdlyjenbpexnc
2. Clique em **SQL Editor** no menu lateral
3. Clique em **New Query**

### Passo 2: Execute o SQL abaixo

```sql
-- 1. Desabilitar RLS temporariamente para inserir dados
ALTER TABLE database_configs DISABLE ROW LEVEL SECURITY;

-- 2. Popular tabela database_configs com as configurações dos bancos
INSERT INTO database_configs (name, database_key, url, anon_key, active)
VALUES 
  ('ASF Finance', 'asf', 'https://wrebkgazdlyjenbpexnc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w', true),
  ('SIEG Financeiro', 'sieg', 'https://vrbgptrmmvsaoozrplng.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYmdwdHJtbXZzYW9venJwbG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTQxNDgsImV4cCI6MjA3NjM5MDE0OH0.q7GPpHQxCG-V5J0BZlKZoPy57XJiQCqLCA1Ya72HxPI', true)
ON CONFLICT (database_key) DO UPDATE SET
  name = EXCLUDED.name,
  url = EXCLUDED.url,
  anon_key = EXCLUDED.anon_key,
  active = EXCLUDED.active;

-- 3. Reabilitar RLS
ALTER TABLE database_configs ENABLE ROW LEVEL SECURITY;

-- 4. Criar política para permitir leitura pública
DROP POLICY IF EXISTS "Allow public read access" ON database_configs;
CREATE POLICY "Allow public read access" ON database_configs
  FOR SELECT
  TO public
  USING (active = true);

-- 5. Criar função get_atendimentos_metrics
CREATE OR REPLACE FUNCTION get_atendimentos_metrics(
  p_workspace_id UUID,
  p_table_name TEXT,
  p_data_hoje TEXT,
  p_primeiro_dia_mes TEXT,
  p_ultimo_dia_mes TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count_hoje INTEGER;
  v_count_ia INTEGER;
  v_count_transferidos INTEGER;
  v_csat_data JSON;
  v_result JSON;
BEGIN
  -- Atendimentos de hoje
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE id_workspace = $1 AND created_at >= $2 AND created_at <= $3',
    p_table_name
  ) INTO v_count_hoje
  USING p_workspace_id, p_data_hoje || 'T00:00:00', p_data_hoje || 'T23:59:59';

  -- Atendimentos IA (sem transferência)
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE id_workspace = $1 AND created_at >= $2 AND created_at <= $3 AND data_transferencia IS NULL',
    p_table_name
  ) INTO v_count_ia
  USING p_workspace_id, p_data_hoje || 'T00:00:00', p_data_hoje || 'T23:59:59';

  -- Atendimentos transferidos
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE id_workspace = $1 AND created_at >= $2 AND created_at <= $3 AND data_transferencia IS NOT NULL',
    p_table_name
  ) INTO v_count_transferidos
  USING p_workspace_id, p_data_hoje || 'T00:00:00', p_data_hoje || 'T23:59:59';

  -- CSAT por analista
  EXECUTE format(
    'SELECT COALESCE(json_agg(row_to_json(t)), ''[]''::json) FROM (
      SELECT analista, csat, created_at 
      FROM %I 
      WHERE id_workspace = $1 
        AND analista IS NOT NULL 
        AND csat IS NOT NULL 
        AND created_at >= $2 
        AND created_at <= $3
    ) t',
    p_table_name
  ) INTO v_csat_data
  USING p_workspace_id, p_primeiro_dia_mes, p_ultimo_dia_mes;

  -- Montar resultado
  v_result := json_build_object(
    'atendimentosHoje', COALESCE(v_count_hoje, 0),
    'atendimentosIA', COALESCE(v_count_ia, 0),
    'atendimentosTransferidos', COALESCE(v_count_transferidos, 0),
    'csatData', COALESCE(v_csat_data, '[]'::json)
  );

  RETURN v_result;
END;
$$;

-- 6. Dar permissões para a função
GRANT EXECUTE ON FUNCTION get_atendimentos_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_atendimentos_metrics TO anon;
```

### Passo 3: Clique em "Run" para executar

### Passo 4: Recarregue a aplicação
Após executar o SQL, recarregue a página do localhost:3000

## ✅ Resultado Esperado
Após executar o SQL, os seguintes erros devem desaparecer:
- ✅ Banco asf encontrado
- ✅ Banco sieg encontrado
- ✅ Função RPC funcionando corretamente

## 🔗 Links Úteis
- Dashboard Supabase: https://supabase.com/dashboard/project/wrebkgazdlyjenbpexnc
- SQL Editor: https://supabase.com/dashboard/project/wrebkgazdlyjenbpexnc/sql
