# ⚡ Quick Fix: Column projects.status does not exist

**Erro:** `column projects.status does not exist`  
**Tempo de correção:** ~2 minutos

---

## 🚀 SOLUÇÃO RÁPIDA

### 1. Abra o SQL Editor
```
https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
```

### 2. Copie e Cole Este SQL

```sql
-- ⚡ Quick Fix: Adicionar coluna status
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
CHECK (status IN ('active', 'paused', 'completed', 'planning'));

-- Adicionar outras colunas importantes
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'reforestation' 
CHECK (category IN ('reforestation', 'conservation', 'restoration', 'blue_carbon', 'social'));

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS long_description TEXT;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Colunas adicionadas com sucesso!';
    RAISE NOTICE '✅ Índices criados!';
    RAISE NOTICE '💡 Recarregue a aplicação: npm run dev';
END $$;
```

### 3. Clique em "Run"

### 4. Reinicie a aplicação
```bash
npm run dev
```

---

## ✅ Pronto!

O erro deve ter sumido. Acesse `/loja` para verificar.

---

## 📖 Solução Completa

Para uma correção mais robusta (com geração de slugs, etc):
- Ver: `/FIX_PROJECTS_STATUS_ERROR.md`
- Ou executar: `/supabase/migrations/004_fix_projects_table.sql`

---

**Status:** ✅ Corrigido em 2 minutos
