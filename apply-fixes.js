import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://wrebkgazdlyjenbpexnc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFixes() {
  console.log('🔧 Aplicando correções no banco de dados...\n');

  try {
    // 1. Popular database_configs
    console.log('📝 Inserindo configurações de banco...');
    
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
      const { data, error } = await supabase
        .from('database_configs')
        .upsert(config, { onConflict: 'database_key' });

      if (error) {
        console.error(`❌ Erro ao inserir ${config.name}:`, error);
      } else {
        console.log(`✅ ${config.name} configurado com sucesso`);
      }
    }

    // 2. Verificar se as configurações foram inseridas
    console.log('\n📋 Verificando configurações inseridas...');
    const { data: allConfigs, error: fetchError } = await supabase
      .from('database_configs')
      .select('*');

    if (fetchError) {
      console.error('❌ Erro ao buscar configurações:', fetchError);
    } else {
      console.log(`✅ Total de configurações: ${allConfigs.length}`);
      console.table(allConfigs.map(c => ({
        Nome: c.name,
        Key: c.database_key,
        Ativo: c.active
      })));
    }

    console.log('\n✅ Correções aplicadas com sucesso!');
    console.log('\n⚠️ IMPORTANTE: A função RPC get_atendimentos_metrics precisa ser criada manualmente no SQL Editor do Supabase.');
    console.log('Execute o conteúdo do arquivo fix-database-issues.sql no SQL Editor.');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

applyFixes();
