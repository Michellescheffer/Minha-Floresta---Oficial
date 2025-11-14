-- =====================================================
-- CORREÇÕES URGENTES - EXECUTE ESTE SCRIPT COMPLETO
-- =====================================================
-- Este script corrige todos os problemas identificados:
-- 1. Renomeia colunas da tabela projects
-- 2. Corrige imagens do banner
-- 3. Verifica estrutura das tabelas
-- =====================================================

-- =====================================================
-- PARTE 1: CORRIGIR COLUNAS DA TABELA PROJECTS
-- =====================================================

-- Renomear price_per_m2 para price_per_sqm
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'price_per_m2'
  ) THEN
    ALTER TABLE projects RENAME COLUMN price_per_m2 TO price_per_sqm;
    RAISE NOTICE '✅ Coluna price_per_m2 renomeada para price_per_sqm';
  ELSE
    RAISE NOTICE '⚠️ Coluna price_per_m2 não existe ou já foi renomeada';
  END IF;
END $$;

-- Renomear available_m2 para available_area
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'available_m2'
  ) THEN
    ALTER TABLE projects RENAME COLUMN available_m2 TO available_area;
    RAISE NOTICE '✅ Coluna available_m2 renomeada para available_area';
  ELSE
    RAISE NOTICE '⚠️ Coluna available_m2 não existe ou já foi renomeada';
  END IF;
END $$;

-- Renomear total_m2 para total_area
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'total_m2'
  ) THEN
    ALTER TABLE projects RENAME COLUMN total_m2 TO total_area;
    RAISE NOTICE '✅ Coluna total_m2 renomeada para total_area';
  ELSE
    RAISE NOTICE '⚠️ Coluna total_m2 não existe ou já foi renomeada';
  END IF;
END $$;

-- Renomear image para image_url
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'image'
  ) THEN
    ALTER TABLE projects RENAME COLUMN image TO image_url;
    RAISE NOTICE '✅ Coluna image renomeada para image_url';
  ELSE
    RAISE NOTICE '⚠️ Coluna image não existe ou já foi renomeada';
  END IF;
END $$;

-- =====================================================
-- PARTE 2: CORRIGIR IMAGENS DO BANNER
-- =====================================================

-- Deletar imagens padrão do Unsplash
DELETE FROM site_images 
WHERE url LIKE '%unsplash.com%';

-- Se você fez upload de imagens pelo CMS, atribuir keys corretas
-- (Pega as 3 imagens mais recentes e atribui hero_primary, hero_secondary, hero_tertiary)
WITH ranked_images AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM site_images
  WHERE key IS NULL OR key NOT IN ('hero_primary', 'hero_secondary', 'hero_tertiary')
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

-- Se não houver imagens, inserir padrão
INSERT INTO site_images (key, url, alt_text, display_order, is_active)
SELECT 
  'hero_primary', 
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&h=1080&fit=crop&q=80', 
  'Floresta Amazônica - Vista Aérea', 
  0, 
  true
WHERE NOT EXISTS (SELECT 1 FROM site_images WHERE key = 'hero_primary');

INSERT INTO site_images (key, url, alt_text, display_order, is_active)
SELECT 
  'hero_secondary', 
  'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=1080&fit=crop&q=80', 
  'Árvores da Floresta', 
  1, 
  true
WHERE NOT EXISTS (SELECT 1 FROM site_images WHERE key = 'hero_secondary');

INSERT INTO site_images (key, url, alt_text, display_order, is_active)
SELECT 
  'hero_tertiary', 
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&h=1080&fit=crop&q=80', 
  'Folhagem Verde', 
  2, 
  true
WHERE NOT EXISTS (SELECT 1 FROM site_images WHERE key = 'hero_tertiary');

-- =====================================================
-- PARTE 3: VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar estrutura da tabela projects
SELECT 
  '📋 ESTRUTURA DA TABELA PROJECTS' as info,
  column_name, 
  data_type,
  CASE 
    WHEN column_name IN ('price_per_sqm', 'available_area', 'total_area', 'image_url') 
    THEN '✅ CORRETO'
    WHEN column_name IN ('price_per_m2', 'available_m2', 'total_m2', 'image') 
    THEN '❌ ANTIGO (ERRO!)'
    ELSE '⚪ OUTRO'
  END as status
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- Verificar imagens do banner
SELECT 
  '🖼️ IMAGENS DO BANNER' as info,
  key,
  LEFT(url, 60) || '...' as url_preview,
  is_active,
  display_order
FROM site_images
WHERE key IN ('hero_primary', 'hero_secondary', 'hero_tertiary')
ORDER BY display_order;

-- Verificar projetos de doação
SELECT 
  '💝 PROJETOS DE DOAÇÃO' as info,
  COUNT(*) as total_projetos,
  COUNT(CASE WHEN is_active = true THEN 1 END) as projetos_ativos
FROM donation_projects;

-- Listar projetos de doação ativos
SELECT 
  '📋 LISTA DE PROJETOS DE DOAÇÃO ATIVOS' as info,
  title,
  location,
  goal_amount,
  current_amount,
  ROUND((current_amount::numeric / NULLIF(goal_amount, 0)::numeric) * 100, 2) as progresso_pct
FROM donation_projects
WHERE is_active = true
ORDER BY created_at DESC;

-- =====================================================
-- RESUMO FINAL
-- =====================================================
SELECT 
  '✅ SCRIPT EXECUTADO COM SUCESSO!' as status,
  'Verifique os resultados acima' as instrucao,
  'Recarregue a página para ver as mudanças' as proximo_passo;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
