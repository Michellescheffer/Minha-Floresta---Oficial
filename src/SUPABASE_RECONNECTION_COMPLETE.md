# ✅ Supabase - Reconexão Completa

**Data:** 04/11/2025  
**Status:** 🟢 CONECTADO E PRONTO

---

## 🔐 CREDENCIAIS ATUALIZADAS

### Project Information:
- **Project ID:** `ngnybwsovjignsflrhyr`
- **Project URL:** `https://ngnybwsovjignsflrhyr.supabase.co`
- **Status:** ✅ Ativo

### Chaves de Acesso:
```
SUPABASE_URL=https://ngnybwsovjignsflrhyr.supabase.co
SUPABASE_ANON_KEY=***REMOVED***
SUPABASE_SERVICE_ROLE_KEY=<service_role_key_do_dashboard>
```

---

## 📁 ARQUIVOS JÁ ATUALIZADOS

### ✅ Frontend:

1. **`/utils/supabase/info.tsx`**
   ```typescript
   export const projectId = "ngnybwsovjignsflrhyr"
   export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

2. **`/services/supabaseClient.ts`**
   - Importa as credenciais de `/utils/supabase/info.tsx`
   - Cria cliente Supabase singleton
   - URL da Edge Function configurada

3. **`/contexts/SupabaseContext.tsx`**
   - Usa o cliente singleton do supabaseClient.ts
   - Verificação de conexão usando tabela `projects`
   - Listeners online/offline funcionando

### ✅ Backend (Edge Functions):

4. **`/supabase/functions/server/index.tsx`**
   - Lê SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY das env vars
   - Sistema híbrido Supabase + KV Store
   - Rotas prefixadas com `/make-server-1328d8b4`

---

## 🌐 ENDPOINTS DISPONÍVEIS

### Base URL:
```
https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4
```

### Principais Rotas:

#### 🏥 Health & Status
- `GET /status` - Status do servidor (usado pelo CMS)
- `GET /health` - Health check
- `GET /test` - Teste simples

#### 🌳 Projects (Projetos de Reflorestamento)
- `GET /projects` - Listar todos
- `GET /projects/:id` - Buscar específico
- `POST /projects` - Criar novo
- `PUT /projects/:id` - Atualizar
- `DELETE /projects/:id` - Deletar

#### 💝 Social Projects (Projetos Sociais)
- `GET /social-projects` - Listar todos
- `POST /social-projects` - Criar novo
- `PUT /social-projects/:id` - Atualizar
- `DELETE /social-projects/:id` - Deletar

#### 🛒 Cart (Carrinho)
- `GET /cart/:userId` - Buscar carrinho do usuário
- `POST /cart/:userId` - Salvar carrinho

#### 📜 Certificates (Certificados)
- `GET /certificates/:code` - Buscar certificado
- `POST /certificates` - Criar certificado

#### 💝 Donations (Doações)
- `GET /donations` - Listar doações
- `POST /donations` - Criar doação

#### 🧮 Calculator (Calculadora)
- `POST /calculator` - Salvar cálculo

#### 🔧 CMS Admin
- `GET /admin/projects` - Dashboard admin
- `PUT /admin/projects/:id` - Atualizar projeto (admin)
- `DELETE /admin/projects/:id` - Deletar projeto (admin)

#### 🧹 Cleanup
- `POST /clean-all-data` - Limpar todos os dados (Supabase + KV)

---

## 🗄️ BANCO DE DADOS - ESTRUTURA

### 16 Tabelas Criadas:

#### Core:
1. ✅ `user_profiles` - Perfis de usuário
2. ✅ `projects` - Projetos de reflorestamento
3. ✅ `project_images` - Imagens dos projetos
4. ✅ `social_projects` - Projetos sociais

#### E-commerce:
5. ✅ `cart_items` - Carrinho de compras
6. ✅ `purchases` - Pedidos/Compras
7. ✅ `purchase_items` - Itens dos pedidos

#### Certificados:
8. ✅ `certificates` - Certificados emitidos
9. ✅ `certificate_verifications` - Log de verificações

#### Features:
10. ✅ `donations` - Doações
11. ✅ `carbon_calculations` - Cálculos de carbono

#### Sistema:
12. ✅ `notifications` - Notificações
13. ✅ `app_settings` - Configurações
14. ✅ `audit_logs` - Logs de auditoria
15. ✅ `usage_analytics` - Analytics

#### Exemplo:
16. ✅ `macarrao_amarelo` - Tabela de demonstração

**Migrações Aplicadas:**
- ✅ `001_initial_schema.sql` (15 tabelas principais)
- ✅ `002_macarrao_amarelo.sql` (tabela exemplo)

---

## 🔐 SEGURANÇA

### RLS (Row Level Security):
- ✅ Habilitado em 11 tabelas
- ✅ Políticas configuradas para:
  - Usuários veem apenas seus dados
  - Admins têm acesso total
  - Dados públicos (projetos) são acessíveis

### Autenticação:
- ✅ Supabase Auth habilitado
- ✅ JWT configurado (expiry: 3600s)
- ✅ Refresh token rotation ativo
- ✅ Email signup habilitado

---

## 🚀 COMO USAR

### Frontend (React):

```typescript
// Importar cliente Supabase
import { supabase } from './services/supabaseClient';

// Usar no componente
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'active');
```

### Edge Function (Backend):

```typescript
// Fazer request para a Edge Function
import { edgeFunctionUrl, apiRequest } from './services/supabaseClient';

const projects = await apiRequest(
  edgeFunctionUrl('/projects')
);
```

### Context (Hooks):

```typescript
// Usar o contexto Supabase
import { useSupabase } from './contexts/SupabaseContext';

function MyComponent() {
  const { supabase, isConnected, isLoading } = useSupabase();
  
  if (!isConnected) {
    return <div>Conectando ao Supabase...</div>;
  }
  
  // Usar supabase aqui
}
```

---

## 🎯 PRÓXIMOS PASSOS - MIGRAÇÃO DOS HOOKS

Conforme `/MIGRATION_NEXT_STEPS.md`, os hooks pendentes são:

### ⏳ Pendentes:
1. **`useCart.ts`** → usar tabela `cart_items`
2. **`useCertificates.ts`** → usar tabela `certificates`
3. **`useDonations.ts`** → usar tabela `donations`
4. **`useSocialProjects.ts`** → usar tabela `social_projects`

### ✅ Já Migrados:
- ✅ `useAuth.ts` - Autenticação Supabase
- ✅ `useProjects.ts` - Projetos do Supabase
- ✅ `useCalculator.ts` - Edge Function
- ✅ `useCheckout.ts` - Edge Function

---

## 🧪 TESTES DE CONECTIVIDADE

### Testar no Browser:

```javascript
// Console do navegador
const response = await fetch(
  'https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/status',
  {
    headers: {
      'Authorization': 'Bearer ***REMOVED***'
    }
  }
);
const data = await response.json();
console.log('Status:', data);
```

### Verificar Tabelas:

```typescript
// Verificar se tabela projects existe
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .limit(1);

console.log('Projects test:', { data, error });
```

---

## 📊 SYSTEM STATUS

### ✅ O QUE ESTÁ FUNCIONANDO:

1. ✅ **Conexão Supabase** - Credenciais atualizadas
2. ✅ **Edge Functions** - Deploy funcional
3. ✅ **Banco de Dados** - 16 tabelas criadas
4. ✅ **RLS & Policies** - Segurança configurada
5. ✅ **Sistema Híbrido** - Supabase + KV Store operacional
6. ✅ **Rotas CRUD** - Projects, Social Projects, Cart, etc
7. ✅ **Frontend Context** - SupabaseContext funcionando
8. ✅ **Singleton Client** - Sem múltiplas instâncias GoTrueClient

### ⏳ PENDENTE:

1. ⏳ **Migração dos 4 hooks restantes** (useCart, useCertificates, useDonations, useSocialProjects)
2. ⏳ **Testes end-to-end** da aplicação completa
3. ⏳ **Seed de dados iniciais** (se necessário)

---

## 🔧 TROUBLESHOOTING

### Se der erro 403 (Forbidden):
1. Verificar se o SUPABASE_ANON_KEY está correto
2. Verificar RLS policies da tabela
3. Verificar se o endpoint está correto

### Se der erro 404 (Not Found):
1. Verificar se a Edge Function está deployed
2. Verificar se a rota tem o prefixo correto `/make-server-1328d8b4`
3. Verificar se o método HTTP está correto

### Se der erro de conexão:
1. Verificar se o Project ID está correto
2. Verificar conectividade de rede
3. Verificar se o projeto Supabase está ativo

---

## 📝 NOTAS IMPORTANTES

1. **Sistema Híbrido**: O servidor usa Supabase como primário e KV Store como fallback
2. **Prefixo de Rotas**: Todas as rotas da Edge Function têm prefixo `/make-server-1328d8b4`
3. **RLS**: Tabelas sensíveis têm RLS habilitado - sempre considerar isso nas queries
4. **Singleton Client**: Usar sempre o cliente exportado de `supabaseClient.ts` para evitar múltiplas instâncias
5. **Auth Token**: Requests à Edge Function devem incluir `Authorization: Bearer <anon_key>`

---

## 🎉 CONCLUSÃO

A reconexão ao Supabase está **COMPLETA E FUNCIONAL**. Todas as credenciais foram atualizadas, o banco de dados está estruturado com 16 tabelas, a Edge Function está operacional com sistema híbrido, e o frontend está configurado para usar o cliente Supabase corretamente.

**Próximo passo:** Migrar os 4 hooks restantes para usar as tabelas do Supabase diretamente.

---

**Última atualização:** 04/11/2025  
**Status:** ✅ PRONTO PARA CONTINUAR MIGRAÇÃO
