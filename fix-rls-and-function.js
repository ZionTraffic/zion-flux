import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wrebkgazdlyjenbpexnc.supabase.co';
// Usando service_role key para bypass RLS (você precisa obter essa chave do dashboard)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no ambiente');
  console.log('\n📝 Para corrigir os erros, execute o seguinte SQL no Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/wrebkgazdlyjenbpexnc/sql\n');
  console.log('Cole o conteúdo do arquivo: fix-database-issues.sql\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixIssues() {
  console.log('🔧 Aplicando correções...\n');

  try {
    // 1. Criar política de leitura pública para database_configs
    console.log('📝 Configurando políticas de segurança...');
    
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow public read access" ON database_configs;
        CREATE POLICY "Allow public read access" ON database_configs
          FOR SELECT
          TO public
          USING (active = true);
      `
    });

    if (policyError) {
      console.error('❌ Erro ao criar política:', policyError);
    } else {
      console.log('✅ Política criada com sucesso');
    }

    // 2. Inserir configurações
    console.log('\n📝 Inserindo configurações de banco...');
    
    const configs = [
      {
        name: 'ASF Finance',
        database_key: 'asf',
        url: 'https://wrebkgazdlyjenbpexnc.supabase.co',
        anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w',
        active: true
      },
      {
        name: 'SIEG Financeiro',
        database_key: 'sieg',
        url: 'https://vrbgptrmmvsaoozrplng.supabase.co',
        anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYmdwdHJtbXZzYW9venJwbG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTQxNDgsImV4cCI6MjA3NjM5MDE0OH0.q7GPpHQxCG-V5J0BZlKZoPy57XJiQCqLCA1Ya72HxPI',
        active: true
      }
    ];

    for (const config of configs) {
      const { error } = await supabase
        .from('database_configs')
        .upsert(config, { onConflict: 'database_key' });

      if (error) {
        console.error(`❌ Erro ao inserir ${config.name}:`, error);
      } else {
        console.log(`✅ ${config.name} configurado`);
      }
    }

    console.log('\n✅ Correções aplicadas! Recarregue a página.');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

fixIssues();
