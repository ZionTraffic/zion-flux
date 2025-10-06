-- ============================================
-- FASE 1: SEGURANÇA - Incremental
-- (Pula criação do enum que já existe)
-- ============================================

-- 1. Criar tabela de roles (se não existir)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Habilitar RLS
alter table public.user_roles enable row level security;

-- Políticas RLS para user_roles
drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Users can view their own roles"
  on public.user_roles
  for select
  using (user_id = auth.uid());

drop policy if exists "Admins can manage roles" on public.user_roles;
create policy "Admins can manage roles"
  on public.user_roles
  for all
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() 
      and ur.role in ('owner', 'admin')
    )
  );

-- 2. Criar função has_role
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 3. RLS em historico_conversas
alter table public.historico_conversas enable row level security;

drop policy if exists "select_conversation_logs" on public.historico_conversas;
create policy "select_conversation_logs"
  on public.historico_conversas
  for select
  using (workspace_id in (select get_user_workspaces(auth.uid())));

drop policy if exists "insert_conversation_logs" on public.historico_conversas;
create policy "insert_conversation_logs"
  on public.historico_conversas
  for insert
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

drop policy if exists "update_conversation_logs" on public.historico_conversas;
create policy "update_conversation_logs"
  on public.historico_conversas
  for update
  using (workspace_id in (select get_user_workspaces(auth.uid())))
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

drop policy if exists "delete_conversation_logs" on public.historico_conversas;
create policy "delete_conversation_logs"
  on public.historico_conversas
  for delete
  using (
    workspace_id in (select get_user_workspaces(auth.uid()))
    and exists (
      select 1 from public.membros_workspace wm
      where wm.workspace_id = historico_conversas.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
    )
  );

-- 4. Políticas UPDATE/DELETE em analise_ia
drop policy if exists "update_analise_ia" on public.analise_ia;
create policy "update_analise_ia"
  on public.analise_ia
  for update
  using (workspace_id in (select get_user_workspaces(auth.uid())))
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

drop policy if exists "delete_analise_ia" on public.analise_ia;
create policy "delete_analise_ia"
  on public.analise_ia
  for delete
  using (
    workspace_id in (select get_user_workspaces(auth.uid()))
    and exists (
      select 1 from public.membros_workspace wm
      where wm.workspace_id = analise_ia.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
    )
  );

-- 5. Políticas em contas_anuncios
drop policy if exists "update_ad_accounts" on public.contas_anuncios;
create policy "update_ad_accounts"
  on public.contas_anuncios
  for update
  using (workspace_id in (select get_user_workspaces(auth.uid())))
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

drop policy if exists "delete_ad_accounts" on public.contas_anuncios;
create policy "delete_ad_accounts"
  on public.contas_anuncios
  for delete
  using (
    workspace_id in (select get_user_workspaces(auth.uid()))
    and exists (
      select 1 from public.membros_workspace wm
      where wm.workspace_id = contas_anuncios.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
    )
  );

-- 6. Políticas em custo_anuncios
drop policy if exists "update_spend_by_day" on public.custo_anuncios;
create policy "update_spend_by_day"
  on public.custo_anuncios
  for update
  using (workspace_id in (select get_user_workspaces(auth.uid())))
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

drop policy if exists "delete_spend_by_day" on public.custo_anuncios;
create policy "delete_spend_by_day"
  on public.custo_anuncios
  for delete
  using (
    workspace_id in (select get_user_workspaces(auth.uid()))
    and exists (
      select 1 from public.membros_workspace wm
      where wm.workspace_id = custo_anuncios.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
    )
  );

-- 7. Políticas em historico_leads
drop policy if exists "update_lead_status_history" on public.historico_leads;
create policy "update_lead_status_history"
  on public.historico_leads
  for update
  using (workspace_id in (select get_user_workspaces(auth.uid())))
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

drop policy if exists "delete_lead_status_history" on public.historico_leads;
create policy "delete_lead_status_history"
  on public.historico_leads
  for delete
  using (
    workspace_id in (select get_user_workspaces(auth.uid()))
    and exists (
      select 1 from public.membros_workspace wm
      where wm.workspace_id = historico_leads.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
    )
  );

-- 8. Políticas em leads
drop policy if exists "delete_leads" on public.leads;
create policy "delete_leads"
  on public.leads
  for delete
  using (
    workspace_id in (select get_user_workspaces(auth.uid()))
    and exists (
      select 1 from public.membros_workspace wm
      where wm.workspace_id = leads.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
    )
  );

-- 9. Políticas em membros_workspace
drop policy if exists "update_workspace_members" on public.membros_workspace;
create policy "update_workspace_members"
  on public.membros_workspace
  for update
  using (
    exists (
      select 1 from public.membros_workspace wm
      where wm.workspace_id = membros_workspace.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.membros_workspace wm
      where wm.workspace_id = membros_workspace.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
    )
  );

drop policy if exists "delete_workspace_members" on public.membros_workspace;
create policy "delete_workspace_members"
  on public.membros_workspace
  for delete
  using (
    exists (
      select 1 from public.membros_workspace wm
      where wm.workspace_id = membros_workspace.workspace_id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
    )
  );

-- 10. Políticas em workspaces
drop policy if exists "delete_workspaces" on public.workspaces;
create policy "delete_workspaces"
  on public.workspaces
  for delete
  using (
    exists (
      select 1 from public.membros_workspace wm
      where wm.workspace_id = workspaces.id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
    )
  );