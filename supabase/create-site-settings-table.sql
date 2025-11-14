-- Create site_settings table
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'Minha Floresta',
  site_description TEXT DEFAULT 'Compense sua pegada de carbono',
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  stripe_public_key TEXT,
  stripe_secret_key TEXT,
  maintenance_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read site_settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated manage site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO site_settings (
  site_name,
  site_description,
  contact_email,
  contact_phone,
  contact_address
) VALUES (
  'Minha Floresta',
  'Compense sua pegada de carbono investindo em projetos de reflorestamento e conservação',
  'contato@minhafloresta.com.br',
  '(11) 99999-9999',
  'São Paulo, SP - Brasil'
) ON CONFLICT DO NOTHING;

-- Verify
SELECT * FROM site_settings;
