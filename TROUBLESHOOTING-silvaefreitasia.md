# Troubleshooting - silvaefreitasia@gmail.com

## Problemas Identificados

### 1. ❌ Erro 401 na função fetch-meta-ads-data
**Causa**: O hook `useMetaAdsData` estava usando o cliente Supabase anônimo (`defaultSupabase`) ao invés do cliente autenticado do contexto.

**Solução**: ✅ **CORRIGIDO** - Alterado para usar `supabase` do contexto `DatabaseContext`.

**Arquivo**: `src/hooks/useMetaAdsData.ts` linha 173

---

### 2. ❌ User has no access to any page
**Causa**: O usuário não possui permissões configuradas no workspace ASF.

**Solução**: Execute o script SQL para configurar permissões básicas:

```bash
# Abra o Supabase SQL Editor e execute:
scripts/setup-user-silvaefreitasia.sql
```

Este script irá:
- ✅ Verificar se o usuário existe
- ✅ Adicionar ao workspace ASF (se ainda não for membro)
- ✅ Configurar permissões básicas de visualização:
  - `dashboard:view`
  - `traffic:view`
  - `qualification:view`
  - `analysis:view`
  - `reports:view`

---

### 3. ⚠️ Erros 400 nas RPCs de métricas
**Causa**: Possíveis problemas com parâmetros ou datas inválidas nas chamadas RPC.

**Logs**:
```
wrebkgazdlyjenbpexnc…ndimentos_metrics:1 Failed to load resource: 400
wrebkgazdlyjenbpexnc…pi_totais_periodo:1 Failed to load resource: 400
```

**Próximos passos**:
1. Verificar se as datas estão no formato correto
2. Verificar se o workspace_id está sendo passado corretamente
3. Verificar os logs do Supabase para mais detalhes do erro

---

## Como Testar

1. **Execute o script SQL**:
   - Abra o Supabase Dashboard
   - Vá em SQL Editor
   - Cole o conteúdo de `scripts/setup-user-silvaefreitasia.sql`
   - Execute

2. **Limpe o cache do navegador**:
   - Pressione `Cmd + Shift + R` (Mac) ou `Ctrl + Shift + R` (Windows)
   - Ou limpe o localStorage manualmente

3. **Faça login novamente**:
   - Logout
   - Login com `silvaefreitasia@gmail.com`

4. **Verifique os logs**:
   - Abra o Console do navegador (F12)
   - Procure por mensagens de sucesso:
     - `✅ Workspace carregado com sucesso`
     - `✅ Mostrando Tráfego para ASF`
     - Sem erros 401 ou 400

---

## Verificação Manual no Banco

Para verificar se as permissões foram configuradas corretamente:

```sql
SELECT 
  u.email,
  mw.role,
  w.name as workspace_name,
  w.database,
  up.permission_key,
  up.granted
FROM auth.users u
JOIN membros_workspace mw ON u.id = mw.user_id
JOIN workspaces w ON mw.workspace_id = w.id
LEFT JOIN user_permissions up ON u.id = up.user_id AND w.id = up.workspace_id
WHERE u.email = 'silvaefreitasia@gmail.com'
ORDER BY up.permission_key;
```

**Resultado esperado**:
- Role: `member`
- Workspace: ASF Finance
- 5 permissões com `granted = true`
