-- ============================================
-- VERIFICAR ESTRUTURA DAS TABELAS
-- Execute este SQL e me envie o resultado
-- ============================================

-- 1. Verificar colunas da tabela certificates
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'certificates'
ORDER BY ordinal_position;

-- 2. Verificar colunas da tabela sales
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sales'
ORDER BY ordinal_position;

-- 3. Verificar colunas da tabela projects
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'projects'
ORDER BY ordinal_position;

-- 4. Contar registros
SELECT 
  'projects' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 
  'certificates' as table_name, COUNT(*) as count FROM certificates
UNION ALL
SELECT 
  'sales' as table_name, COUNT(*) as count FROM sales;
