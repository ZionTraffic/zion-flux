const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ui/Header.tsx');

try {
  console.log('🔧 Corrigindo Header.tsx...');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Substituir para master user sempre ver Configurações
  content = content.replace(
    '{canAccessSettings && (',
    '{(isMasterUser || canAccessSettings) && ('
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Header.tsx corrigido com sucesso!');
  console.log('🎯 Master user agora sempre verá o botão de Configurações');
  console.log('🔄 Recarregue o dashboard no navegador');
} catch (error) {
  console.error('❌ Erro:', error.message);
}
