/*
  # Update vaults table structure

  1. Changes
    - Add `tool` column to track which AI tool was used
    - Add `prompt` column to store user's original input
    - Rename `question` to `prompt` and `answer` to `response` for consistency
    - Update existing data to maintain compatibility

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add new columns to vaults table
DO $$
BEGIN
  -- Add tool column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaults' AND column_name = 'tool'
  ) THEN
    ALTER TABLE vaults ADD COLUMN tool text;
  END IF;

  -- Add prompt column if it doesn't exist (will replace question)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaults' AND column_name = 'prompt'
  ) THEN
    ALTER TABLE vaults ADD COLUMN prompt text;
  END IF;

  -- Add response column if it doesn't exist (will replace answer)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaults' AND column_name = 'response'
  ) THEN
    ALTER TABLE vaults ADD COLUMN response text;
  END IF;
END $$;

-- Migrate existing data from question/answer to prompt/response
UPDATE vaults 
SET 
  prompt = question,
  response = answer,
  tool = 'Legacy'
WHERE prompt IS NULL OR response IS NULL;

-- Make new columns required after migration
ALTER TABLE vaults ALTER COLUMN prompt SET NOT NULL;
ALTER TABLE vaults ALTER COLUMN response SET NOT NULL;
ALTER TABLE vaults ALTER COLUMN tool SET NOT NULL;