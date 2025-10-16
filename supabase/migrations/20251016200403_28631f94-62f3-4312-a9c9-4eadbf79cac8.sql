-- Fix SECURITY DEFINER views by changing them to SECURITY INVOKER
-- This ensures RLS policies are evaluated with the querying user's permissions

-- View: v_analise_fluxos
ALTER VIEW public.v_analise_fluxos SET (security_invoker = on);

-- View: v_qualificacao
ALTER VIEW public.v_qualificacao SET (security_invoker = on);