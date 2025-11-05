-- ⚡ CORREÇÃO IMEDIATA: column projects.status does not exist
-- Execute este arquivo AGORA no SQL Editor do Supabase
-- URL: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql

-- ============================================================================
-- ADICIONAR COLUNAS FALTANTES
-- ============================================================================

-- 1. Coluna STATUS
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
CHECK (status IN ('active', 'paused', 'completed', 'planning'));

-- 2. Coluna SLUG
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 3. Coluna CATEGORY
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'reforestation' 
CHECK (category IN ('reforestation', 'conservation', 'restoration', 'blue_carbon', 'social'));

-- 4. Coluna LONG_DESCRIPTION
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS long_description TEXT;

-- 5. Coluna FEATURED
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- 6. Coluna PRIORITY
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- ============================================================================
-- CRIAR ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);

-- ============================================================================
-- GERAR SLUGS PARA PROJETOS EXISTENTES
-- ============================================================================

DO $$
DECLARE
    project_record RECORD;
    new_slug TEXT;
    counter INTEGER := 0;
BEGIN
    FOR project_record IN 
        SELECT id, name FROM public.projects WHERE slug IS NULL OR slug = ''
    LOOP
        -- Gerar slug a partir do nome
        new_slug := lower(regexp_replace(project_record.name, '[^a-zA-Z0-9]+', '-', 'g'));
        new_slug := trim(both '-' from new_slug);
        
        -- Garantir unicidade
        IF EXISTS (SELECT 1 FROM public.projects WHERE slug = new_slug AND id != project_record.id) THEN
            new_slug := new_slug || '-' || substring(project_record.id::text, 1, 8);
        END IF;
        
        UPDATE public.projects 
        SET slug = new_slug 
        WHERE id = project_record.id;
        
        counter := counter + 1;
    END LOOP;
    
    RAISE NOTICE '✅ Gerados % slugs', counter;
END $$;

-- ============================================================================
-- ADICIONAR UNIQUE CONSTRAINT NO SLUG
-- ============================================================================

-- Primeiro, garantir que não há duplicatas
UPDATE public.projects p1
SET slug = slug || '-' || substring(id::text, 1, 8)
WHERE EXISTS (
    SELECT 1 FROM public.projects p2 
    WHERE p2.slug = p1.slug 
    AND p2.id < p1.id
);

-- Agora adicionar constraint
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_slug_key;

ALTER TABLE public.projects 
ADD CONSTRAINT projects_slug_key UNIQUE (slug);

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects'
    AND column_name IN ('status', 'slug', 'category', 'long_description', 'featured', 'priority');
    
    IF col_count = 6 THEN
        RAISE NOTICE '';
        RAISE NOTICE '═══════════════════════════════════════';
        RAISE NOTICE '✅ SUCESSO! Todas as colunas foram adicionadas!';
        RAISE NOTICE '═══════════════════════════════════════';
        RAISE NOTICE '';
        RAISE NOTICE '📊 Colunas criadas:';
        RAISE NOTICE '   ✅ status';
        RAISE NOTICE '   ✅ slug';
        RAISE NOTICE '   ✅ category';
        RAISE NOTICE '   ✅ long_description';
        RAISE NOTICE '   ✅ featured';
        RAISE NOTICE '   ✅ priority';
        RAISE NOTICE '';
        RAISE NOTICE '📈 Índices criados:';
        RAISE NOTICE '   ✅ idx_projects_status';
        RAISE NOTICE '   ✅ idx_projects_category';
        RAISE NOTICE '   ✅ idx_projects_featured';
        RAISE NOTICE '   ✅ idx_projects_slug';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 PRÓXIMO PASSO:';
        RAISE NOTICE '   Reinicie a aplicação: npm run dev';
        RAISE NOTICE '';
        RAISE NOTICE '═══════════════════════════════════════';
    ELSE
        RAISE NOTICE '⚠️ ATENÇÃO: Apenas % de 6 colunas foram criadas', col_count;
    END IF;
END $$;
