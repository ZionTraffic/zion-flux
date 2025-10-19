-- Adicionar coluna para mapear o secret da service role key de cada banco
ALTER TABLE public.database_configs 
ADD COLUMN IF NOT EXISTS service_role_secret_name text;

-- Atualizar registros existentes para mapear os secrets corretos
UPDATE public.database_configs 
SET service_role_secret_name = 'SUPABASE_SERVICE_ROLE_KEY' 
WHERE database_key = 'asf';

UPDATE public.database_configs 
SET service_role_secret_name = 'SIEG_SERVICE_ROLE_KEY' 
WHERE database_key = 'sieg';