-- Adicionar george@ziontraffic.com.br ao workspace ASF Finance como owner
DO $$
DECLARE
  v_user_id uuid;
  v_workspace_id uuid := '3f14bb25-0eda-4c58-8486-16b96dca6f9e';
BEGIN
  -- Buscar o user_id do George
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'george@ziontraffic.com.br';

  IF v_user_id IS NOT NULL THEN
    -- Adicionar como owner do workspace (ignora se já existir)
    INSERT INTO public.membros_workspace (workspace_id, user_id, role)
    VALUES (v_workspace_id, v_user_id, 'owner')
    ON CONFLICT (workspace_id, user_id) DO UPDATE
    SET role = 'owner';
    
    RAISE NOTICE 'George adicionado como owner do workspace ASF Finance';
  ELSE
    RAISE EXCEPTION 'Usuário george@ziontraffic.com.br não encontrado';
  END IF;
END $$;