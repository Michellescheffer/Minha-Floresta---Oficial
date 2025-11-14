-- Create donation_certificates table
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS donation_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE NOT NULL,
  donation_project_id UUID REFERENCES donation_projects(id) ON DELETE CASCADE,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_cpf TEXT,
  donation_amount DECIMAL NOT NULL,
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  certificate_url TEXT,
  qr_code_url TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_donation_certificates_number ON donation_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_donation_certificates_email ON donation_certificates(donor_email);
CREATE INDEX IF NOT EXISTS idx_donation_certificates_project ON donation_certificates(donation_project_id);
CREATE INDEX IF NOT EXISTS idx_donation_certificates_date ON donation_certificates(donation_date);

-- Enable RLS
ALTER TABLE donation_certificates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read donation_certificates" ON donation_certificates
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated manage donation_certificates" ON donation_certificates
  FOR ALL USING (auth.role() = 'authenticated');

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_donation_certificate_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  sequence_num TEXT;
  new_number TEXT;
BEGIN
  year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get next sequence number for the year
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0')
  INTO sequence_num
  FROM donation_certificates
  WHERE certificate_number LIKE 'DOA-' || year || '-%';
  
  new_number := 'DOA-' || year || '-' || sequence_num;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate certificate number
CREATE OR REPLACE FUNCTION set_donation_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
    NEW.certificate_number := generate_donation_certificate_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_donation_certificate_number
  BEFORE INSERT ON donation_certificates
  FOR EACH ROW
  EXECUTE FUNCTION set_donation_certificate_number();

-- Insert sample donation certificate
INSERT INTO donation_certificates (
  donor_name,
  donor_email,
  donation_amount,
  message
) VALUES (
  'João Silva',
  'joao@example.com',
  500.00,
  'Contribuindo para um futuro mais verde!'
);

-- Verify
SELECT * FROM donation_certificates;
