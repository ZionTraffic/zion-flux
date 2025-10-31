import { createClient } from '@supabase/supabase-js';

const url = 'https://wrebkgazdlyjenbpexnc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w';

const supabase = createClient(url, key);

async function testASF() {
  console.log('🔍 Testando acesso direto à tabela conversas_asf...\n');

  const workspaceId = '01d0cff7-2de1-4731-af0d-ee62f5ba974b';
  const minDate = '2025-10-01T00:00:00';

  // 1. Contar total
  const { count: total, error: countError } = await supabase
    .from('conversas_asf')
    .select('*', { count: 'exact', head: true })
    .eq('id_workspace', workspaceId)
    .gte('created_at', minDate);

  if (countError) {
    console.error('❌ Erro ao contar:', countError);
    return;
  }

  console.log(`✅ Total de registros: ${total}\n`);

  // 2. Buscar últimos 10
  const { data, error } = await supabase
    .from('conversas_asf')
    .select('id, lead_name, phone, tag, created_at')
    .eq('id_workspace', workspaceId)
    .gte('created_at', minDate)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Erro ao buscar dados:', error);
    return;
  }

  console.log('📋 Últimos 10 registros:');
  console.table(data);

  // 3. Contar por tag
  const { data: allData, error: allError } = await supabase
    .from('conversas_asf')
    .select('tag')
    .eq('id_workspace', workspaceId)
    .gte('created_at', minDate);

  if (allError) {
    console.error('❌ Erro ao buscar tags:', allError);
    return;
  }

  const tagCount = {};
  allData.forEach(row => {
    const tag = row.tag || 'SEM TAG';
    tagCount[tag] = (tagCount[tag] || 0) + 1;
  });

  console.log('\n📊 Distribuição por tag:');
  console.table(tagCount);

  // 4. Verificar workspace
  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (wsError) {
    console.error('❌ Erro ao buscar workspace:', wsError);
  } else {
    console.log('\n🏢 Workspace ASF Finance:');
    console.table(ws);
  }
}

testASF();
