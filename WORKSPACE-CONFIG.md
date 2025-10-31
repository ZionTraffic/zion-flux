# Configuração de Workspaces - Zion App

## 📊 Arquitetura

O sistema usa **um único banco de dados** (Zion App) com **tabelas específicas** para cada workspace.

```
┌─────────────────────────────────────────────────────────────────┐
│   BANCO ÚNICO: Zion App                                         │
│   URL: https://wrebkgazdlyjenbpexnc.supabase.co               │
│   Projeto: wrebkgazdlyjenbpexnc                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Workspace: ASF Finance                                      │
│     ID: 01d0cff7-2de1-4731-af0d-ee62f5ba974b                   │
│     Slug: asf                                                   │
│     Database Key: asf                                           │
│     Tabela: conversas_asf                                       │
│     Registros: 167                                              │
│     Período: 01/10/2025 - 29/10/2025                           │
│     Tags: 7 diferentes                                          │
│                                                                 │
│  ✅ Workspace: Sieg Financeiro                                  │
│     ID: b939a331-44d9-4122-ab23-dcd60413bd46                   │
│     Slug: sieg                                                  │
│     Database Key: sieg                                          │
│     Tabela: conversas_sieg_financeiro                           │
│     Registros: 8.446                                            │
│     Período: 23/10/2025 - 29/10/2025                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Configuração Atual

### Database Configs
| Nome | Key | URL | Status |
|------|-----|-----|--------|
| ASF Finance | asf | wrebkgazdlyjenbpexnc.supabase.co | ✅ Ativo |
| SIEG Financeiro | sieg | wrebkgazdlyjenbpexnc.supabase.co | ✅ Ativo |

### Workspaces
| Nome | Slug | Database | Tabela |
|------|------|----------|--------|
| ASF Finance | asf | asf | conversas_asf |
| Sieg Financeiro | sieg | sieg | conversas_sieg_financeiro |

## 📋 Estrutura das Tabelas

### conversas_asf
- `id` (bigint)
- `id_workspace` (uuid)
- `lead_name` (text) ⭐
- `phone` (text)
- `source` (text)
- `tag` (text)
- `messages` (json)
- `created_at` (timestamp)
- `data_entrada` (text)

### conversas_sieg_financeiro
- `id` (bigint)
- `id_workspace` (uuid)
- `nome` (text) ⭐ (diferente!)
- `phone` (text)
- `started` (timestamp)
- `tag` (text)
- `analista` (text)
- `messages` (jsonb)
- `message_automatic` (text)
- `csat` (text)
- `tempo_medio_resposta` (text)
- `data_transferencia` (timestamp)
- `data_conclusao` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `data_resposta_csat` (timestamp)
- `valor_em_aberto` (text)
- `tempo_primeira_resposta` (text)

## ⚠️ Diferenças Importantes

### Nome do Lead
- **ASF**: usa `lead_name`
- **SIEG**: usa `nome`
- **Código**: já trata ambos com `conv.lead_name || conv.nome`

### Mensagens
- **ASF**: `messages` (json)
- **SIEG**: `messages` (jsonb)

### Campos Exclusivos SIEG
- `analista` - Nome do analista responsável
- `csat` - Satisfação do cliente
- `data_resposta_csat` - Data da resposta CSAT
- `tempo_medio_resposta` - Tempo médio de resposta
- `tempo_primeira_resposta` - Tempo da primeira resposta
- `valor_em_aberto` - Valor em aberto

## 🎯 Mapeamento de Tags

### ASF Finance (Padrão)
- T1 - Novo Lead
- T2 - Qualificando
- T3 - Qualificado
- T4 - Agendamento
- T5 - Desqualificado

### SIEG Financeiro (Específico)
- T1 - Sem Resposta
- T2 - Respondido
- T3 - Pago IA
- T4 - Transferido
- T5 - Desqualificado

## 🚀 Como Funciona

### Fluxo de Conexão

1. **Login do Usuário**
   - Usuário faz login no sistema
   - Sistema verifica workspaces disponíveis para o usuário

2. **Seleção de Workspace**
   - Usuário seleciona workspace (ASF Finance ou Sieg Financeiro)
   - Sistema armazena workspace_id no localStorage

3. **Resolução de Banco e Tabela**
   ```javascript
   // WorkspaceContext determina qual database_key usar
   if (workspaceId === '01d0cff7-2de1-4731-af0d-ee62f5ba974b') {
     database_key = 'asf'  // ASF Finance
   } else if (workspaceId === 'b939a331-44d9-4122-ab23-dcd60413bd46') {
     database_key = 'sieg' // Sieg Financeiro
   }
   
   // DatabaseContext busca configuração do banco
   const config = database_configs.find(c => c.database_key === database_key)
   // config.url = 'https://wrebkgazdlyjenbpexnc.supabase.co' (MESMO BANCO!)
   
   // Hooks determinam qual tabela usar
   const tableName = slug === 'asf' ? 'conversas_asf' : 'conversas_sieg_financeiro'
   ```

4. **Query Dinâmica**
   - Queries são construídas dinamicamente usando a tabela apropriada
   - Filtros aplicados: `id_workspace`, `created_at >= MIN_DATA_DATE`

5. **Compatibilidade**
   - Código trata diferenças de nomenclatura automaticamente
   - ASF: `lead_name` | SIEG: `nome`
   - Fallback: `conv.lead_name || conv.nome`

## 📝 Últimos Registros

### ASF Finance (5 mais recentes)
1. 🥰 - T2 - QUALIFICANDO
2. Assis - T5 - DESQUALIFICADO
3. Wagner - T2 - QUALIFICANDO
4. João Paulo - T5 - DESQUALIFICADO
5. Maria José Oliveira - T2 - QUALIFICANDO

### SIEG Financeiro (5 mais recentes)
1. BT ENGENHARIA E CONSTRUTORA LTDA - T1 - SEM RESPOSTA
2. HUMBERTO TAROZZO FILHO - T1 - SEM RESPOSTA
3. JESSICA REZENDE CONTABILIDADE - T1 - SEM RESPOSTA
4. CONTMAIS CONTABILIDADE - T1 - SEM RESPOSTA
5. ALIOMAR CAMPOS RODEIGUES - T1 - SEM RESPOSTA

## ✅ Status
- [x] Configuração do banco
- [x] Mapeamento de tabelas
- [x] Compatibilidade de campos
- [x] Sistema rodando
- [x] Dados acessíveis

**Data da última atualização**: 29/10/2025 20:31
