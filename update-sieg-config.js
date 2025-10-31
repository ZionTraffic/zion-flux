import { createClient } from '@supabase/supabase-js';

const url = 'https://wrebkgazdlyjenbpexnc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w';

const supabase = createClient(url, key);

async function updateConfig() {
  console.log('🔧 Atualizando configuração SIEG para usar o banco Zion App...\n');

  // Primeiro, verificar o registro atual
  const { data: current, error: fetchError } = await supabase
    .from('database_configs')
    .select('*')
    .eq('database_key', 'sieg')
    .single();

  if (fetchError) {
    console.error('❌ Erro ao buscar config atual:', fetchError);
    return;
  }

  console.log('📋 Configuração atual do SIEG:');
  console.table(current);

  // Atualizar para usar o mesmo banco
  const { data: updated, error: updateError } = await supabase
    .from('database_configs')
    .update({
      url: 'https://wrebkgazdlyjenbpexnc.supabase.co',
      anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w'
    })
    .eq('id', current.id)
    .select();

  if (updateError) {
    console.error('❌ Erro ao atualizar:', updateError);
  } else {
    console.log('\n✅ Atualização concluída!');
    console.table(updated);
  }
}

updateConfig();
