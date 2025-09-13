-- Make legacy columns nullable to prevent constraint violations
-- The app now uses 'prompt' and 'response' instead of 'question' and 'answer'
DO $$
BEGIN
  -- Make question column nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vaults' 
    AND column_name = 'question' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE vaults ALTER COLUMN question DROP NOT NULL;
  END IF;

  -- Make answer column nullable  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vaults' 
    AND column_name = 'answer' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE vaults ALTER COLUMN answer DROP NOT NULL;
  END IF;
END $$;