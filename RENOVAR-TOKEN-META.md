# 🔐 Guia: Renovar Token do Meta Ads

## ❌ Problema Atual
```
API access blocked - OAuthException (code 200)
```

O token atual está **bloqueado** ou **expirado**.

---

## ✅ Solução Rápida (5 minutos)

### **Passo 1: Acessar Graph API Explorer**
1. Abra: https://developers.facebook.com/tools/explorer/
2. Faça login com sua conta Facebook/Meta

### **Passo 2: Selecionar Aplicativo**
1. No canto superior direito, clique em **"Meta App"**
2. Selecione o app vinculado às contas de anúncios:
   - `ASF FINANCE - 01` (ID: 1162106082007438)
   - `C03- ASF FINANCE` (ID: 704043095364449)

### **Passo 3: Configurar Permissões**
1. Clique em **"Generate Access Token"**
2. Marque as seguintes permissões:
   - ✅ `ads_read` - Ler dados de anúncios
   - ✅ `ads_management` - Gerenciar anúncios
   - ✅ `business_management` - Gerenciar conta comercial
   - ✅ `read_insights` - Ler insights (opcional mas recomendado)

3. Clique em **"Generate Token"**
4. Autorize o acesso quando solicitado

### **Passo 4: Copiar Token**
1. Copie o token gerado (começa com `EAAP...`)
2. É um token longo, copie tudo!

### **Passo 5: Atualizar .env**
1. Abra o arquivo `.env` na raiz do projeto
2. Substitua as linhas:

```env
META_ACCESS_TOKEN="COLE_SEU_NOVO_TOKEN_AQUI"
VITE_META_ACCESS_TOKEN="COLE_SEU_NOVO_TOKEN_AQUI"
```

3. Salve o arquivo

### **Passo 6: Reiniciar Servidor**
```bash
# Parar o servidor (Ctrl+C no terminal)
# Iniciar novamente
npm run dev
```

### **Passo 7: Testar**
1. Recarregue a página de Tráfego (F5)
2. Verifique o console - deve aparecer:
   ```
   ✅ Dados Meta Ads carregados com sucesso!
   ```

---

## 🔒 Solução Avançada: Token de Longa Duração (60 dias)

### **Requisitos**
- App ID do Facebook
- App Secret do Facebook
- Token de curta duração (do Graph Explorer)

### **Passos**

1. **Obter credenciais do app**:
   - Acesse: https://developers.facebook.com/apps/
   - Selecione seu app
   - Vá em **Configurações > Básico**
   - Copie:
     - **ID do Aplicativo**
     - **Chave Secreta do Aplicativo**

2. **Editar script**:
   - Abra: `scripts/generate-meta-token.js`
   - Preencha:
     ```javascript
     const APP_ID = 'SEU_APP_ID';
     const APP_SECRET = 'SEU_APP_SECRET';
     const SHORT_LIVED_TOKEN = 'TOKEN_DO_GRAPH_EXPLORER';
     ```

3. **Executar**:
   ```bash
   node scripts/generate-meta-token.js
   ```

4. **Copiar token gerado** e atualizar `.env`

---

## 🚨 Problemas Comuns

### **Erro: "Invalid OAuth access token"**
- ✅ Verifique se copiou o token completo
- ✅ Certifique-se que não há espaços extras
- ✅ Token deve começar com `EAAP`

### **Erro: "Permissions error"**
- ✅ Marque todas as permissões necessárias no Graph Explorer
- ✅ Certifique-se que sua conta tem acesso às contas de anúncios

### **Erro: "Token expired"**
- ✅ Tokens de curta duração expiram em 1-2 horas
- ✅ Use a solução avançada para gerar token de 60 dias

---

## 📞 Suporte

Se continuar com problemas:
1. Verifique se sua conta tem acesso administrativo às contas de anúncios
2. Confirme que o app está aprovado para produção
3. Entre em contato com o suporte do Meta Business

---

## ✅ Checklist Final

- [ ] Token gerado no Graph API Explorer
- [ ] Permissões corretas marcadas
- [ ] Token copiado completamente
- [ ] Arquivo `.env` atualizado
- [ ] Servidor reiniciado
- [ ] Página recarregada
- [ ] Console sem erros de API

---

**Última atualização**: 10/11/2025
