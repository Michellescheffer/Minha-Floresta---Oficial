-- =====================================================
-- CORRIGIR COLUNAS DA TABELA PROJECTS
-- Execute este script para renomear as colunas
-- =====================================================

-- 1. VERIFICAR estrutura atual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- 2. RENOMEAR COLUNAS (se existirem com nomes antigos)
-- Verificar se as colunas antigas existem antes de renomear

-- Renomear price_per_m2 para price_per_sqm
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'price_per_m2'
  ) THEN
    ALTER TABLE projects RENAME COLUMN price_per_m2 TO price_per_sqm;
    RAISE NOTICE 'Coluna price_per_m2 renomeada para price_per_sqm';
  ELSE
    RAISE NOTICE 'Coluna price_per_m2 não existe ou já foi renomeada';
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
    RAISE NOTICE 'Coluna available_m2 renomeada para available_area';
  ELSE
    RAISE NOTICE 'Coluna available_m2 não existe ou já foi renomeada';
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
    RAISE NOTICE 'Coluna total_m2 renomeada para total_area';
  ELSE
    RAISE NOTICE 'Coluna total_m2 não existe ou já foi renomeada';
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
    RAISE NOTICE 'Coluna image renomeada para image_url';
  ELSE
    RAISE NOTICE 'Coluna image não existe ou já foi renomeada';
  END IF;
END $$;

-- 3. VERIFICAR estrutura após renomeação
SELECT 
  column_name, 
  data_type,
  CASE 
    WHEN column_name IN ('price_per_sqm', 'available_area', 'total_area', 'image_url') 
    THEN '✅ CORRETO'
    WHEN column_name IN ('price_per_m2', 'available_m2', 'total_m2', 'image') 
    THEN '❌ ANTIGO'
    ELSE '⚪ OUTRO'
  END as status
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- 4. VERIFICAR dados
SELECT 
  id,
  name,
  price_per_sqm,
  available_area,
  total_area,
  image_url
FROM projects
LIMIT 5;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
