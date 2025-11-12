import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wrebkgazdlyjenbpexnc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMessagesFormat() {
  console.log('🔍 Verificando formato das mensagens no banco...\n');

  // Buscar conversas recentes com tag T2
  const { data: conversations, error } = await supabase
    .from('tenant_conversations')
    .select('*')
    .ilike('tag', '%T2%')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  if (!conversations || conversations.length === 0) {
    console.log('⚠️ Nenhuma conversa encontrada');
    return;
  }

  console.log(`📋 Encontradas ${conversations.length} conversas T2\n`);

  conversations.forEach((conv, idx) => {
    console.log(`\n========== CONVERSA ${idx + 1} ==========`);
    console.log('- ID:', conv.id);
    console.log('- Nome:', conv.nome);
    console.log('- Telefone:', conv.phone);
    console.log('- Tag:', conv.tag);
    console.log('\n📨 Mensagens (tipo):', typeof conv.messages);
    console.log('📨 Mensagens (é array?):', Array.isArray(conv.messages));
    console.log('📨 Mensagens (quantidade):', conv.messages?.length || 0);

    if (Array.isArray(conv.messages) && conv.messages.length > 0) {
      console.log('\n📝 Formato bruto das mensagens:');
      console.log(JSON.stringify(conv.messages, null, 2));
    }
  });
}

checkMessagesFormat().catch(console.error);
