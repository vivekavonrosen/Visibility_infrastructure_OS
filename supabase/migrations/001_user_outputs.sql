-- Visibility Infrastructure OS — user_outputs table
-- Run this once in your Supabase project SQL editor

CREATE TABLE IF NOT EXISTS user_outputs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id   TEXT NOT NULL,
  output_text TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, module_id)
);

ALTER TABLE user_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own outputs select"
  ON user_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "own outputs insert"
  ON user_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own outputs update"
  ON user_outputs FOR UPDATE
  USING (auth.uid() = user_id);
