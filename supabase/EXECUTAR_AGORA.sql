-- =====================================================
-- SCRIPT CONSOLIDADO - EXECUTAR NO SUPABASE
-- Execute este script completo de uma vez
-- =====================================================

-- =====================================================
-- 1. TABELAS DE IMAGENS
-- =====================================================

-- Tabela de Imagens do Site (Hero Banner)
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Imagens de Certificados
CREATE TABLE IF NOT EXISTS certificate_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_site_images_key ON site_images(key);
CREATE INDEX IF NOT EXISTS idx_site_images_active ON site_images(is_active);
CREATE INDEX IF NOT EXISTS idx_cert_images_active ON certificate_images(is_active);
CREATE INDEX IF NOT EXISTS idx_cert_images_order ON certificate_images(display_order);

-- =====================================================
-- 2. TABELA DE CONFIGURAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'Minha Floresta',
  site_description TEXT,
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

-- =====================================================
-- 3. TABELA DE PROJETOS DE DOAÇÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS donation_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  goal_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para donation_projects
CREATE INDEX IF NOT EXISTS idx_donation_projects_status ON donation_projects(status);
CREATE INDEX IF NOT EXISTS idx_donation_projects_dates ON donation_projects(start_date, end_date);

-- =====================================================
-- 4. TABELA DE CERTIFICADOS DE DOAÇÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS donation_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE NOT NULL,
  donation_project_id UUID REFERENCES donation_projects(id) ON DELETE CASCADE,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_cpf TEXT,
  donation_amount DECIMAL(10,2) NOT NULL,
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  certificate_url TEXT,
  qr_code_url TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para donation_certificates
CREATE INDEX IF NOT EXISTS idx_donation_cert_number ON donation_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_donation_cert_email ON donation_certificates(donor_email);
CREATE INDEX IF NOT EXISTS idx_donation_cert_project ON donation_certificates(donation_project_id);

-- =====================================================
-- 5. FUNÇÃO PARA GERAR NÚMERO DE CERTIFICADO
-- =====================================================

CREATE OR REPLACE FUNCTION generate_donation_certificate_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  cert_number TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM 10) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM donation_certificates
  WHERE certificate_number LIKE 'DOA-' || year_part || '-%';
  
  cert_number := 'DOA-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN cert_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_site_images_updated_at ON site_images;
CREATE TRIGGER update_site_images_updated_at
  BEFORE UPDATE ON site_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cert_images_updated_at ON certificate_images;
CREATE TRIGGER update_cert_images_updated_at
  BEFORE UPDATE ON certificate_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_donation_projects_updated_at ON donation_projects;
CREATE TRIGGER update_donation_projects_updated_at
  BEFORE UPDATE ON donation_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_donation_certificates_updated_at ON donation_certificates;
CREATE TRIGGER update_donation_certificates_updated_at
  BEFORE UPDATE ON donation_certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para gerar número de certificado automaticamente
CREATE OR REPLACE FUNCTION set_donation_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL THEN
    NEW.certificate_number := generate_donation_certificate_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_donation_certificate_number ON donation_certificates;
CREATE TRIGGER set_donation_certificate_number
  BEFORE INSERT ON donation_certificates
  FOR EACH ROW
  EXECUTE FUNCTION set_donation_certificate_number();

-- =====================================================
-- 7. RLS (Row Level Security)
-- =====================================================

ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_certificates ENABLE ROW LEVEL SECURITY;

-- Políticas para site_images
DROP POLICY IF EXISTS "Permitir leitura pública de imagens do site" ON site_images;
CREATE POLICY "Permitir leitura pública de imagens do site"
  ON site_images FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Permitir gerenciamento de imagens do site para autenticados" ON site_images;
CREATE POLICY "Permitir gerenciamento de imagens do site para autenticados"
  ON site_images FOR ALL
  USING (auth.role() = 'authenticated');

-- Políticas para certificate_images
DROP POLICY IF EXISTS "Permitir leitura pública de imagens de certificados" ON certificate_images;
CREATE POLICY "Permitir leitura pública de imagens de certificados"
  ON certificate_images FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Permitir gerenciamento de imagens de certificados para autenticados" ON certificate_images;
CREATE POLICY "Permitir gerenciamento de imagens de certificados para autenticados"
  ON certificate_images FOR ALL
  USING (auth.role() = 'authenticated');

-- Políticas para site_settings
DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON site_settings;
CREATE POLICY "Permitir leitura pública de configurações"
  ON site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir gerenciamento de configurações para autenticados" ON site_settings;
CREATE POLICY "Permitir gerenciamento de configurações para autenticados"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated');

-- Políticas para donation_projects
DROP POLICY IF EXISTS "Permitir leitura pública de projetos de doação" ON donation_projects;
CREATE POLICY "Permitir leitura pública de projetos de doação"
  ON donation_projects FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Permitir gerenciamento de projetos de doação para autenticados" ON donation_projects;
CREATE POLICY "Permitir gerenciamento de projetos de doação para autenticados"
  ON donation_projects FOR ALL
  USING (auth.role() = 'authenticated');

-- Políticas para donation_certificates
DROP POLICY IF EXISTS "Permitir leitura pública de certificados de doação" ON donation_certificates;
CREATE POLICY "Permitir leitura pública de certificados de doação"
  ON donation_certificates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir gerenciamento de certificados de doação para autenticados" ON donation_certificates;
CREATE POLICY "Permitir gerenciamento de certificados de doação para autenticados"
  ON donation_certificates FOR ALL
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 8. DADOS DE EXEMPLO
-- =====================================================

-- Imagens do Hero Banner
INSERT INTO site_images (key, url, alt_text, display_order, is_active) VALUES
  ('hero_primary', '/images/amazon-aerial-new.jpg', 'Floresta Amazônica - Vista Aérea', 0, true),
  ('hero_secondary', 'https://images.unsplash.com/photo-1653149875526-e2533c6af095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjByYWluZm9yZXN0JTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NTYxNjc0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080', 'Floresta Amazônica - Vista Aérea 2', 1, true)
ON CONFLICT (key) DO NOTHING;

-- Imagens de Certificados
INSERT INTO certificate_images (url, alt_text, display_order, is_active) VALUES
  ('https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=600&fit=crop', 'Árvores da Floresta', 0, true),
  ('https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop', 'Folhagem Verde', 1, true)
ON CONFLICT DO NOTHING;

-- Configurações Padrão
INSERT INTO site_settings (
  site_name, 
  site_description, 
  contact_email, 
  contact_phone, 
  contact_address,
  maintenance_mode
) VALUES (
  'Minha Floresta',
  'Compense sua pegada de carbono investindo em projetos de reflorestamento',
  'contato@minhafloresta.com.br',
  '(11) 99999-9999',
  'São Paulo, SP',
  false
)
ON CONFLICT DO NOTHING;

-- Projeto de Doação de Exemplo
INSERT INTO donation_projects (
  title,
  description,
  long_description,
  goal_amount,
  current_amount,
  image_url,
  status,
  start_date,
  end_date
) VALUES (
  'Reflorestamento Amazônia 2025',
  'Projeto de reflorestamento na Amazônia com foco em recuperação de áreas degradadas',
  'Este projeto visa recuperar 100 hectares de floresta amazônica através do plantio de espécies nativas. O projeto conta com monitoramento via satélite e certificação internacional.',
  50000.00,
  12500.00,
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&h=1080&fit=crop',
  'active',
  '2025-01-01',
  '2025-12-31'
)
ON CONFLICT DO NOTHING;

-- Certificado de Doação de Exemplo
INSERT INTO donation_certificates (
  certificate_number,
  donation_project_id,
  donor_name,
  donor_email,
  donor_cpf,
  donation_amount,
  donation_date,
  message,
  is_anonymous,
  status
) VALUES (
  'DOA-2025-000001',
  (SELECT id FROM donation_projects LIMIT 1),
  'João Silva',
  'joao.silva@email.com',
  '123.456.789-00',
  500.00,
  CURRENT_DATE,
  'Contribuindo para um futuro mais verde!',
  false,
  'active'
)
ON CONFLICT (certificate_number) DO NOTHING;

-- =====================================================
-- 9. VERIFICAÇÃO
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
  'site_images' as tabela, 
  COUNT(*) as registros 
FROM site_images
UNION ALL
SELECT 
  'certificate_images' as tabela, 
  COUNT(*) as registros 
FROM certificate_images
UNION ALL
SELECT 
  'site_settings' as tabela, 
  COUNT(*) as registros 
FROM site_settings
UNION ALL
SELECT 
  'donation_projects' as tabela, 
  COUNT(*) as registros 
FROM donation_projects
UNION ALL
SELECT 
  'donation_certificates' as tabela, 
  COUNT(*) as registros 
FROM donation_certificates;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
