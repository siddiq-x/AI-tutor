/*
  # Create vaults table for storing user Q&A data

  1. New Tables
    - `vaults`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `question` (text)
      - `answer` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `vaults` table
    - Add policy for users to read/write their own vault data
*/

CREATE TABLE IF NOT EXISTS vaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own vault data"
  ON vaults
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault data"
  ON vaults
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault data"
  ON vaults
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault data"
  ON vaults
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);