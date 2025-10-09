-- Phase 2: Structural Database Fixes for historico_conversas

-- Step 1: Create function to parse Brazilian date format (DD/MM/YYYY) to timestamp
CREATE OR REPLACE FUNCTION parse_br_date(date_text TEXT)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  parsed_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Try ISO format first (YYYY-MM-DD or full ISO timestamp)
  IF date_text ~ '^\d{4}-\d{2}-\d{2}' THEN
    parsed_date := date_text::TIMESTAMP WITH TIME ZONE;
    RETURN parsed_date;
  END IF;
  
  -- Try Brazilian format (DD/MM/YYYY)
  IF date_text ~ '^\d{2}/\d{2}/\d{4}' THEN
    parsed_date := TO_TIMESTAMP(date_text, 'DD/MM/YYYY');
    RETURN parsed_date;
  END IF;
  
  -- If no format matches, return NULL
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 2: Add new temporary column for converted timestamp
ALTER TABLE public.historico_conversas 
ADD COLUMN IF NOT EXISTS started_at_ts TIMESTAMP WITH TIME ZONE;

-- Step 3: Convert existing started_at (text) to timestamp
UPDATE public.historico_conversas
SET started_at_ts = parse_br_date(started_at)
WHERE started_at IS NOT NULL AND started_at_ts IS NULL;

-- Step 4: Fill NULL created_at values using started_at_ts
UPDATE public.historico_conversas
SET created_at = started_at_ts::DATE
WHERE created_at IS NULL AND started_at_ts IS NOT NULL;

-- Step 5: For records still with NULL created_at, use current date
UPDATE public.historico_conversas
SET created_at = CURRENT_DATE
WHERE created_at IS NULL;

-- Step 6: Drop old started_at column and rename new one
ALTER TABLE public.historico_conversas 
DROP COLUMN started_at;

ALTER TABLE public.historico_conversas 
RENAME COLUMN started_at_ts TO started_at;

-- Step 7: Set default for created_at
ALTER TABLE public.historico_conversas 
ALTER COLUMN created_at SET DEFAULT CURRENT_DATE;

-- Step 8: Set default for started_at
ALTER TABLE public.historico_conversas 
ALTER COLUMN started_at SET DEFAULT CURRENT_TIMESTAMP;

-- Step 9: Create trigger to ensure created_at is always filled
CREATE OR REPLACE FUNCTION ensure_created_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at := COALESCE(NEW.started_at::DATE, CURRENT_DATE);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_created_at ON public.historico_conversas;

CREATE TRIGGER trigger_ensure_created_at
BEFORE INSERT OR UPDATE ON public.historico_conversas
FOR EACH ROW
EXECUTE FUNCTION ensure_created_at();

-- Step 10: Fill NULL updated_at with created_at or current date
UPDATE public.historico_conversas
SET updated_at = COALESCE(created_at, CURRENT_DATE)
WHERE updated_at IS NULL;

-- Step 11: Set default for updated_at
ALTER TABLE public.historico_conversas 
ALTER COLUMN updated_at SET DEFAULT CURRENT_DATE;

-- Clean up: Drop the helper function
DROP FUNCTION IF EXISTS parse_br_date(TEXT);