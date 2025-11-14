-- Tabela para imagens estáticas do site (Hero, banners, etc.)
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- 'hero_primary', 'hero_secondary', etc.
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para imagens dos certificados
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
CREATE INDEX IF NOT EXISTS idx_certificate_images_active ON certificate_images(is_active);
CREATE INDEX IF NOT EXISTS idx_certificate_images_order ON certificate_images(display_order);

-- RLS Policies
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_images ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública
CREATE POLICY "Allow public read access to site_images" ON site_images
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to certificate_images" ON certificate_images
  FOR SELECT USING (is_active = true);

-- Permitir admin gerenciar (você pode ajustar conforme sua lógica de admin)
CREATE POLICY "Allow authenticated users to manage site_images" ON site_images
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage certificate_images" ON certificate_images
  FOR ALL USING (auth.role() = 'authenticated');

-- Inserir imagens padrão do Hero
INSERT INTO site_images (key, url, alt_text, display_order) VALUES
  ('hero_primary', '/images/amazon-aerial-new.jpg', 'Floresta Amazônica - Vista Aérea', 1),
  ('hero_secondary', 'https://images.unsplash.com/photo-1653149875526-e2533c6af095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjByYWluZm9yZXN0JTIwYWVyaWFsJTIwdmlld3hlbnwxfHx8fDE3NTYxNjc0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080', 'Floresta Amazônica - Vista Aérea 2', 2)
ON CONFLICT (key) DO NOTHING;
