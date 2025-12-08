-- Create donation_certificates table with proper idempotency and error handling

-- Ensure pgcrypto extension is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create table with explicit NOT NULL constraints and comments
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

-- Add comments
COMMENT ON TABLE donation_certificates IS 'Armazena os certificados de doação gerados para os doadores';
COMMENT ON COLUMN donation_certificates.certificate_number IS 'Número único do certificado no formato DOA-YYYY-XXXXXX';
COMMENT ON COLUMN donation_certificates.donation_amount IS 'Valor total da doação em reais';

-- Create indexes for performance
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_donation_certificates_number') THEN
    CREATE INDEX idx_donation_certificates_number ON donation_certificates(certificate_number);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_donation_certificates_email') THEN
    CREATE INDEX idx_donation_certificates_email ON donation_certificates(donor_email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_donation_certificates_project') THEN
    CREATE INDEX idx_donation_certificates_project ON donation_certificates(donation_project_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_donation_certificates_date') THEN
    CREATE INDEX idx_donation_certificates_date ON donation_certificates(donation_date);
  END IF;
END $$;

-- Enable RLS with proper error handling
DO $$
BEGIN
  ALTER TABLE donation_certificates ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  -- Table might already have RLS enabled
  RAISE NOTICE 'RLS already enabled on donation_certificates';
END $$;

-- Create policies with error handling
DO $$
BEGIN
  CREATE POLICY "Allow public read donation_certificates" ON donation_certificates
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Allow public read donation_certificates" already exists';
END $$;

DO $$
BEGIN
  CREATE POLICY "Allow authenticated manage donation_certificates" ON donation_certificates
    FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Allow authenticated manage donation_certificates" already exists';
END $$;

-- Function to generate certificate number with error handling
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_donation_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
    NEW.certificate_number := generate_donation_certificate_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger with error handling
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_set_donation_certificate_number'
  ) THEN
    CREATE TRIGGER trigger_set_donation_certificate_number
      BEFORE INSERT ON donation_certificates
      FOR EACH ROW
      EXECUTE FUNCTION set_donation_certificate_number();
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Trigger trigger_set_donation_certificate_number already exists';
END $$;

-- Insert sample donation certificate if none exists
INSERT INTO donation_certificates (
  donor_name,
  donor_email,
  donation_amount,
  message,
  certificate_number -- Explicitly set to avoid trigger
) VALUES (
  'João Silva',
  'joao@example.com',
  500.00,
  'Contribuindo para um futuro mais verde!',
  'DOA-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-000001'
) 
ON CONFLICT (certificate_number) DO NOTHING;

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_donation_certificates_updated_at'
  ) THEN
    CREATE TRIGGER update_donation_certificates_updated_at
      BEFORE UPDATE ON donation_certificates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Trigger update_donation_certificates_updated_at already exists';
END $$;
