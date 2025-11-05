# 🚀 Minha Floresta - Comandos Rápidos

**Guia rápido de comandos para desenvolvimento e troubleshooting**

---

## 🧪 TESTES DE CONECTIVIDADE

### Testar Conexão Supabase:
```bash
node test-supabase-connection.js
```

### Verificar Status no Browser:
```
https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/status
```

### Testar no Console do Browser:
```javascript
// Status da Edge Function
fetch('https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/status', {
  headers: {
    'Authorization': 'Bearer ***REMOVED***'
  }
}).then(r => r.json()).then(console.log)

// Buscar projetos
fetch('https://ngnybwsovjignsflrhyr.supabase.co/rest/v1/projects?select=*&limit=3', {
  headers: {
    'apikey': '***REMOVED***',
    'Authorization': 'Bearer ***REMOVED***'
  }
}).then(r => r.json()).then(console.log)
```

---

## 📊 ACESSO AO SUPABASE

### Dashboard Supabase:
```
https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr
```

### Páginas Úteis:
- **Table Editor:** `https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/editor`
- **SQL Editor:** `https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql`
- **Edge Functions:** `https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/functions`
- **Logs:** `https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/logs/edge-functions`
- **Auth:** `https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/auth/users`

---

## 🛠️ COMANDOS DE DESENVOLVIMENTO

### Iniciar aplicação:
```bash
npm run dev
# ou
yarn dev
```

### Build:
```bash
npm run build
# ou
yarn build
```

### Limpar cache:
```bash
rm -rf node_modules/.cache
rm -rf .next
npm run build
```

---

## 🗄️ COMANDOS SQL (Supabase SQL Editor)

### Verificar tabelas existentes:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Contar registros por tabela:
```sql
SELECT 
  'projects' as table_name, 
  COUNT(*) as count 
FROM projects
UNION ALL
SELECT 
  'social_projects' as table_name, 
  COUNT(*) as count 
FROM social_projects
UNION ALL
SELECT 
  'cart_items' as table_name, 
  COUNT(*) as count 
FROM cart_items
UNION ALL
SELECT 
  'certificates' as table_name, 
  COUNT(*) as count 
FROM certificates
UNION ALL
SELECT 
  'donations' as table_name, 
  COUNT(*) as count 
FROM donations;
```

### Verificar projetos:
```sql
SELECT id, name, category, status, total_area, available_area 
FROM projects 
LIMIT 10;
```

### Verificar RLS policies:
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Limpar dados de teste (CUIDADO!):
```sql
-- ATENÇÃO: Isso vai deletar TODOS os dados!
-- Execute apenas se tiver certeza!

TRUNCATE TABLE purchase_items CASCADE;
TRUNCATE TABLE purchases CASCADE;
TRUNCATE TABLE certificate_verifications CASCADE;
TRUNCATE TABLE certificates CASCADE;
TRUNCATE TABLE cart_items CASCADE;
TRUNCATE TABLE donations CASCADE;
TRUNCATE TABLE carbon_calculations CASCADE;
TRUNCATE TABLE project_images CASCADE;
TRUNCATE TABLE social_projects CASCADE;
TRUNCATE TABLE projects CASCADE;
```

---

## 🔐 TROUBLESHOOTING

### Erro 403 (Forbidden):
```bash
# Verificar policies RLS
# Ir para: Dashboard > Authentication > Policies
# Verificar se as policies estão corretas para a tabela em questão
```

### Erro 404 (Not Found):
```bash
# Verificar se Edge Function está deployed:
# Dashboard > Edge Functions > server
# Se não estiver, fazer deploy manual
```

### Erro de CORS:
```bash
# Verificar middleware CORS na Edge Function
# Deve ter: cors({ origin: '*', allowHeaders: ['*'], allowMethods: ['*'] })
```

### Erro "relation does not exist":
```bash
# A tabela não existe ou não foi criada
# Verificar migrações aplicadas:
# Dashboard > Database > Migrations
```

### Erro "multiple GoTrueClient instances":
```bash
# Usar sempre o singleton client
import { supabase } from './services/supabaseClient';
# NÃO criar novos clientes com createClient()
```

---

## 📝 QUERIES ÚTEIS PARA DEBUG

### Ver todas as colunas de uma tabela:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'projects';
```

### Ver índices de uma tabela:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'projects';
```

### Ver triggers de uma tabela:
```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'projects';
```

### Ver foreign keys:
```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';
```

---

## 🧹 LIMPEZA DE DADOS

### Via Edge Function (Recomendado):
```bash
# POST request para limpar todos os dados
curl -X POST \
  https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/clean-all-data \
  -H "Authorization: Bearer ***REMOVED***"
```

### Via Browser Console:
```javascript
fetch('https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/clean-all-data', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ***REMOVED***'
  }
}).then(r => r.json()).then(console.log)
```

---

## 🎯 PRÓXIMOS PASSOS

### 1. Testar Conectividade:
```bash
node test-supabase-connection.js
```

### 2. Verificar Tabelas no Dashboard:
```
https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/editor
```

### 3. Migrar Hooks Restantes:
- [ ] `useCart.ts`
- [ ] `useCertificates.ts`
- [ ] `useDonations.ts`
- [ ] `useSocialProjects.ts`

### 4. Testar Aplicação:
```bash
npm run dev
# Testar cada página manualmente
```

### 5. Deploy Final:
```bash
npm run build
# Verificar se não há erros
```

---

## 📚 DOCUMENTAÇÃO ÚTIL

- **Supabase Docs:** https://supabase.com/docs
- **Supabase JS Client:** https://supabase.com/docs/reference/javascript/introduction
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security

---

## 🆘 LINKS DE SUPORTE

- **Supabase Discord:** https://discord.supabase.com/
- **GitHub Issues:** https://github.com/supabase/supabase/issues
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/supabase

---

**Última atualização:** 04/11/2025  
**Status:** ✅ Pronto para uso
