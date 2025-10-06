-- ============================================
-- FASE 1: SEGURANÇA DO BANCO DE DADOS
-- ============================================

-- 1. Criar enum para roles
create type public.app_role as enum ('owner', 'admin', 'member', 'viewer');

-- 2. Criar tabela de roles separada
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Habilitar RLS na tabela user_roles
alter table public.user_roles enable row level security;

-- Políticas RLS para user_roles
create policy "Users can view their own roles"
  on public.user_roles
  for select
  using (user_id = auth.uid());

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

-- 3. Criar função has_role com SECURITY DEFINER
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

-- 4. Adicionar RLS na tabela historico_conversas (CRÍTICO!)
alter table public.historico_conversas enable row level security;

create policy "select_conversation_logs"
  on public.historico_conversas
  for select
  using (workspace_id in (select get_user_workspaces(auth.uid())));

create policy "insert_conversation_logs"
  on public.historico_conversas
  for insert
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

create policy "update_conversation_logs"
  on public.historico_conversas
  for update
  using (workspace_id in (select get_user_workspaces(auth.uid())))
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

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

-- 5. Adicionar políticas UPDATE/DELETE em analise_ia
create policy "update_analise_ia"
  on public.analise_ia
  for update
  using (workspace_id in (select get_user_workspaces(auth.uid())))
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

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

-- 6. Adicionar políticas UPDATE/DELETE em contas_anuncios
create policy "update_ad_accounts"
  on public.contas_anuncios
  for update
  using (workspace_id in (select get_user_workspaces(auth.uid())))
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

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

-- 7. Adicionar políticas UPDATE/DELETE em custo_anuncios
create policy "update_spend_by_day"
  on public.custo_anuncios
  for update
  using (workspace_id in (select get_user_workspaces(auth.uid())))
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

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

-- 8. Adicionar política DELETE em historico_leads
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

create policy "update_lead_status_history"
  on public.historico_leads
  for update
  using (workspace_id in (select get_user_workspaces(auth.uid())))
  with check (workspace_id in (select get_user_workspaces(auth.uid())));

-- 9. Adicionar política DELETE em leads
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

-- 10. Adicionar políticas UPDATE/DELETE em membros_workspace
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

-- 11. Adicionar política DELETE em workspaces
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