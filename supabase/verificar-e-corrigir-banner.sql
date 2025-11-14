-- =====================================================
-- VERIFICAR E CORRIGIR IMAGENS DO BANNER
-- Execute este script para diagnosticar e corrigir
-- =====================================================

-- 1. VERIFICAR se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'site_images'
) as tabela_existe;

-- 2. VERIFICAR estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'site_images'
ORDER BY ordinal_position;

-- 3. VERIFICAR imagens cadastradas
SELECT 
  id,
  key,
  url,
  alt_text,
  display_order,
  is_active,
  created_at
FROM site_images
ORDER BY display_order;

-- 4. VERIFICAR se há imagens ativas com as keys corretas
SELECT 
  key,
  url,
  is_active,
  display_order
FROM site_images
WHERE key IN ('hero_primary', 'hero_secondary', 'hero_tertiary')
ORDER BY display_order;

-- =====================================================
-- CORREÇÃO: Se não houver imagens, inserir padrão
-- =====================================================

-- Deletar imagens antigas (se houver)
DELETE FROM site_images WHERE key IN ('hero_primary', 'hero_secondary', 'hero_tertiary');

-- Inserir imagens padrão do banner
INSERT INTO site_images (key, url, alt_text, display_order, is_active) VALUES
  (
    'hero_primary', 
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&h=1080&fit=crop&q=80', 
    'Floresta Amazônica - Vista Aérea', 
    0, 
    true
  ),
  (
    'hero_secondary', 
    'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=1080&fit=crop&q=80', 
    'Árvores da Floresta', 
    1, 
    true
  ),
  (
    'hero_tertiary', 
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&h=1080&fit=crop&q=80', 
    'Folhagem Verde', 
    2, 
    true
  );

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as imagens foram inseridas corretamente
SELECT 
  'VERIFICAÇÃO FINAL' as status,
  COUNT(*) as total_imagens,
  COUNT(CASE WHEN is_active = true THEN 1 END) as imagens_ativas,
  COUNT(CASE WHEN key IN ('hero_primary', 'hero_secondary', 'hero_tertiary') THEN 1 END) as imagens_hero
FROM site_images;

-- Listar todas as imagens do hero
SELECT 
  key,
  LEFT(url, 50) || '...' as url_preview,
  is_active,
  display_order
FROM site_images
WHERE key IN ('hero_primary', 'hero_secondary', 'hero_tertiary')
ORDER BY display_order;

-- =====================================================
-- TESTE DE QUERY DO FRONTEND
-- Esta é a mesma query que o Hero.tsx usa
-- =====================================================
SELECT url
FROM site_images
WHERE key IN ('hero_primary', 'hero_secondary', 'hero_tertiary')
  AND is_active = true
ORDER BY display_order ASC;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
