import { createClient } from '@supabase/supabase-js';

// Banco central (ZION APP) - Nova estrutura multi-tenant
const centralSupabase = createClient(
  'https://wrebkgazdlyjenbpexnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w'
);

async function checkTodayLeads() {
  const hoje = new Date().toISOString().split('T')[0];
  
  console.log(`🔍 Buscando ÚLTIMO LEAD do Sieg Pré-vendas...\n`);

  try {
    // 1. Buscar tenant_ids únicos da tabela tenant_conversations
    console.log('📋 Buscando tenant_ids da tabela tenant_conversations...');
    const { data: conversations, error: convError } = await centralSupabase
      .from('tenant_conversations')
      .select('tenant_id')
      .limit(1000);

    if (convError) {
      console.error('❌ Erro ao buscar conversations:', convError);
      return;
    }

    // Extrair tenant_ids únicos
    const uniqueTenantIds = [...new Set(conversations?.map(c => c.tenant_id).filter(Boolean))];
    
    console.log(`\n📊 Encontrados ${uniqueTenantIds.length} tenant_ids únicos:`);
    uniqueTenantIds.forEach(id => {
      console.log(`  - ${id}`);
    });

    // 2. Buscar tenant que CONTÉM 907e1 (Sieg Pré-vendas)
    let siegTenantId = uniqueTenantIds.find(id => id.includes('907e1'));
    
    if (!siegTenantId) {
      console.log('\n⚠️  Tenant com ID contendo 907e1... não encontrado');
      console.log('Usando o primeiro tenant_id encontrado...');
      siegTenantId = uniqueTenantIds[0];
    } else {
      console.log(`\n✅ Encontrado tenant Sieg Pré-vendas!`);
    }
    
    console.log(`\n✅ Usando tenant_id: ${siegTenantId}\n`);

    // 3. Buscar ÚLTIMO LEAD (qualquer data)
    console.log('📋 Buscando último lead...');
    const { data: lastLead, error: lastError } = await centralSupabase
      .from('tenant_conversations')
      .select('id, nome, phone, tag, source, created_at, valor_em_aberto, valor_recuperado_ia, valor_recuperado_humano')
      .eq('tenant_id', siegTenantId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (lastError) {
      console.error('❌ Erro ao buscar último lead:', lastError);
      return;
    }

    if (!lastLead || lastLead.length === 0) {
      console.log('❌ Nenhum lead encontrado para este tenant');
      return;
    }

    const lead = lastLead[0];
    const date = new Date(lead.created_at);
    const brDate = date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    
    console.log('\n✅ ÚLTIMO LEAD:');
    console.log('═'.repeat(60));
    console.log(`📝 Nome: ${lead.nome || 'N/A'}`);
    console.log(`📞 Telefone: ${lead.phone || 'N/A'}`);
    console.log(`🏷️  Tag: ${lead.tag || 'N/A'}`);
    console.log(`📍 Source: ${lead.source || 'N/A'}`);
    console.log(`📅 Data: ${brDate}`);
    if (lead.valor_em_aberto) console.log(`💰 Valor em aberto: ${lead.valor_em_aberto}`);
    if (lead.valor_recuperado_ia) console.log(`🤖 Valor recuperado IA: ${lead.valor_recuperado_ia}`);
    if (lead.valor_recuperado_humano) console.log(`👤 Valor recuperado Humano: ${lead.valor_recuperado_humano}`);
    console.log('═'.repeat(60));
    
    // Contar total de leads
    const { count: totalLeads } = await centralSupabase
      .from('tenant_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', siegTenantId);
    
    // Contar leads de hoje
    const { count: totalToday } = await centralSupabase
      .from('tenant_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', siegTenantId)
      .gte('created_at', `${hoje}T00:00:00`)
      .lte('created_at', `${hoje}T23:59:59`);
    
    console.log(`\n📊 Total de leads: ${totalLeads || 0}`);
    console.log(`📅 Leads hoje (${hoje}): ${totalToday || 0}`);

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkTodayLeads();
