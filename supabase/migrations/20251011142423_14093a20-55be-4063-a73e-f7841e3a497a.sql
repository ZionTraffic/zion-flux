-- Fix 1: Drop and recreate kpi_totais_periodo with workspace access validation
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

-- Fix 2: Add workspace filtering policy to kpi_overview_daily
-- Note: This will only work if it's a table or materialized view, not a regular view
DO $$
BEGIN
  -- Try to enable RLS
  BEGIN
    ALTER TABLE public.kpi_overview_daily ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN wrong_object_type THEN
    -- It's a regular view - RLS automatically inherits from base tables
    RAISE NOTICE 'kpi_overview_daily is a regular view - RLS inherited from base tables';
  END;
  
  -- Create policy if RLS was successfully enabled
  BEGIN
    CREATE POLICY "Users can view workspace KPI data"
    ON public.kpi_overview_daily
    FOR SELECT
    USING (
      workspace_id IN (
        SELECT workspace_id 
        FROM public.membros_workspace 
        WHERE user_id = auth.uid()
      )
    );
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists
    NULL;
  WHEN wrong_object_type THEN
    -- Regular view - policy not supported
    NULL;
  END;
END $$;