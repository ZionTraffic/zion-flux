-- Drop and recreate kpi_totais_periodo with workspace validation
DROP FUNCTION IF EXISTS public.kpi_totais_periodo(uuid, date, date);

CREATE OR REPLACE FUNCTION public.kpi_totais_periodo(
  p_workspace_id uuid,
  p_from date,
  p_to date
)
RETURNS TABLE (
  recebidos integer,
  qualificados integer,
  followup integer,
  descartados integer,
  investimento numeric,
  cpl numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate user has access to this workspace
  IF NOT public.is_workspace_member(auth.uid(), p_workspace_id) THEN
    RAISE EXCEPTION 'Access denied to workspace';
  END IF;
  
  -- Return the KPI data with workspace filtering
  RETURN QUERY
  SELECT
    COALESCE(SUM(leads_recebidos), 0)::integer AS recebidos,
    COALESCE(SUM(leads_qualificados), 0)::integer AS qualificados,
    COALESCE(SUM(leads_followup), 0)::integer AS followup,
    COALESCE(SUM(leads_descartados), 0)::integer AS descartados,
    COALESCE(SUM(investimento), 0)::numeric(12,2) AS investimento,
    CASE 
      WHEN COALESCE(SUM(leads_recebidos), 0) > 0 
      THEN (COALESCE(SUM(investimento), 0) / SUM(leads_recebidos))::numeric(12,2)
      ELSE 0::numeric(12,2) 
    END AS cpl
  FROM public.kpi_overview_daily
  WHERE workspace_id = p_workspace_id
    AND day BETWEEN p_from AND p_to;
END;
$$;