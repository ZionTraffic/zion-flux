-- Fix security: Add search_path to ensure_created_at function
CREATE OR REPLACE FUNCTION ensure_created_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at := COALESCE(NEW.started_at::DATE, CURRENT_DATE);
  END IF;
  RETURN NEW;
END;
$$;