-- Adicionar george@ziontraffic.com.br como admin master do sistema
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Buscar o user_id do email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'george@ziontraffic.com.br';

  -- Se o usuário existir, adicionar role de admin
  IF v_user_id IS NOT NULL THEN
    -- Inserir role de admin (ignora se já existir)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Usuário george@ziontraffic.com.br configurado como admin master';
  ELSE
    RAISE NOTICE 'Usuário george@ziontraffic.com.br não encontrado no sistema';
  END IF;
END $$;