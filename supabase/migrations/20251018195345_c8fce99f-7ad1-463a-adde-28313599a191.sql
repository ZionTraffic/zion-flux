-- Criar workspace SIEG (caso não exista)
INSERT INTO workspaces (name, slug, database)
VALUES ('SIEG', 'sieg', 'sieg')
ON CONFLICT (slug) DO NOTHING;

-- Adicionar o usuário atual como owner da workspace SIEG
-- Primeiro vamos ver qual é o usuário atual e adicionar como owner
DO $$
DECLARE
  v_workspace_id uuid;
  v_user_id uuid;
BEGIN
  -- Pegar o ID da workspace SIEG
  SELECT id INTO v_workspace_id 
  FROM workspaces 
  WHERE slug = 'sieg';
  
  -- Pegar o primeiro usuário owner da ASF Finance para usar como owner da SIEG também
  SELECT user_id INTO v_user_id
  FROM membros_workspace
  WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'asf-finance')
    AND role = 'owner'
  LIMIT 1;
  
  -- Adicionar como owner da SIEG
  IF v_workspace_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    INSERT INTO membros_workspace (workspace_id, user_id, role)
    VALUES (v_workspace_id, v_user_id, 'owner')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;
END $$;