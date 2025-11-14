-- =====================================================
-- VERIFICAR IMAGENS CADASTRADAS PELO CMS
-- =====================================================

-- 1. VER TODAS as imagens cadastradas (não apenas hero)
SELECT 
  id,
  key,
  url,
  alt_text,
  display_order,
  is_active,
  created_at
FROM site_images
ORDER BY created_at DESC;

-- 2. VER imagens SEM key (upadas pelo CMS)
SELECT 
  id,
  key,
  url,
  alt_text,
  display_order,
  is_active,
  created_at
FROM site_images
WHERE key IS NULL
ORDER BY created_at DESC;

-- 3. CONTAR imagens por tipo
SELECT 
  CASE 
    WHEN key IS NULL THEN 'Sem key (CMS)'
    WHEN key IN ('hero_primary', 'hero_secondary', 'hero_tertiary') THEN 'Hero (padrão)'
    ELSE 'Outro'
  END as tipo,
  COUNT(*) as quantidade
FROM site_images
GROUP BY tipo;

-- =====================================================
-- CORREÇÃO: Atribuir keys às imagens do CMS
-- =====================================================

-- Se você fez upload de 3 imagens pelo CMS, elas estarão sem key
-- Vamos atribuir as keys hero_primary, hero_secondary, hero_tertiary

-- PRIMEIRO: Deletar imagens padrão do Unsplash
DELETE FROM site_images 
WHERE url LIKE '%unsplash.com%';

-- SEGUNDO: Atribuir keys às suas imagens (as 3 mais recentes)
WITH ranked_images AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM site_images
  WHERE key IS NULL
  LIMIT 3
)
UPDATE site_images
SET 
  key = CASE 
    WHEN ri.rn = 1 THEN 'hero_primary'
    WHEN ri.rn = 2 THEN 'hero_secondary'
    WHEN ri.rn = 3 THEN 'hero_tertiary'
  END,
  display_order = ri.rn - 1,
  is_active = true
FROM ranked_images ri
WHERE site_images.id = ri.id;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Ver imagens do hero agora
SELECT 
  key,
  LEFT(url, 80) || '...' as url_preview,
  is_active,
  display_order,
  created_at
FROM site_images
WHERE key IN ('hero_primary', 'hero_secondary', 'hero_tertiary')
ORDER BY display_order;

-- Contar total
SELECT 
  COUNT(*) as total_imagens,
  COUNT(CASE WHEN key IN ('hero_primary', 'hero_secondary', 'hero_tertiary') THEN 1 END) as imagens_hero,
  COUNT(CASE WHEN is_active = true THEN 1 END) as imagens_ativas
FROM site_images;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
