import { createClient } from '@supabase/supabase-js';

const url = 'https://wrebkgazdlyjenbpexnc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w';

const supabase = createClient(url, key);

async function checkColumns() {
  // Buscar 1 registro para ver as colunas
  const { data, error } = await supabase
    .from('conversas_sieg_financeiro')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Erro:', error);
  } else {
    console.log('✅ Estrutura da tabela conversas_sieg_financeiro:');
    console.log('\n📋 Colunas disponíveis:');
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]).join(', '));
      console.log('\n📊 Exemplo de registro:');
      console.table(data[0]);
    }
  }
}

checkColumns();
