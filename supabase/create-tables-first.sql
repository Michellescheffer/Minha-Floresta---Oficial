-- ============================================
-- CRIAR TABELAS PRIMEIRO
-- Execute este script ANTES do fix-rls-policies.sql
-- ============================================

-- 1. Criar tabela site_images
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

-- 2. Criar tabela certificate_images
CREATE TABLE IF NOT EXISTS certificate_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_site_images_key ON site_images(key);
CREATE INDEX IF NOT EXISTS idx_site_images_active ON site_images(is_active);
CREATE INDEX IF NOT EXISTS idx_certificate_images_active ON certificate_images(is_active);
CREATE INDEX IF NOT EXISTS idx_certificate_images_order ON certificate_images(display_order);

-- 4. Habilitar RLS
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_images ENABLE ROW LEVEL SECURITY;

-- 5. Inserir imagens padrão
INSERT INTO site_images (key, url, alt_text, display_order) VALUES
  ('hero_primary', '/images/amazon-aerial-new.jpg', 'Floresta Amazônica - Vista Aérea', 1),
  ('hero_secondary', 'https://images.unsplash.com/photo-1653149875526-e2533c6af095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjByYWluZm9yZXN0JTIwYWVyaWFsJTIwdmlld3hlbnwxfHx8fDE3NTYxNjc0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080', 'Floresta Amazônica - Vista Aérea 2', 2)
ON CONFLICT (key) DO NOTHING;

-- Verificar
SELECT 'site_images' as table_name, COUNT(*) as count FROM site_images
UNION ALL
SELECT 'certificate_images' as table_name, COUNT(*) as count FROM certificate_images;
