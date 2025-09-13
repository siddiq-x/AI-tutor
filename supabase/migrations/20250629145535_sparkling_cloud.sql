/*
  # Fix Vault Schema - Make Legacy Columns Nullable

  1. Changes
    - Make `question` column nullable to prevent constraint violations
    - Make `answer` column nullable to prevent constraint violations
    - These columns are legacy and the app now uses `prompt` and `response`

  2. Security
    - No changes to RLS policies needed
    - Maintains existing data integrity for new columns
*/

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