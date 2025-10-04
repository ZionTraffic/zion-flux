-- ============================================
-- Fix security warnings - only public schema
-- ============================================

-- Fix function search path for log_stage_change trigger  
CREATE OR REPLACE FUNCTION public.log_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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