-- Tabela de diagnósticos da IA Analista
create table if not exists public.analise_fluxos (
  id bigserial primary key,
  conversa_id bigint not null references public.historico_conversas(id) on delete cascade,
  workspace_id uuid not null,
  created_at timestamptz not null default now(),
  summary text,
  issues text[],
  suggestions text[],
  score_coerencia int,
  score_fluxo int,
  score_humanizacao int
);

-- Índices para performance
create index if not exists analise_fluxos_conversa_id_idx on public.analise_fluxos (conversa_id);
create index if not exists analise_fluxos_workspace_id_idx on public.analise_fluxos (workspace_id);
create index if not exists analise_fluxos_created_at_idx on public.analise_fluxos (created_at desc);

-- Habilitar RLS
alter table public.analise_fluxos enable row level security;

-- Política de seleção: membros do workspace
create policy select_analise_fluxos
on public.analise_fluxos
for select
using (
  workspace_id in (select public.get_user_workspaces(auth.uid()))
);

-- Política de inserção: membros do workspace
create policy insert_analise_fluxos
on public.analise_fluxos
for insert
with check (
  workspace_id in (select public.get_user_workspaces(auth.uid()))
);

-- Política de atualização: membros do workspace
create policy update_analise_fluxos
on public.analise_fluxos
for update
using (
  workspace_id in (select public.get_user_workspaces(auth.uid()))
)
with check (
  workspace_id in (select public.get_user_workspaces(auth.uid()))
);

-- View auxiliar para debug e consultas
create or replace view public.v_analise_fluxos as
select
  af.id,
  af.created_at,
  af.workspace_id,
  af.conversa_id,
  hc.lead_name,
  hc.phone,
  hc.tag,
  af.summary,
  af.issues,
  af.suggestions,
  af.score_coerencia,
  af.score_fluxo,
  af.score_humanizacao
from public.analise_fluxos af
join public.historico_conversas hc on hc.id = af.conversa_id
order by af.created_at desc;