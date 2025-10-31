import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wrebkgazdlyjenbpexnc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConversas() {
  console.log('🔍 Verificando tabela conversas_asf...\n');
  
  const workspaceId = '01d0cff7-2de1-4731-af0d-ee62f5ba974b';
  
  const { count: totalCount, error: countError } = await supabase
    .from('conversas_asf')
    .select('*', { count: 'exact', head: true });
  
  console.log('📊 Total de registros:', totalCount);
  
  if (countError) {
    console.error('❌ Erro:', countError.message);
    return;
  }
  
  const { count: workspaceCount } = await supabase
    .from('conversas_asf')
    .select('*', { count: 'exact', head: true })
    .eq('id_workspace', workspaceId);
  
  console.log('🏢 Registros workspace ASF:', workspaceCount);
  
  const { data: sample } = await supabase
    .from('conversas_asf')
    .select('id, phone, tag, created_at')
    .eq('id_workspace', workspaceId)
    .order('created_at', { ascending: false })
    .limit(3);
  
  console.log('\n📋 Últimas conversas:', JSON.stringify(sample, null, 2));
}

checkConversas().catch(console.error);
