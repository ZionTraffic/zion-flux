-- Habilita a extensão pg_net para fazer chamadas HTTP
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Função trigger para chamar a edge function de análise
CREATE OR REPLACE FUNCTION public.trigger_analisar_fluxo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_url text := 'https://wrebkgazdlyjenbpexnc.supabase.co';
  service_role_key text := current_setting('app.settings.service_role_key', true);
BEGIN
  -- Chama a edge function de forma assíncrona usando pg_net
  PERFORM net.http_post(
    url := project_url || '/functions/v1/analisar_fluxo_ia',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
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

-- Remove o trigger anterior se existir
DROP TRIGGER IF EXISTS tg_analisar_fluxo ON public.historico_conversas;

-- Cria o trigger que dispara após inserção de nova conversa
CREATE TRIGGER tg_analisar_fluxo
AFTER INSERT ON public.historico_conversas
FOR EACH ROW
EXECUTE FUNCTION public.trigger_analisar_fluxo();