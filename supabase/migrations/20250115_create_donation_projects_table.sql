-- Create donation_projects table
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS donation_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  goal_amount DECIMAL NOT NULL,
  current_amount DECIMAL DEFAULT 0,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_donation_projects_status ON donation_projects(status);
CREATE INDEX IF NOT EXISTS idx_donation_projects_dates ON donation_projects(start_date, end_date);

-- Enable RLS
ALTER TABLE donation_projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read donation_projects" ON donation_projects
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated manage donation_projects" ON donation_projects
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample donation project
INSERT INTO donation_projects (
  title,
  description,
  long_description,
  goal_amount,
  current_amount,
  status,
  start_date
) VALUES (
  'Reflorestamento Amazônia 2025',
  'Projeto de reflorestamento de áreas degradadas na Amazônia',
  'Este projeto visa recuperar 1000 hectares de floresta amazônica degradada através do plantio de espécies nativas. O projeto inclui monitoramento por 5 anos e envolvimento da comunidade local.',
  500000.00,
  125000.00,
  'active',
  '2025-01-01'
);

-- Verify
SELECT * FROM donation_projects;
