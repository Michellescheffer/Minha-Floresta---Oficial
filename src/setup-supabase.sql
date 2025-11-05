-- Setup script for Minha Floresta Supabase Database
-- Run this in your Supabase SQL Editor

-- Create the KV store table for the Edge Function
CREATE TABLE IF NOT EXISTS kv_store_minha_floresta (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE kv_store_minha_floresta ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows the service role to manage all data
-- This is needed for the Edge Function to work properly
DROP POLICY IF EXISTS "Service role can manage all data" ON kv_store_minha_floresta;
CREATE POLICY "Service role can manage all data" ON kv_store_minha_floresta
FOR ALL USING (auth.role() = 'service_role');

-- Create an index for faster prefix searches
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix ON kv_store_minha_floresta USING btree (key text_pattern_ops);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
DROP TRIGGER IF EXISTS update_kv_store_updated_at ON kv_store_minha_floresta;
CREATE TRIGGER update_kv_store_updated_at
    BEFORE UPDATE ON kv_store_minha_floresta
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions to authenticated users (if needed)
-- GRANT SELECT ON kv_store_minha_floresta TO authenticated;

-- Display success message
SELECT 'Minha Floresta database setup completed successfully!' as status;