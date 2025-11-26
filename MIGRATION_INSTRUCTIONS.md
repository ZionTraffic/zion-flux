# 🔧 Instruções para Aplicar Migration

## Problema Identificado

Os seguintes erros foram encontrados no console:

```
❌ Erro ao buscar mapeamentos de tags: tabela não encontrada
❌ Erro ao buscar custos de anúncios: tabela não encontrada
```

## Solução

Criamos uma migration que adiciona as tabelas ausentes (em português):
- `mapeamentos_tags_tenant` - Para mapeamento de tags externas
- `custos_anuncios_tenant` - Para custos de anúncios por dia

## Como Aplicar a Migration

### Opção 1: Via Supabase Dashboard (RECOMENDADO)

1. Acesse o SQL Editor do Supabase:
   👉 https://supabase.com/dashboard/project/wrebkgazdlyjenbpexnc/sql/new

2. Copie todo o conteúdo do arquivo:
   📄 `supabase/migrations/20251118185519_create_tenant_tables.sql`

3. Cole no SQL Editor e clique em **Run**

### Opção 2: Via CLI (Requer senha do banco)

```bash
# No terminal, execute:
cd "/Users/georgemarcel/WINDSURF/ZION APP/zion-flux"
supabase db push
# Digite a senha do banco quando solicitado
```

### Opção 3: Via Script Node.js

```bash
# Execute o script:
node scripts/apply-migration.js
```

## O que a Migration Faz

1. ✅ Cria tabela `mapeamentos_tags_tenant` com:
   - Mapeamento de tags externas para estágios internos
   - Suporte a múltiplos tenants
   - Índices para performance
   - Colunas em português (tag_externa, estagio_interno, rotulo_exibicao, etc)

2. ✅ Cria tabela `custos_anuncios_tenant` com:
   - Registro de custos diários de anúncios
   - Métricas adicionais (impressões, cliques, conversões)
   - Suporte a múltiplas fontes (Meta Ads, Google Ads, etc)
   - Colunas em português (dia, valor, moeda, origem, etc)

3. ✅ Insere dados padrão:
   - Mapeamentos de tags básicos para o primeiro tenant ativo

## Verificação

Após aplicar a migration, recarregue a aplicação e verifique se os erros desapareceram do console.

## Suporte

Se encontrar problemas, verifique:
- ✅ Conexão com o banco de dados
- ✅ Permissões do usuário
- ✅ Tabela `empresas` existe (requerida como foreign key)
