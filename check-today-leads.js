import { createClient } from '@supabase/supabase-js';

const siegSupabase = createClient(
  'https://vrbgptrmmvsaoozrplng.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYmdwdHJtbXZzYW9venJwbG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTQxNDgsImV4cCI6MjA3NjM5MDE0OH0.q7GPpHQxCG-V5J0BZlKZoPy57XJiQCqLCA1Ya72HxPI'
);

const asfSupabase = createClient(
  'https://wrebkgazdlyjenbpexnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w'
);

async function checkTodayLeads() {
  const hoje = new Date().toISOString().split('T')[0];
  
  console.log(`📅 Verificando leads de HOJE: ${hoje}\n`);

  try {
    // Sieg Financeiro - com timeout e retry
    console.log('🔍 Consultando Sieg Financeiro (conversas_sieg_financeiro)...');
    const { count: siegCount, error: siegError, data: siegData } = await siegSupabase
      .from('conversas_sieg_financeiro')
      .select('*', { count: 'exact' })
      .gte('created_at', `${hoje}T00:00:00`)
      .lte('created_at', `${hoje}T23:59:59`);

    if (siegError) {
      console.error('❌ Erro Sieg:', siegError.message);
      console.log('   Tentando query alternativa...');
      
      // Tentar sem filtro de data para verificar se tabela existe
      const { data: testData, error: testError } = await siegSupabase
        .from('conversas_sieg_financeiro')
        .select('id,created_at')
        .limit(1);
      
      if (testError) {
        console.error('   ❌ Tabela não acessível:', testError.message);
      } else {
        console.log('   ✅ Tabela existe, mas query com data falhou');
      }
    } else {
      console.log(`✅ Sieg Financeiro: ${siegCount || 0} leads hoje`);
      if (siegData && siegData.length > 0) {
        console.log(`   Primeiros IDs: ${siegData.slice(0, 3).map(d => d.id).join(', ')}`);
      }
    }

    // ASF Finance
    const { count: asfCount, error: asfError } = await asfSupabase
      .from('conversas_asf')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${hoje}T00:00:00`)
      .lte('created_at', `${hoje}T23:59:59`);

    if (asfError) {
      console.error('❌ Erro ASF:', asfError.message);
    } else {
      console.log(`✅ ASF Finance: ${asfCount || 0} leads`);
    }

    console.log(`\n📊 TOTAL HOJE: ${(siegCount || 0) + (asfCount || 0)} leads\n`);

    // Últimos 5 registros do ASF (já que Sieg está com problema)
    console.log('📋 Últimos 5 registros (ASF Finance):');
    const { data: asfRecent } = await asfSupabase
      .from('conversas_asf')
      .select('id,created_at,lead_name')
      .order('created_at', { ascending: false })
      .limit(5);

    if (asfRecent && asfRecent.length > 0) {
      asfRecent.forEach((row, i) => {
        const date = new Date(row.created_at);
        const brDate = date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        console.log(`  ${i+1}. ID: ${row.id} | ${row.lead_name || 'N/A'} | ${brDate}`);
      });
    } else {
      console.log('  (Nenhum registro encontrado)');
    }
    
    // Verificar total de registros na tabela ASF
    console.log('\n📊 Estatísticas gerais (ASF):');
    const { count: totalAsf } = await asfSupabase
      .from('conversas_asf')
      .select('*', { count: 'exact', head: true });
    console.log(`  Total de registros na tabela: ${totalAsf || 0}`);

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkTodayLeads();
