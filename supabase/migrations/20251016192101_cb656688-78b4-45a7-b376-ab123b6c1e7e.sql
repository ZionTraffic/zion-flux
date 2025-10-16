-- Criar usuário george@ziontraffic.com.br no sistema (versão corrigida)
DO $$
DECLARE
  v_user_id uuid;
  v_encrypted_pw text;
BEGIN
  -- Primeiro, verificar se o usuário já existe
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'george@ziontraffic.com.br';

  -- Se não existir, criar o usuário
  IF v_user_id IS NULL THEN
    -- Gerar ID único para o usuário
    v_user_id := gen_random_uuid();
    
    -- Gerar hash da senha usando crypt
    v_encrypted_pw := crypt('Met@581017', gen_salt('bf'));
    
    -- Inserir usuário no auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'george@ziontraffic.com.br',
      v_encrypted_pw,
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"George"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Inserir identidade no auth.identities (COM provider_id)
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id::text,  -- provider_id é o mesmo que o user_id em string
      v_user_id,
      format('{"sub":"%s","email":"%s"}', v_user_id::text, 'george@ziontraffic.com.br')::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    -- Adicionar role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Usuário george@ziontraffic.com.br criado com sucesso como admin master';
  ELSE
    -- Garantir que tem a role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Usuário george@ziontraffic.com.br já existe com ID: %', v_user_id;
  END IF;
END $$;