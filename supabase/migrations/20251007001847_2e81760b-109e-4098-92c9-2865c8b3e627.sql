-- Since kpi_overview_daily is a view, we cannot enable RLS directly on it
-- Instead, we need to ensure the view uses security_invoker to inherit RLS from base tables
-- First, let's check if we need to recreate it or if we can ensure base table security

-- Add explicit search_path to remaining functions that need it
CREATE OR REPLACE FUNCTION public.kpi_totais_periodo(p_workspace_id uuid, p_from date, p_to date)
RETURNS TABLE(recebidos integer, qualificados integer, followup integer, descartados integer, investimento numeric, cpl numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select
    coalesce(sum(leads_recebidos),0)    as recebidos,
    coalesce(sum(leads_qualificados),0) as qualificados,
    coalesce(sum(leads_followup),0)     as followup,
    coalesce(sum(leads_descartados),0)  as descartados,
    coalesce(sum(investimento),0)::numeric(12,2) as investimento,
    case when coalesce(sum(leads_recebidos),0) > 0
         then (coalesce(sum(investimento),0) / sum(leads_recebidos))::numeric(12,2)
         else 0::numeric(12,2) end as cpl
  from public.kpi_overview_daily
  where workspace_id = p_workspace_id
    and day between p_from and p_to;
$$;

-- Update log_stage_change function to include explicit search_path
CREATE OR REPLACE FUNCTION public.log_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  if tg_op = 'INSERT' then
    insert into public.historico_leads
      (workspace_id, lead_id, from_stage, to_stage, changed_by, changed_at)
    values
      (new.workspace_id, new.id, null, new.stage, auth.uid(), now());
  elsif tg_op = 'UPDATE' and new.stage is distinct from old.stage then
    insert into public.historico_leads
      (workspace_id, lead_id, from_stage, to_stage, changed_by, changed_at)
    values
      (new.workspace_id, new.id, old.stage, new.stage, auth.uid(), now());
  end if;
  return new;
end
$$;