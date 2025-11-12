/**
 * Script para gerar Token de Longa Duração do Meta Ads
 * 
 * INSTRUÇÕES:
 * 1. Acesse: https://developers.facebook.com/tools/explorer/
 * 2. Gere um token de curta duração com permissões: ads_read, ads_management
 * 3. Cole o token abaixo em SHORT_LIVED_TOKEN
 * 4. Execute: node scripts/generate-meta-token.js
 */

const APP_ID = 'SEU_APP_ID_AQUI'; // Ex: 123456789012345
const APP_SECRET = 'SEU_APP_SECRET_AQUI'; // Ex: abc123def456...
const SHORT_LIVED_TOKEN = 'COLE_SEU_TOKEN_AQUI'; // Token do Graph Explorer

async function generateLongLivedToken() {
  console.log('🔄 Gerando token de longa duração...\n');

  const url = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${SHORT_LIVED_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('❌ Erro:', data.error.message);
      return;
    }

    console.log('✅ Token de longa duração gerado com sucesso!\n');
    console.log('📋 Copie este token e cole no arquivo .env:\n');
    console.log('─────────────────────────────────────────────────');
    console.log(data.access_token);
    console.log('─────────────────────────────────────────────────\n');
    console.log(`⏰ Expira em: ${data.expires_in} segundos (~${Math.floor(data.expires_in / 86400)} dias)\n`);
    console.log('📝 Atualize o .env:');
    console.log(`VITE_META_ACCESS_TOKEN="${data.access_token}"`);
    console.log(`META_ACCESS_TOKEN="${data.access_token}"`);

  } catch (error) {
    console.error('❌ Erro ao gerar token:', error.message);
  }
}

generateLongLivedToken();
