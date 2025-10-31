import { createClient } from '@supabase/supabase-js';

// Banco central (ASF)
const centralUrl = 'https://wrebkgazdlyjenbpexnc.supabase.co';
const centralKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w';

const central = createClient(centralUrl, centralKey);

async function checkWorkspace() {
  console.log('🔍 Verificando workspace SIEG...\n');

  // 1. Verificar se workspace existe
  const { data: workspace, error: wsError } = await central
    .from('workspaces')
    .select('*')
    .eq('id', 'b939a331-44d9-4122-ab23-dcd60413bd46')
    .maybeSingle();

  if (wsError) {
    console.error('❌ Erro ao buscar workspace:', wsError);
    return;
  }

  if (!workspace) {
    console.log('❌ Workspace SIEG não encontrado!');
    return;
  }

  console.log('✅ Workspace encontrado:');
  console.table(workspace);

  // 2. Verificar database_configs
  const { data: dbConfigs, error: dbError } = await central
    .from('database_configs')
    .select('*')
    .eq('active', true);

  if (dbError) {
    console.error('❌ Erro ao buscar database_configs:', dbError);
  } else {
    console.log('\n📊 Database configs ativos:');
    console.table(dbConfigs);
  }

  // 3. Verificar membros do workspace
  const { data: members, error: membersError } = await central
    .from('membros_workspace')
    .select('*, profiles(email)')
    .eq('workspace_id', 'b939a331-44d9-4122-ab23-dcd60413bd46');

  if (membersError) {
    console.error('❌ Erro ao buscar membros:', membersError);
  } else {
    console.log('\n👥 Membros do workspace:');
    console.table(members);
  }
}

checkWorkspace();
