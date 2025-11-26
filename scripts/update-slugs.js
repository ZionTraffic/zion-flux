// Script para atualizar slugs dos tenants
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wrebkgazdlyjenbpexnc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateSlugs() {
  console.log('📋 Buscando tenants atuais...\n');
  
  // Buscar tenants atuais
  const { data: tenants, error: fetchError } = await supabase
    .from('tenants_new')
    .select('id, name, slug')
    .order('name');
  
  if (fetchError) {
    console.error('❌ Erro ao buscar tenants:', fetchError);
    return;
  }
  
  console.log('Tenants encontrados:');
  tenants.forEach(t => console.log(`  - ${t.name} (slug: ${t.slug})`));
  console.log('');
  
  // Atualizar SIEG Financeiro
  const siegFinanceiro = tenants.find(t => 
    t.name.toLowerCase().includes('sieg') && t.name.toLowerCase().includes('financeiro')
  );
  
  if (siegFinanceiro && siegFinanceiro.slug !== 'sieg-financeiro') {
    console.log(`🔄 Atualizando "${siegFinanceiro.name}" -> slug: sieg-financeiro`);
    const { error } = await supabase
      .from('tenants_new')
      .update({ slug: 'sieg-financeiro' })
      .eq('id', siegFinanceiro.id);
    
    if (error) console.error('  ❌ Erro:', error);
    else console.log('  ✅ Atualizado!');
  }
  
  // Atualizar SIEG Pré-Vendas
  const siegPreVendas = tenants.find(t => 
    t.name.toLowerCase().includes('sieg') && 
    (t.name.toLowerCase().includes('pré-vendas') || t.name.toLowerCase().includes('pre-vendas') || t.name.toLowerCase().includes('pré vendas'))
  );
  
  if (siegPreVendas && siegPreVendas.slug !== 'sieg-pre-vendas') {
    console.log(`🔄 Atualizando "${siegPreVendas.name}" -> slug: sieg-pre-vendas`);
    const { error } = await supabase
      .from('tenants_new')
      .update({ slug: 'sieg-pre-vendas' })
      .eq('id', siegPreVendas.id);
    
    if (error) console.error('  ❌ Erro:', error);
    else console.log('  ✅ Atualizado!');
  }
  
  // Atualizar ASF Finance
  const asfFinance = tenants.find(t => 
    t.name.toLowerCase().includes('asf') && t.name.toLowerCase().includes('finance')
  );
  
  if (asfFinance && asfFinance.slug !== 'asf-finance') {
    console.log(`🔄 Atualizando "${asfFinance.name}" -> slug: asf-finance`);
    const { error } = await supabase
      .from('tenants_new')
      .update({ slug: 'asf-finance' })
      .eq('id', asfFinance.id);
    
    if (error) console.error('  ❌ Erro:', error);
    else console.log('  ✅ Atualizado!');
  }
  
  // Verificar resultado
  console.log('\n📋 Verificando resultado...\n');
  const { data: updated } = await supabase
    .from('tenants_new')
    .select('id, name, slug')
    .order('name');
  
  console.log('Tenants atualizados:');
  updated.forEach(t => console.log(`  - ${t.name} (slug: ${t.slug})`));
  console.log('\n✅ Concluído!');
}

updateSlugs();
