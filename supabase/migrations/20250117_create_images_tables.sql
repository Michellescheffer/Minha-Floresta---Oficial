-- =====================================================
-- SCRIPT: Criar Tabelas de Imagens do Site
-- DESCRIÇÃO: Tabelas para gerenciar imagens do hero banner e certificados
-- DATA: 2025-01-14
-- =====================================================

-- =====================================================
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_site_images_active ON site_images(is_active);
CREATE INDEX IF NOT EXISTS idx_site_images_order ON site_images(display_order);

-- 2. Tabela de Imagens de Certificados
-- =====================================================
CREATE TABLE IF NOT EXISTS certificate_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cert_images_active ON certificate_images(is_active);
CREATE INDEX IF NOT EXISTS idx_cert_images_order ON certificate_images(display_order);

-- 3. Trigger para atualizar updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em site_images
DROP TRIGGER IF EXISTS update_site_images_updated_at ON site_images;
CREATE TRIGGER update_site_images_updated_at
  BEFORE UPDATE ON site_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger em certificate_images
DROP TRIGGER IF EXISTS update_cert_images_updated_at ON certificate_images;
CREATE TRIGGER update_cert_images_updated_at
  BEFORE UPDATE ON certificate_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS (Row Level Security)
-- =====================================================
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_images ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública
DO $$
BEGIN
  CREATE POLICY "Allow public read access to site_images" ON site_images
    FOR SELECT USING (is_active = true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Allow public read access to certificate_images" ON certificate_images
    FOR SELECT USING (is_active = true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Permitir admin gerenciar (ajuste conforme sua lógica de admin)
DO $$
BEGIN
  CREATE POLICY "Allow authenticated users to manage site_images" ON site_images
    FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Allow authenticated users to manage certificate_images" ON certificate_images
    FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 5. Comentários nas tabelas
-- =====================================================
COMMENT ON TABLE site_images IS 'Imagens do hero banner do site';
COMMENT ON TABLE certificate_images IS 'Imagens para os certificados';

COMMENT ON COLUMN site_images.display_order IS 'Ordem de exibição (0 = primeira)';
COMMENT ON COLUMN certificate_images.display_order IS 'Ordem de exibição (0 = primeira)';

-- 6. Dados de exemplo (opcional)
-- =====================================================
-- Inserir imagem de exemplo para o hero banner
INSERT INTO site_images (key, url, alt_text, display_order, is_active)
VALUES 
  ('hero_primary', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&h=1080&fit=crop', 'Floresta Amazônica', 0, true)
ON CONFLICT (key) DO NOTHING;

-- Inserir imagens de exemplo para certificados
INSERT INTO certificate_images (url, alt_text, display_order, is_active)
VALUES 
  ('https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=600&fit=crop', 'Árvores da Floresta', 0, true),
  ('https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop', 'Folhagem Verde', 1, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
