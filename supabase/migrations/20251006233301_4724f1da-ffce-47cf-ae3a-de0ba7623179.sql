-- ============================================
-- FASE 1: SEGURANÇA - Adicionar apenas políticas faltantes
-- ============================================

-- RLS na tabela historico_conversas (CRÍTICO!)
alter table public.historico_conversas enable row level security;

-- Políticas para historico_conversas
do $$ 
begin
  if not exists (select 1 from pg_policies where tablename = 'historico_conversas' and policyname = 'select_conversation_logs') then
    create policy "select_conversation_logs"
      on public.historico_conversas
      for select
      using (workspace_id in (select get_user_workspaces(auth.uid())));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'historico_conversas' and policyname = 'insert_conversation_logs') then
    create policy "insert_conversation_logs"
      on public.historico_conversas
      for insert
      with check (workspace_id in (select get_user_workspaces(auth.uid())));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'historico_conversas' and policyname = 'update_conversation_logs') then
    create policy "update_conversation_logs"
      on public.historico_conversas
      for update
      using (workspace_id in (select get_user_workspaces(auth.uid())))
      with check (workspace_id in (select get_user_workspaces(auth.uid())));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'historico_conversas' and policyname = 'delete_conversation_logs') then
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
  end if;
end $$;

-- Políticas UPDATE/DELETE para analise_ia
do $$ 
begin
  if not exists (select 1 from pg_policies where tablename = 'analise_ia' and policyname = 'update_analise_ia') then
    create policy "update_analise_ia"
      on public.analise_ia
      for update
      using (workspace_id in (select get_user_workspaces(auth.uid())))
      with check (workspace_id in (select get_user_workspaces(auth.uid())));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'analise_ia' and policyname = 'delete_analise_ia') then
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
  end if;
end $$;

-- Políticas UPDATE/DELETE para contas_anuncios
do $$ 
begin
  if not exists (select 1 from pg_policies where tablename = 'contas_anuncios' and policyname = 'update_ad_accounts') then
    create policy "update_ad_accounts"
      on public.contas_anuncios
      for update
      using (workspace_id in (select get_user_workspaces(auth.uid())))
      with check (workspace_id in (select get_user_workspaces(auth.uid())));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'contas_anuncios' and policyname = 'delete_ad_accounts') then
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
  end if;
end $$;

-- Políticas UPDATE/DELETE para custo_anuncios
do $$ 
begin
  if not exists (select 1 from pg_policies where tablename = 'custo_anuncios' and policyname = 'update_spend_by_day') then
    create policy "update_spend_by_day"
      on public.custo_anuncios
      for update
      using (workspace_id in (select get_user_workspaces(auth.uid())))
      with check (workspace_id in (select get_user_workspaces(auth.uid())));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'custo_anuncios' and policyname = 'delete_spend_by_day') then
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
  end if;
end $$;

-- Políticas UPDATE/DELETE para historico_leads
do $$ 
begin
  if not exists (select 1 from pg_policies where tablename = 'historico_leads' and policyname = 'update_lead_status_history') then
    create policy "update_lead_status_history"
      on public.historico_leads
      for update
      using (workspace_id in (select get_user_workspaces(auth.uid())))
      with check (workspace_id in (select get_user_workspaces(auth.uid())));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'historico_leads' and policyname = 'delete_lead_status_history') then
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
  end if;
end $$;

-- Política DELETE para leads
do $$ 
begin
  if not exists (select 1 from pg_policies where tablename = 'leads' and policyname = 'delete_leads') then
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
  end if;
end $$;

-- Políticas UPDATE/DELETE para membros_workspace
do $$ 
begin
  if not exists (select 1 from pg_policies where tablename = 'membros_workspace' and policyname = 'update_workspace_members') then
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
  end if;

  if not exists (select 1 from pg_policies where tablename = 'membros_workspace' and policyname = 'delete_workspace_members') then
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
  end if;
end $$;

-- Política DELETE para workspaces
do $$ 
begin
  if not exists (select 1 from pg_policies where tablename = 'workspaces' and policyname = 'delete_workspaces') then
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
  end if;
end $$;