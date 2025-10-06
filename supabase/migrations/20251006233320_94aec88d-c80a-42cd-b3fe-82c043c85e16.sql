-- Corrigir search_path das funções para evitar avisos de segurança

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

create or replace function public.log_stage_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  if tg_op = 'INSERT' then
    insert into public.lead_status_history
      (workspace_id, lead_id, from_stage, to_stage, changed_by, changed_at)
    values
      (new.workspace_id, new.id, null, new.stage, auth.uid(), now());
  elsif tg_op = 'UPDATE' and new.stage is distinct from old.stage then
    insert into public.lead_status_history
      (workspace_id, lead_id, from_stage, to_stage, changed_by, changed_at)
    values
      (new.workspace_id, new.id, old.stage, new.stage, auth.uid(), now());
  end if;
  return new;
end
$function$;