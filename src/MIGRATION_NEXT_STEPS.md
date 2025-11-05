# 🚀 Próximos Passos da Migração - Guia Rápido

## ✅ O Que Já Foi Feito (40%)

- ✅ Sistema híbrido removido
- ✅ SupabaseContext criado
- ✅ supabaseClient criado
- ✅ App.tsx migrado
- ✅ useProjects.ts migrado
- ✅ cleanupService.ts simplificado
- ✅ Documentação criada

---

## 📋 O Que Falta Fazer (60%)

### 1. **Hooks Restantes** (20% do total)

```bash
# Arquivos para migrar:
/hooks/useCart.ts
/hooks/useCertificates.ts  
/hooks/useDonations.ts
/hooks/useSocialProjects.ts
/hooks/useCalculator.ts
/hooks/useCheckout.ts
```

**Template de migração:**

```typescript
// ANTES
import { ProjectsAPI } from '../services/api';

export function useMyHook() {
  const fetchData = async () => {
    const { data, error } = await ProjectsAPI.getAll();
    // ...
  };
}

// DEPOIS
import { useSupabase } from '../contexts/SupabaseContext';

export function useMyHook() {
  const { supabase, isConnected } = useSupabase();
  
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('table_name')
      .select('*');
    // ...
  };
}
```

---

### 2. **Components** (15% do total)

```bash
# Verificar e atualizar se necessário:
/pages/CMSPage.tsx
/components/DatabaseCleanupPanel.tsx
/components/FeaturedProjects.tsx
```

**O que procurar:**
- Imports de `HybridDataContext`
- Uso de `hybridService`
- Referências a IndexedDB

---

### 3. **Edge Functions** (15% do total)

**Arquivo:** `/supabase/functions/server/index.tsx`

**Mudanças necessárias:**

```typescript
// REMOVER:
import * as kv from './kv_store.tsx';

// REMOVER fallbacks como:
if (error) {
  const kvData = await kv.get(`key_${id}`);
  // ...
}

// MANTER APENAS:
const { data, error } = await supabase
  .from('table')
  .select('*');

if (error) {
  return c.json({ error: error.message }, 500);
}
```

---

### 4. **Services** (5% do total)

```bash
# Verificar:
/services/api.ts          → Pode ser removido ou simplificado
/services/hostinger-api.ts → Verificar se ainda é usado
```

---

### 5. **Utils** (5% do total)

```bash
# Verificar:
/utils/database.ts  → Provavelmente pode ser removido
```

---

## 🎯 Prioridades

### Alta Prioridade 🔴

1. **Migrar useCart.ts** - Essencial para funcionalidade do carrinho
2. **Migrar useCertificates.ts** - Essencial para certificados
3. **Limpar Edge Functions** - Remover KV Store

### Média Prioridade 🟡

4. **Migrar useDonations.ts** - Funcionalidade de doações
5. **Migrar useSocialProjects.ts** - Projetos sociais
6. **Atualizar CMSPage.tsx** - Admin panel

### Baixa Prioridade 🟢

7. **Verificar useCalculator.ts** - Pode já estar OK
8. **Verificar useCheckout.ts** - Pode já estar OK
9. **Limpar arquivos não usados** - Cleanup final

---

## 📝 Checklist Detalhado

### useCart.ts

```typescript
// ANTES
const { data, error } = await CartAPI.getItems(userId);

// DEPOIS
const { data, error } = await supabase
  .from('cart_items')
  .select(`
    *,
    projects (
      id,
      name,
      price_per_m2,
      main_image
    )
  `)
  .eq('user_id', userId)
  .eq('status', 'active');
```

**Tarefas:**
- [ ] Atualizar imports
- [ ] Substituir CartAPI por supabase direto
- [ ] Adicionar useSupabase hook
- [ ] Testar add/remove items
- [ ] Testar clear cart

---

### useCertificates.ts

```typescript
// DEPOIS
const { data, error } = await supabase
  .from('certificates')
  .select(`
    *,
    projects (name, location),
    users:user_profiles (name, email)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

**Tarefas:**
- [ ] Atualizar imports
- [ ] Substituir CertificatesAPI
- [ ] Adicionar useSupabase hook
- [ ] Testar geração de certificados
- [ ] Testar verificação

---

### useDonations.ts

```typescript
// DEPOIS
const { data, error } = await supabase
  .from('donations')
  .select(`
    *,
    social_projects (name, description, image)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

**Tarefas:**
- [ ] Atualizar imports
- [ ] Substituir DonationsAPI
- [ ] Adicionar useSupabase hook
- [ ] Testar criar doação
- [ ] Testar listagem

---

### useSocialProjects.ts

```typescript
// DEPOIS
const { data, error } = await supabase
  .from('social_projects')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

**Tarefas:**
- [ ] Atualizar imports
- [ ] Substituir SocialProjectsAPI
- [ ] Adicionar useSupabase hook
- [ ] Testar CRUD operations

---

### Edge Function - Remover KV

**Localização:** `/supabase/functions/server/index.tsx`

**Buscar e remover:**

```typescript
// REMOVER ESTAS LINHAS:
import * as kv from './kv_store.tsx';

// REMOVER TODOS OS BLOCOS:
await kv.set(`key_${id}`, data);
await kv.get(`key_${id}`);
await kv.del(`key_${id}`);
await kv.getByPrefix('prefix_');
```

**Substituir por:**

```typescript
// Usar apenas Supabase direto
const { data, error } = await supabase.from('table').select();
```

**Tarefas:**
- [ ] Remover import de kv_store
- [ ] Remover todos kv.set()
- [ ] Remover todos kv.get()
- [ ] Remover todos kv.del()
- [ ] Remover todos kv.getByPrefix()
- [ ] Testar todos os endpoints
- [ ] Verificar se Edge Function ainda funciona

---

## 🧪 Como Testar Cada Hook

### Template de Teste

```typescript
// 1. Import no console
const hook = await import('./hooks/useMyHook.ts');

// 2. Chamar hook em component de teste
function TestComponent() {
  const { data, isLoading, error, fetch, create, update, delete } = hook.useMyHook();
  
  // Testar fetch
  useEffect(() => {
    fetch();
  }, []);
  
  // Testar create
  const handleCreate = async () => {
    await create({ ... });
  };
  
  // Verificar state
  console.log({ data, isLoading, error });
  
  return <div>Test</div>;
}
```

---

## 🔍 Script de Verificação

```bash
# Executar para encontrar referências:
chmod +x scripts/find-hybrid-references.sh
./scripts/find-hybrid-references.sh
```

**Output esperado:**
```
🔍 Procurando referências ao sistema híbrido...
==============================================

📝 Buscando 'HybridData' nos arquivos:
--------------------------------------
(deve retornar vazio ou apenas .md files)

📝 Buscando 'hybridService' nos arquivos:
-----------------------------------------
(deve retornar vazio)

...etc
```

---

## 📦 Arquivos que Podem Ser Deletados

Após migração completa:

```bash
# Verificar e deletar se não usados:
/utils/database.ts
/services/api.ts (se API wrapper não for mais usado)
/services/hostinger-api.ts (se não usado)

# Backend files não usados:
/backend/config/database.js
/backend/scripts/*
```

---

## ✅ Quando Cada Fase Estiver Completa

### Após migrar cada hook:

1. ✅ Testar manualmente a funcionalidade
2. ✅ Verificar console por erros
3. ✅ Verificar Network tab por requests corretos
4. ✅ Confirmar dados estão salvando no Supabase

### Após limpar Edge Functions:

1. ✅ Testar cada endpoint via cURL ou Postman
2. ✅ Verificar logs da Edge Function
3. ✅ Confirmar não há erros sobre kv_store
4. ✅ Performance check (deve ser mais rápido)

### Após tudo migrado:

1. ✅ Rodar app completo
2. ✅ Testar todos os fluxos principais
3. ✅ Verificar não há warnings/errors no console
4. ✅ Confirmar performance está boa
5. ✅ Atualizar documentação final

---

## 🎯 Meta Final

```
Estado Atual:   40% completo
Meta:           100% completo

Falta:
- 6 hooks      (20%)
- Components   (15%)
- Edge Funcs   (15%)
- Cleanup      (10%)

Tempo estimado: 2-4 horas de trabalho focado
```

---

## 💡 Dicas Importantes

### 1. **Sempre testar após cada mudança**
```bash
# Não migrar tudo de uma vez
# Migrar 1 hook → Testar → Próximo hook
```

### 2. **Manter MOCK_DATA como fallback**
```typescript
if (error) {
  console.warn('Supabase error:', error);
  setData(MOCK_DATA); // Fallback
}
```

### 3. **Usar try-catch**
```typescript
try {
  const { data } = await supabase.from('table').select();
} catch (err) {
  console.error('Unexpected error:', err);
  setError(err.message);
}
```

### 4. **Verificar RLS Policies**
```sql
-- Se queries falharem com 403, verificar:
SELECT * FROM pg_policies WHERE tablename = 'table_name';
```

### 5. **Logs são seus amigos**
```typescript
console.log('Fetching data...');
const { data, error } = await supabase.from('table').select();
console.log('Result:', { data, error });
```

---

## 🚨 Problemas Comuns e Soluções

### Problema 1: "useSupabase is not defined"
```typescript
// Solução: Adicionar import
import { useSupabase } from '../contexts/SupabaseContext';
```

### Problema 2: "Cannot read property 'from' of undefined"
```typescript
// Solução: Verificar se useSupabase está sendo chamado
const { supabase } = useSupabase(); // ← Não esquecer de chamar
```

### Problema 3: "Table 'xxx' does not exist"
```typescript
// Solução: Verificar nome da tabela no Supabase
// Tabelas corretas:
projects
project_images
social_projects
cart_items
certificates
donations
carbon_calculations
purchases
purchase_items
user_profiles
```

### Problema 4: Queries retornam vazio
```typescript
// Solução: Verificar RLS policies
// Pode precisar desabilitar temporariamente para testar:
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Problema 5: Edge Function retorna 500
```typescript
// Solução: Verificar logs
// No dashboard: Functions → server → Logs
// Ou via CLI: npx supabase functions logs server
```

---

## 📞 Recursos Úteis

### Documentação

- **Supabase Docs:** https://supabase.com/docs
- **Supabase JS Client:** https://supabase.com/docs/reference/javascript
- **RLS Policies:** https://supabase.com/docs/guides/auth/row-level-security

### Ferramentas

- **Supabase Dashboard:** https://supabase.com/dashboard
- **SQL Editor:** Dashboard → SQL Editor
- **Table Editor:** Dashboard → Table Editor  
- **Functions Logs:** Dashboard → Edge Functions → Logs

### Testes

```bash
# Testar Edge Function
curl https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/projects

# Ver logs
npx supabase functions logs server

# Testar query específica
# Via SQL Editor no dashboard
```

---

## ✅ Checklist Final

```
Fase 1: Core (40%)
├─ [x] SupabaseContext
├─ [x] supabaseClient  
├─ [x] App.tsx
├─ [x] useProjects.ts
└─ [x] cleanupService.ts

Fase 2: Hooks (20%)
├─ [ ] useCart.ts
├─ [ ] useCertificates.ts
├─ [ ] useDonations.ts
├─ [ ] useSocialProjects.ts
├─ [ ] useCalculator.ts
└─ [ ] useCheckout.ts

Fase 3: Components (15%)
├─ [ ] CMSPage.tsx
├─ [ ] DatabaseCleanupPanel.tsx
└─ [ ] Others

Fase 4: Backend (15%)
├─ [ ] Edge Functions (remove KV)
└─ [ ] Test all endpoints

Fase 5: Cleanup (10%)
├─ [ ] Remove unused files
├─ [ ] Update docs
└─ [ ] Final tests

TOTAL: [ 40% ] ████░░░░░░
```

---

**Boa sorte com a migração! 🚀**

Qualquer dúvida, consulte:
- `/SUPABASE_ONLY_MIGRATION_COMPLETE.md` - Visão geral completa
- `/HYBRID_SYSTEM_REMOVAL.md` - Detalhes técnicos
- `/SUPABASE_CONNECTION_STATUS.md` - Status da conexão

**Let's finish this! 💪**
