# 🔒 Documentação de Segurança e LGPD - Zion App

## Visão Geral

Este documento descreve as medidas de segurança e conformidade com a Lei Geral de Proteção de Dados (LGPD) implementadas no sistema Zion App.

---

## 1. Dados Pessoais Coletados

### Dados de Identificação
| Dado | Finalidade | Base Legal |
|------|------------|------------|
| Nome | Identificação do cliente | Execução de contrato |
| CPF | Identificação fiscal | Obrigação legal |
| Telefone | Comunicação e atendimento | Execução de contrato |
| Email | Comunicação | Consentimento |
| Empresa | Identificação comercial | Execução de contrato |

### Dados de Atendimento
| Dado | Finalidade | Base Legal |
|------|------------|------------|
| Histórico de conversas | Atendimento e suporte | Execução de contrato |
| Avaliação CSAT | Melhoria de serviços | Legítimo interesse |
| Tags/Estágios | Gestão de relacionamento | Execução de contrato |

---

## 2. Medidas de Segurança Implementadas

### 2.1 Autenticação e Acesso
- ✅ **Autenticação via Supabase Auth** - Login seguro com email/senha
- ✅ **Política de senhas fortes** - Mínimo 8 caracteres, maiúscula, minúscula, número e especial
- ✅ **Timeout de sessão** - Logout automático após 30 minutos de inatividade
- ✅ **Controle de acesso por papel** - Owner, Admin, User

### 2.2 Proteção de Dados
- ✅ **Criptografia em trânsito** - HTTPS/TLS em todas as comunicações
- ✅ **Criptografia em repouso** - Banco de dados Supabase criptografado
- ✅ **Mascaramento de dados sensíveis** - CPF, telefone e email parcialmente ocultos na interface
- ✅ **Row Level Security (RLS)** - Isolamento de dados por empresa/tenant

### 2.3 Auditoria e Rastreabilidade
- ✅ **Log de auditoria** - Registro de todas as ações (login, logout, visualização, edição, exclusão)
- ✅ **Histórico de alterações** - Dados anteriores e novos salvos para cada modificação
- ✅ **Identificação de dados sensíveis** - Registro de quais dados foram acessados

### 2.4 Segurança da Aplicação
- ✅ **Sanitização de inputs** - Prevenção contra XSS e injeção
- ✅ **Variáveis de ambiente** - Chaves e segredos fora do código
- ✅ **Headers de segurança** - CSP, X-Frame-Options (via Hostinger)

---

## 3. Direitos do Titular (LGPD)

### 3.1 Direito de Acesso (Art. 18, II)
O titular pode solicitar acesso aos seus dados pessoais através do email de suporte.

### 3.2 Direito de Correção (Art. 18, III)
Dados incorretos podem ser corrigidos mediante solicitação.

### 3.3 Direito de Exclusão (Art. 18, VI)
O titular pode solicitar a exclusão de seus dados, exceto quando houver obrigação legal de retenção.

### 3.4 Direito de Portabilidade (Art. 18, V)
Os dados podem ser exportados em formato legível (JSON/CSV) mediante solicitação.

### 3.5 Prazo de Atendimento
Conforme LGPD, as solicitações serão atendidas em até **15 dias úteis**.

---

## 4. Retenção de Dados

| Tipo de Dado | Período de Retenção | Justificativa |
|--------------|---------------------|---------------|
| Dados de clientes | Enquanto ativo + 5 anos | Obrigação fiscal |
| Logs de auditoria | 5 anos | Requisito legal |
| Histórico de conversas | 2 anos | Qualidade de serviço |
| Dados de CSAT | 2 anos | Melhoria contínua |

---

## 5. Incidentes de Segurança

### Procedimento em caso de vazamento:
1. **Identificação** - Detectar e isolar o incidente
2. **Contenção** - Bloquear acesso não autorizado
3. **Notificação** - Informar ANPD e titulares em até 72 horas
4. **Documentação** - Registrar todo o incidente
5. **Correção** - Implementar medidas corretivas

### Contato para incidentes:
- Email: seguranca@ziontraffic.com.br
- Encarregado de Dados (DPO): [A definir]

---

## 6. Arquivos de Implementação

### Scripts SQL
- `/scripts/seguranca-lgpd-migration.sql` - Tabelas de auditoria e consentimento

### Código Frontend
- `/src/utils/seguranca.ts` - Funções de mascaramento e validação
- `/src/hooks/useSessionTimeout.ts` - Timeout de sessão
- `/src/components/ui/MaskedData.tsx` - Componente de dados mascarados
- `/src/components/auth/PasswordStrengthIndicator.tsx` - Validação de senha
- `/src/components/auth/SessionTimeoutProvider.tsx` - Provider de timeout

---

## 7. Checklist de Conformidade

### Implementado ✅
- [x] Criptografia em trânsito (HTTPS)
- [x] Criptografia em repouso (Supabase)
- [x] Mascaramento de dados sensíveis
- [x] Timeout de sessão (30 min)
- [x] Política de senhas fortes
- [x] Logs de auditoria
- [x] Row Level Security
- [x] Controle de acesso por papel

### Pendente ⏳
- [ ] Termo de consentimento na interface
- [ ] Tela de solicitações LGPD
- [ ] Exportação de dados (portabilidade)
- [ ] Rate limiting
- [ ] Política de privacidade completa

---

## 8. Contatos

- **Suporte Técnico**: suporte@ziontraffic.com.br
- **Segurança**: seguranca@ziontraffic.com.br
- **DPO (Encarregado)**: [A definir]

---

*Última atualização: Dezembro 2025*
