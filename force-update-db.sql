-- Atualizar configuração do SIEG para usar o banco Zion App
UPDATE database_configs
SET 
  url = 'https://wrebkgazdlyjenbpexnc.supabase.co',
  anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w'
WHERE database_key = 'sieg';

-- Verificar resultado
SELECT name, database_key, url 
FROM database_configs 
WHERE active = true
ORDER BY created_at;
