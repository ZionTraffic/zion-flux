import { createClient } from '@supabase/supabase-js';

const url = 'https://wrebkgazdlyjenbpexnc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w';

const supabase = createClient(url, key);

async function finalFix() {
  console.log('🔧 Aplicando correção final...\n');

  // Atualizar database_configs para SIEG usar o mesmo banco
  const { error: updateError } = await supabase
    .from('database_configs')
    .update({
      url: 'https://wrebkgazdlyjenbpexnc.supabase.co',
      anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w'
    })
    .eq('database_key', 'sieg');

  if (updateError) {
    console.error('❌ Erro ao atualizar config:', updateError);
  } else {
    console.log('✅ Configuração do banco atualizada!');
  }

  // Verificar configurações finais
  const { data: configs } = await supabase
    .from('database_configs')
    .select('name, database_key, url')
    .eq('active', true);

  console.log('\n📊 Configurações atualizadas:');
  configs.forEach(c => {
    console.log(`  ${c.name} (${c.database_key}): ${c.url}`);
  });

  // Testar acesso aos dados SIEG
  const { count } = await supabase
    .from('conversas_sieg_financeiro')
    .select('*', { count: 'exact', head: true })
    .eq('id_workspace', 'b939a331-44d9-4122-ab23-dcd60413bd46');

  console.log(`\n✅ Registros SIEG encontrados: ${count}`);
}

finalFix();
