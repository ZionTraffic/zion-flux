-- Função para remover um membro de um workspace
CREATE OR REPLACE FUNCTION remove_workspace_member(
  p_workspace_id UUID,
  p_user_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_deleted_count INTEGER;
BEGIN
  -- Verificar se o usuário existe no workspace
  IF NOT EXISTS (
    SELECT 1 FROM membros_workspace 
    WHERE workspace_id = p_workspace_id 
    AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Usuário não encontrado no workspace'
    );
  END IF;

  -- Verificar se não é o último owner
  IF EXISTS (
    SELECT 1 FROM membros_workspace 
    WHERE workspace_id = p_workspace_id 
    AND user_id = p_user_id 
    AND role = 'owner'
  ) THEN
    -- Contar quantos owners existem
    SELECT COUNT(*) INTO v_deleted_count
    FROM membros_workspace
    WHERE workspace_id = p_workspace_id
    AND role = 'owner';
    
    IF v_deleted_count <= 1 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Não é possível remover o último owner do workspace'
      );
    END IF;
  END IF;

  -- Remover o membro
  DELETE FROM membros_workspace
  WHERE workspace_id = p_workspace_id
  AND user_id = p_user_id;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  IF v_deleted_count > 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Membro removido com sucesso'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Falha ao remover o membro'
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION remove_workspace_member IS 'Remove um membro de um workspace, com validações de segurança';
