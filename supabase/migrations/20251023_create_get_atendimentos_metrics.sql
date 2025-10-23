-- Função para buscar métricas de atendimento (bypass RLS)
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
    'csatData', COALESCE(v_csat_data, '[]'::json)
  );

  RETURN v_result;
END;
$$;

-- Permitir que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION get_atendimentos_metrics TO authenticated;
