-- Fix certificates table structure
-- Execute este SQL no Supabase SQL Editor

-- Drop and recreate certificates table with correct structure
DROP TABLE IF EXISTS certificates CASCADE;

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT NOT NULL UNIQUE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  area_sqm DECIMAL NOT NULL,
  co2_offset_kg DECIMAL NOT NULL,
  issue_date DATE NOT NULL,
  status TEXT DEFAULT 'issued',
  verification_code TEXT,
  qr_code_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_project ON certificates(project_id);
CREATE INDEX idx_certificates_email ON certificates(customer_email);
CREATE INDEX idx_certificates_date ON certificates(issue_date);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read certificates" ON certificates
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated manage certificates" ON certificates
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample certificates based on sales
INSERT INTO certificates (
  certificate_number,
  project_id,
  customer_name,
  customer_email,
  area_sqm,
  co2_offset_kg,
  issue_date,
  status,
  verification_code
)
SELECT 
  'MF-' || EXTRACT(YEAR FROM s.sale_date)::TEXT || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY s.sale_date)::TEXT, 6, '0'),
  p.id,
  s.customer_name,
  s.customer_email,
  s.total_m2,
  s.total_m2 * 2.5,
  s.sale_date::DATE,
  'issued',
  'VER-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
FROM sales s
CROSS JOIN LATERAL (
  SELECT id FROM projects ORDER BY RANDOM() LIMIT 1
) p;

-- Verify
SELECT COUNT(*) as total_certificates FROM certificates;
SELECT * FROM certificates ORDER BY issue_date DESC LIMIT 5;
