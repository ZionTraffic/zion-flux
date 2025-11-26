/**
 * Script para executar migração multi-tenancy no Zion App
 * Autor: Cascade AI
 * Data: 2024-11-03
 */

// Configurações
const FUNCTION_URL = 'https://wrebkgazdlyjenbpexnc.supabase.co/functions/v1/create-workspace';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w';

// Função para executar uma etapa
async function executeStep(stepName, stepDescription) {
  console.log(`🚀 Executando: ${stepDescription}`);
  console.log(`Etapa: ${stepName}`);
  console.log('---');
  
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'migrate',
        step: stepName
      })
    });
    
    const result = await response.json();
    console.log('Resposta:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Sucesso!');
      return result;
    } else {
      console.error(`❌ Erro na etapa ${stepName}`);
      console.error('Resposta completa:', result);
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Erro de rede na etapa ${stepName}:`, error.message);
    process.exit(1);
  }
  
  console.log('');
  console.log('⏳ Aguardando 3 segundos...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('');
}

// Função principal
async function main() {
  console.log('🚀 INICIANDO MIGRAÇÃO MULTI-TENANCY - ZION APP');
  console.log('================================================');
  console.log('');
  
  try {
    // Etapa 1: Criar tabela tenants_new
    console.log('📊 ETAPA 1/7: Criando tabela empresas');
    await executeStep('create_tenants', 'Criar tabela empresas');
    
    // Etapa 2: Criar tabela usuarios_empresas
    console.log('👥 ETAPA 2/7: Criando tabela usuarios_empresas');
    await executeStep('create_tenant_users', 'Criar tabela usuarios_empresas');
    
    // Etapa 3: Criar funções helper
    console.log('🔧 ETAPA 3/7: Criando funções helper');
    await executeStep('create_helper_functions', 'Criar funções helper multi-tenancy');
    
    // Etapa 4: Criar tabelas de dados
    console.log('📊 ETAPA 4/7: Criando tabelas de dados');
    await executeStep('create_data_tables', 'Criar tabelas leads, conversas_leads, tenant_ad_costs');
    
    // Etapa 5: Migrar dados existentes
    console.log('🔄 ETAPA 5/7: Migrando dados existentes');
    console.log('⚠️  Esta etapa pode demorar mais (migrando 11.533+ registros)');
    await executeStep('migrate_data', 'Migrar dados das tabelas originais');
    
    // Etapa 6: Criar políticas RLS
    console.log('🔒 ETAPA 6/7: Criando políticas RLS');
    await executeStep('create_rls_policies', 'Criar políticas de Row Level Security');
    
    // Etapa 7: Validar migração
    console.log('✅ ETAPA 7/7: Validando migração');
    const validation = await executeStep('validate_migration', 'Validar integridade dos dados migrados');
    
    console.log('================================================');
    console.log('✅ MIGRAÇÃO MULTI-TENANCY CONCLUÍDA COM SUCESSO!');
    console.log('');
    console.log('🎉 Próximos passos:');
    console.log('1. Verificar dados no Supabase Dashboard');
    console.log('2. Testar acesso às novas tabelas');
    console.log('3. Atualizar frontend para usar multi-tenancy');
    console.log('4. Implementar seletor de tenant');
    console.log('');
    console.log('📊 Tabelas criadas:');
    console.log('- empresas (empresas/clientes)');
    console.log('- usuarios_empresas (usuários por empresa)');
    console.log('- leads (leads isolados)');
    console.log('- conversas_leads (conversas isoladas)');
    console.log('- tenant_ad_costs (custos isolados)');
    console.log('');
    console.log('🔒 Segurança:');
    console.log('- RLS ativado em todas as tabelas');
    console.log('- Isolamento completo por tenant');
    console.log('- Funções helper para contexto');
    console.log('');
    
    if (validation.result && validation.result.data) {
      console.log('📈 Dados migrados:');
      validation.result.data.forEach(row => {
        console.log(`- ${row.tabela}: ${row.registros} registros`);
      });
    }
    
    console.log('================================================');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    process.exit(1);
  }
}

// Executar script
main();
