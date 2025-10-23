# 🚀 Guia de Deploy - Zion Flux

## Pré-requisitos
- Conta na Vercel (https://vercel.com)
- Domínio ziontraffic.com.br configurado

## Passo 1: Deploy na Vercel

### Opção A: Via CLI (Recomendado)

1. Instalar Vercel CLI:
```bash
npm install -g vercel
```

2. Fazer login:
```bash
vercel login
```

3. Deploy do projeto:
```bash
cd "/Users/georgemarcel/WINDSURF/ZION APP/zion-flux"
vercel
```

4. Seguir as instruções:
   - Set up and deploy? **Yes**
   - Which scope? **Selecione sua conta**
   - Link to existing project? **No**
   - Project name? **zion-flux** (ou o nome que preferir)
   - Directory? **./dist**
   - Override settings? **No**

5. Deploy em produção:
```bash
vercel --prod
```

### Opção B: Via Dashboard Vercel

1. Acesse https://vercel.com/new
2. Conecte seu repositório GitHub (ou faça upload manual)
3. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. Adicione as variáveis de ambiente (copie do .env.production)

5. Clique em **Deploy**

## Passo 2: Configurar Domínio

### Na Vercel:

1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Domains**
3. Adicione o domínio: `app.ziontraffic.com.br`
4. Vercel vai fornecer os registros DNS

### No seu provedor de DNS (Registro.br ou outro):

1. Acesse o painel de DNS do ziontraffic.com.br
2. Adicione um registro **CNAME**:
   - **Nome:** `app`
   - **Tipo:** `CNAME`
   - **Valor:** `cname.vercel-dns.com` (ou o valor fornecido pela Vercel)
   - **TTL:** `3600`

3. Aguarde propagação (pode levar até 48h, mas geralmente é rápido)

## Passo 3: Configurar HTTPS

A Vercel configura SSL automaticamente! ✅

## Passo 4: Testar

1. Acesse: https://app.ziontraffic.com.br
2. Faça login com: george@ziontraffic.com.br
3. Verifique se tudo está funcionando

## Passo 5: Atualizar Links de Convite

✅ **Já configurado!** A Edge Function agora usa:
```
APP_URL=https://app.ziontraffic.com.br
```

Novos convites gerados usarão automaticamente o domínio correto.

## Comandos Úteis

### Deploy de atualização:
```bash
vercel --prod
```

### Ver logs:
```bash
vercel logs
```

### Ver domínios:
```bash
vercel domains ls
```

## Variáveis de Ambiente na Vercel

Configure estas variáveis no dashboard da Vercel:

```
VITE_SUPABASE_PROJECT_ID=wrebkgazdlyjenbpexnc
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://wrebkgazdlyjenbpexnc.supabase.co
VITE_SUPABASE_ASF_URL=https://wrebkgazdlyjenbpexnc.supabase.co
VITE_SUPABASE_ASF_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SIEG_URL=https://vrbgptrmmvsaoozrplng.supabase.co
VITE_SUPABASE_SIEG_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Troubleshooting

### Erro 404 ao acessar rotas:
- Verifique se o `vercel.json` está configurado corretamente
- Deve ter o rewrite para `/index.html`

### Variáveis de ambiente não funcionam:
- Variáveis devem começar com `VITE_`
- Rebuild o projeto após adicionar variáveis

### Domínio não resolve:
- Aguarde propagação DNS (até 48h)
- Verifique registros DNS com: `dig app.ziontraffic.com.br`
- Teste com: `nslookup app.ziontraffic.com.br`

## Suporte

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/guide/
