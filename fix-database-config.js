import { createClient } from '@supabase/supabase-js';

const url = 'https://wrebkgazdlyjenbpexnc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w';

const supabase = createClient(url, key);

async function fixConfig() {
  console.log('🔧 Corrigindo configuração do banco SIEG...\n');

  // Atualizar o registro do SIEG para usar o mesmo banco (Zion App)
  const { data, error } = await supabase
    .from('database_configs')
    .update({
      url: 'https://wrebkgazdlyjenbpexnc.supabase.co',
      anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w'
    })
    .eq('database_key', 'sieg')
    .select();

  if (error) {
    console.error('❌ Erro ao atualizar:', error);
  } else {
    console.log('✅ Configuração atualizada com sucesso!');
    console.table(data);
  }

  // Verificar configurações atuais
  const { data: configs } = await supabase
    .from('database_configs')
    .select('*')
    .eq('active', true);

  console.log('\n📊 Configurações atuais:');
  console.table(configs);
}

fixConfig();
