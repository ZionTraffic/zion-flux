-- Cria tabela para guardar secrets internos
CREATE TABLE IF NOT EXISTS public.internal_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insere o secret para o trigger (você precisará atualizar o valor depois)
INSERT INTO public.internal_secrets (key, value)
VALUES ('trigger_secret', 'SUBSTITUA_PELO_SEU_SECRET')
ON CONFLICT (key) DO NOTHING;

-- RLS: só funções SECURITY DEFINER podem ler
ALTER TABLE public.internal_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ninguém pode ler diretamente" 
ON public.internal_secrets 
FOR ALL 
USING (false);

-- Atualiza a função trigger para buscar o secret da tabela
CREATE OR REPLACE FUNCTION public.trigger_analisar_fluxo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_url text := 'https://wrebkgazdlyjenbpexnc.supabase.co';
  internal_secret text;
BEGIN
  -- Busca o secret da tabela
  SELECT value INTO internal_secret 
  FROM public.internal_secrets 
  WHERE key = 'trigger_secret';

  -- Chama a edge function de forma assíncrona usando pg_net
  PERFORM net.http_post(
    url := project_url || '/functions/v1/analisar_fluxo_ia',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', internal_secret
    ),
    body := jsonb_build_object(
      'workspace_id', NEW.workspace_id,
      'conversa_id', NEW.id,
      'mensagens', NEW.messages
    )
  );

  RETURN NEW;
END;
$$;