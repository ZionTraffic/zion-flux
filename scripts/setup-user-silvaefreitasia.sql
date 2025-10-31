-- Script para configurar permissões para silvaefreitasia@gmail.com
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário existe e obter seu ID
DO $$
DECLARE
  v_user_id uuid;
  v_workspace_id uuid;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'silvaefreitasia@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário silvaefreitasia@gmail.com não encontrado';
  END IF;

  -- Buscar workspace ASF
  SELECT id INTO v_workspace_id
  FROM workspaces
  WHERE database = 'asf'
  LIMIT 1;

  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Workspace ASF não encontrado';
  END IF;

  -- Verificar se já é membro do workspace
  IF NOT EXISTS (
    SELECT 1 FROM membros_workspace
    WHERE user_id = v_user_id AND workspace_id = v_workspace_id
  ) THEN
    -- Adicionar como membro com role 'member'
    INSERT INTO membros_workspace (user_id, workspace_id, role)
    VALUES (v_user_id, v_workspace_id, 'member');
    
    RAISE NOTICE 'Usuário adicionado ao workspace ASF como member';
  ELSE
    RAISE NOTICE 'Usuário já é membro do workspace ASF';
  END IF;

  -- Configurar permissões padrão para visualização
  -- Deletar permissões existentes para evitar duplicatas
  DELETE FROM user_permissions
  WHERE user_id = v_user_id AND workspace_id = v_workspace_id;

  -- Inserir permissões básicas de visualização
  INSERT INTO user_permissions (user_id, workspace_id, permission_key, granted)
  VALUES
    (v_user_id, v_workspace_id, 'dashboard:view', true),
    (v_user_id, v_workspace_id, 'traffic:view', true),
    (v_user_id, v_workspace_id, 'qualification:view', true),
    (v_user_id, v_workspace_id, 'analysis:view', true),
    (v_user_id, v_workspace_id, 'reports:view', true);

  RAISE NOTICE 'Permissões configuradas com sucesso para silvaefreitasia@gmail.com';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Workspace ID: %', v_workspace_id;
END $$;

-- 2. Verificar as permissões configuradas
SELECT 
  u.email,
  mw.role,
  w.name as workspace_name,
  w.database,
  up.permission_key,
  up.granted
FROM auth.users u
JOIN membros_workspace mw ON u.id = mw.user_id
JOIN workspaces w ON mw.workspace_id = w.id
LEFT JOIN user_permissions up ON u.id = up.user_id AND w.id = up.workspace_id
WHERE u.email = 'silvaefreitasia@gmail.com'
ORDER BY up.permission_key;
