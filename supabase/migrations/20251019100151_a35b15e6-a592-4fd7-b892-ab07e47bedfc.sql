-- Criar tabela de configurações de bancos de dados
CREATE TABLE public.database_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  database_key text UNIQUE NOT NULL,
  url text NOT NULL,
  anon_key text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.database_configs ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas owners podem gerenciar bancos
CREATE POLICY "Owners can manage databases"
  ON public.database_configs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Inserir os bancos existentes (ASF e SIEG)
INSERT INTO public.database_configs (name, database_key, url, anon_key) VALUES
('ASF Finance', 'asf', 'https://wrebkgazdlyjenbpexnc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w'),
('SIEG', 'sieg', 'https://vrbgptrmmvsaoozrplng.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYmdwdHJtbXZzYW9venJwbG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTQxNDgsImV4cCI6MjA3NjM5MDE0OH0.q7GPpHQxCG-V5J0BZlKZoPy57XJiQCqLCA1Ya72HxPI');