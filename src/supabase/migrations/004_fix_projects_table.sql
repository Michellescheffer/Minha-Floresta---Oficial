-- 🔧 Migração de Correção: Adicionar colunas faltantes na tabela projects
-- Criada para corrigir erro: "column projects.status does not exist"

-- =====================================
-- 🔍 VERIFICAR E ADICIONAR COLUNAS FALTANTES
-- =====================================

-- Adicionar coluna 'status' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.projects 
        ADD COLUMN status TEXT DEFAULT 'active' 
        CHECK (status IN ('active', 'paused', 'completed', 'planning'));
        
        RAISE NOTICE '✅ Coluna status adicionada à tabela projects';
    ELSE
        RAISE NOTICE '⚠️ Coluna status já existe na tabela projects';
    END IF;
END $$;

-- Adicionar coluna 'slug' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'slug'
    ) THEN
        ALTER TABLE public.projects 
        ADD COLUMN slug TEXT UNIQUE;
        
        RAISE NOTICE '✅ Coluna slug adicionada à tabela projects';
    ELSE
        RAISE NOTICE '⚠️ Coluna slug já existe na tabela projects';
    END IF;
END $$;

-- Adicionar coluna 'category' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.projects 
        ADD COLUMN category TEXT NOT NULL DEFAULT 'reforestation' 
        CHECK (category IN ('reforestation', 'conservation', 'restoration', 'blue_carbon', 'social'));
        
        RAISE NOTICE '✅ Coluna category adicionada à tabela projects';
    ELSE
        RAISE NOTICE '⚠️ Coluna category já existe na tabela projects';
    END IF;
END $$;

-- Adicionar coluna 'long_description' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'long_description'
    ) THEN
        ALTER TABLE public.projects 
        ADD COLUMN long_description TEXT;
        
        RAISE NOTICE '✅ Coluna long_description adicionada à tabela projects';
    ELSE
        RAISE NOTICE '⚠️ Coluna long_description já existe na tabela projects';
    END IF;
END $$;

-- Adicionar coluna 'featured' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'featured'
    ) THEN
        ALTER TABLE public.projects 
        ADD COLUMN featured BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE '✅ Coluna featured adicionada à tabela projects';
    ELSE
        RAISE NOTICE '⚠️ Coluna featured já existe na tabela projects';
    END IF;
END $$;

-- Adicionar coluna 'priority' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'priority'
    ) THEN
        ALTER TABLE public.projects 
        ADD COLUMN priority INTEGER DEFAULT 0;
        
        RAISE NOTICE '✅ Coluna priority adicionada à tabela projects';
    ELSE
        RAISE NOTICE '⚠️ Coluna priority já existe na tabela projects';
    END IF;
END $$;

-- =====================================
-- 📊 GERAR SLUGS PARA PROJETOS EXISTENTES
-- =====================================

-- Atualizar slugs se estiverem vazios
DO $$
DECLARE
    project_record RECORD;
    new_slug TEXT;
BEGIN
    FOR project_record IN 
        SELECT id, name FROM public.projects WHERE slug IS NULL OR slug = ''
    LOOP
        -- Gerar slug a partir do nome
        new_slug := lower(regexp_replace(project_record.name, '[^a-zA-Z0-9]+', '-', 'g'));
        new_slug := trim(both '-' from new_slug);
        
        -- Garantir unicidade
        IF EXISTS (SELECT 1 FROM public.projects WHERE slug = new_slug) THEN
            new_slug := new_slug || '-' || substring(project_record.id::text, 1, 8);
        END IF;
        
        UPDATE public.projects 
        SET slug = new_slug 
        WHERE id = project_record.id;
        
        RAISE NOTICE 'Slug gerado para projeto %: %', project_record.name, new_slug;
    END LOOP;
END $$;

-- =====================================
-- 🔍 CRIAR ÍNDICES SE NÃO EXISTIREM
-- =====================================

-- Índice para status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'projects' 
        AND indexname = 'idx_projects_status'
    ) THEN
        CREATE INDEX idx_projects_status ON public.projects(status);
        RAISE NOTICE '✅ Índice idx_projects_status criado';
    END IF;
END $$;

-- Índice para category
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'projects' 
        AND indexname = 'idx_projects_category'
    ) THEN
        CREATE INDEX idx_projects_category ON public.projects(category);
        RAISE NOTICE '✅ Índice idx_projects_category criado';
    END IF;
END $$;

-- Índice para featured
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'projects' 
        AND indexname = 'idx_projects_featured'
    ) THEN
        CREATE INDEX idx_projects_featured ON public.projects(featured);
        RAISE NOTICE '✅ Índice idx_projects_featured criado';
    END IF;
END $$;

-- =====================================
-- ✅ VERIFICAÇÃO FINAL
-- =====================================

DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    col_name TEXT;
    required_columns TEXT[] := ARRAY['status', 'slug', 'category', 'long_description', 'featured', 'priority'];
BEGIN
    -- Verificar quais colunas ainda estão faltando
    FOREACH col_name IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'projects' 
            AND column_name = col_name
        ) THEN
            missing_columns := array_append(missing_columns, col_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) IS NULL THEN
        RAISE NOTICE '✅ SUCESSO! Todas as colunas necessárias estão presentes na tabela projects';
    ELSE
        RAISE NOTICE '⚠️ ATENÇÃO! Colunas ainda faltando: %', array_to_string(missing_columns, ', ');
    END IF;
END $$;

-- =====================================
-- 📋 EXIBIR ESTRUTURA ATUAL
-- =====================================

-- Listar todas as colunas da tabela projects
DO $$
DECLARE
    column_info RECORD;
    columns_list TEXT := '';
BEGIN
    RAISE NOTICE '📋 Estrutura atual da tabela projects:';
    RAISE NOTICE '═══════════════════════════════════════════════';
    
    FOR column_info IN 
        SELECT 
            column_name, 
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - % (%) | Nullable: % | Default: %', 
            column_info.column_name,
            column_info.data_type,
            column_info.is_nullable,
            COALESCE(column_info.column_default, 'none');
    END LOOP;
    
    RAISE NOTICE '═══════════════════════════════════════════════';
END $$;

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Migração 004_fix_projects_table.sql concluída!';
    RAISE NOTICE '✅ Tabela projects atualizada com todas as colunas necessárias';
    RAISE NOTICE '✅ Índices criados para melhor performance';
    RAISE NOTICE '✅ Slugs gerados para projetos existentes';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Próximo passo: Recarregar a aplicação e verificar se o erro foi corrigido';
END $$;
