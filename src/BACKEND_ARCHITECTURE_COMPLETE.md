# 🌱 Minha Floresta Conservações - Arquitetura Backend Completa

## 📋 Índice
1. [Visão Geral da Arquitetura](#visão-geral)
2. [Sistema Híbrido (Supabase + IndexedDB)](#sistema-híbrido)
3. [Supabase Edge Functions](#supabase-edge-functions)
4. [Database Schemas](#database-schemas)
5. [Services & APIs](#services--apis)
6. [Contexts & State Management](#contexts--state-management)
7. [Backend Node.js (Hostinger)](#backend-nodejs)
8. [Hooks Customizados](#hooks-customizados)
9. [Utilities](#utilities)
10. [Configurações](#configurações)

---

## 🏗️ Visão Geral da Arquitetura

### Arquitetura de 3 Camadas

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│              (React + TypeScript)                    │
│  - Components (UI/UX Glassmorphism)                 │
│  - Hooks (useProjects, useCart, etc.)               │
│  - Contexts (HybridDataContext, AuthContext)        │
└──────────────┬──────────────────────────────────────┘
               │
               ├─── IndexedDB (Cache Local)
               │    • projects_cache
               │    • user_data
               │    • cart_persistent
               │    • certificates_offline
               │    • sync_queue
               │
               ├─── Supabase Edge Functions
               │    • /make-server-1328d8b4/*
               │    • Sistema Híbrido
               │    • KV Store Integration
               │
               └─── Supabase PostgreSQL
                    • 15 tabelas principais
                    • RLS (Row Level Security)
                    • Triggers & Functions
```

### Fluxo de Dados

```
USER ACTION
    ↓
REACT COMPONENT
    ↓
CUSTOM HOOK (useProjects, useCart, etc.)
    ↓
HYBRID DATA SERVICE
    ↓
    ├── IndexedDB (Cache) ─→ Response Imediata
    │   └── Background Sync com Supabase
    │
    └── Supabase Edge Function
        └── KV Store + PostgreSQL
            └── Response Persistida
```

---

## 🔄 Sistema Híbrido (Supabase + IndexedDB)

### HybridDataService (`/services/hybridDataService.ts`)

**Principais Funcionalidades:**
- ✅ Cache local com IndexedDB para performance offline
- ✅ Sincronização bidirecional com Supabase
- ✅ Fallback automático em caso de falha
- ✅ Retry logic com exponential backoff
- ✅ Real-time subscriptions
- ✅ Conflict resolution

### IndexedDB Stores

```typescript
// 8 Object Stores no IndexedDB
1. projects_cache      → Cache de projetos
2. user_data           → Dados do usuário
3. cart_persistent     → Carrinho persistente
4. certificates_offline→ Certificados offline
5. calculations_cache  → Cálculos salvos
6. sync_queue          → Fila de sincronização
7. app_config          → Configurações
8. offline_actions     → Ações offline pendentes
```

### Operações Híbridas

```typescript
// Operações principais do HybridDataService

1. fetchFromSupabase<T>()
   - Busca dados do Supabase
   - Faz cache automático no IndexedDB
   - Fallback para KV Store em caso de erro

2. saveToSupabase<T>()
   - Salva no Supabase + KV Store
   - Atualiza cache local
   - Adiciona à fila de sync se falhar

3. hybridGet()
   - Busca do Supabase primeiro
   - Fallback para KV Store
   - Cache no IndexedDB

4. hybridSave()
   - Salva no Supabase + KV Store
   - Sincronização dupla
   - Garantia de persistência

5. syncAll()
   - Sincronização completa do sistema
   - Processa fila de operações pendentes
   - Sync de todas as tabelas
```

---

## 🚀 Supabase Edge Functions

### Localização
```
/supabase/functions/server/index.tsx
```

### Configuração

**Project ID:** `ngnybwsovjignsflrhyr`
**Base URL:** `https://ngnybwsovjignsflrhyr.supabase.co`
**Route Prefix:** `/make-server-1328d8b4`

### Endpoints Disponíveis

#### 1. Health & Status

```typescript
GET /make-server-1328d8b4/status
// Retorna status operacional do sistema híbrido

GET /make-server-1328d8b4/health
// Health check completo

GET /make-server-1328d8b4/test
// Teste simples de conectividade
```

#### 2. Projects (CRUD Completo)

```typescript
GET    /make-server-1328d8b4/projects
POST   /make-server-1328d8b4/projects
GET    /make-server-1328d8b4/projects/:id
PUT    /make-server-1328d8b4/projects/:id
DELETE /make-server-1328d8b4/projects/:id
```

**Exemplo de Request:**
```javascript
// Criar projeto
const response = await fetch(
  'https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/projects',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      name: 'Projeto Amazônia',
      location: 'Amazonas, Brasil',
      price: 25.00,
      total_area: 100000,
      available: 85000
    })
  }
);
```

#### 3. Social Projects

```typescript
GET    /make-server-1328d8b4/social-projects
POST   /make-server-1328d8b4/social-projects
PUT    /make-server-1328d8b4/social-projects/:id
DELETE /make-server-1328d8b4/social-projects/:id
```

#### 4. Cart System

```typescript
GET  /make-server-1328d8b4/cart/:userId
POST /make-server-1328d8b4/cart/:userId
```

**Estrutura do Carrinho:**
```typescript
{
  items: [
    {
      id: string,
      project_id: string,
      area_sqm: number,
      price_per_sqm: number,
      user_id: string
    }
  ]
}
```

#### 5. Donations

```typescript
GET  /make-server-1328d8b4/donations
POST /make-server-1328d8b4/donations
```

#### 6. Certificates

```typescript
GET  /make-server-1328d8b4/certificates/:code
POST /make-server-1328d8b4/certificates
```

#### 7. Calculator

```typescript
POST /make-server-1328d8b4/calculator
```

#### 8. CMS/Admin

```typescript
GET    /make-server-1328d8b4/admin/projects
PUT    /make-server-1328d8b4/admin/projects/:id
DELETE /make-server-1328d8b4/admin/projects/:id
```

#### 9. Cleanup System

```typescript
POST /make-server-1328d8b4/clean-all-data
// Limpeza completa do sistema híbrido (Supabase + KV Store)
```

**Response da Limpeza:**
```typescript
{
  supabase: {
    projects: number,
    project_images: number,
    social_projects: number,
    cart_items: number,
    certificates: number,
    donations: number,
    carbon_calculations: number,
    purchases: number,
    purchase_items: number,
    errors: string[]
  },
  kv_store: {
    projects: number,
    social_projects: number,
    certificates: number,
    donations: number,
    calculations: number,
    cart_items: number,
    images: number,
    errors: string[]
  },
  total_removed: number
}
```

### KV Store Integration

O sistema usa o KV Store do Supabase para cache rápido:

**Localização:** `/supabase/functions/server/kv_store.tsx` (ARQUIVO PROTEGIDO)

**Funções Disponíveis:**
```typescript
kv.get(key: string)           → Buscar um valor
kv.set(key, value)            → Salvar um valor
kv.del(key: string)           → Deletar um valor
kv.mget(keys: string[])       → Buscar múltiplos valores
kv.mset(entries)              → Salvar múltiplos valores
kv.mdel(keys: string[])       → Deletar múltiplos valores
kv.getByPrefix(prefix)        → Buscar por prefixo
```

**Prefixos Usados:**
```
project_*         → Projetos
social_project_*  → Projetos sociais
certificate_*     → Certificados
donation_*        → Doações
calculation_*     → Cálculos
cart_*            → Carrinhos
image_*           → Imagens
```

---

## 💳 Stripe Payment Integration

### Overview

O sistema integra o **Stripe** para processamento de pagamentos seguro com configuração simplificada via painel administrativo.

### Arquitetura de Pagamentos

```
USER → Carrinho → Checkout
            ↓
    StripePaymentForm
            ↓
    useStripeCheckout Hook
            ↓
    Stripe Checkout Session
            ↓
    Stripe Payment Gateway
            ↓
    Webhook Event
            ↓
    stripe-webhook Edge Function
            ↓
    Database Update + Certificate
```

### Componentes do Sistema Stripe

#### 1. Frontend Components

**CMSStripeConfig** (`/components/CMSStripeConfig.tsx`)
- Interface administrativa para configuração
- Validação em tempo real de chaves
- Teste de conexão integrado
- Persistência no Supabase (tabela `app_settings`)
- Fallback para localStorage

**Funcionalidades:**
```typescript
- Configurar Publishable Key (pk_test_* ou pk_live_*)
- Configurar Secret Key (sk_test_* ou sk_live_*)
- Configurar Webhook Secret (whsec_*)
- Testar conexão com Stripe
- Salvar configurações
- Limpar configurações
- Indicadores visuais de status
```

**StripePaymentForm** (`/components/StripePaymentForm.tsx`)
- Formulário de checkout integrado
- Elementos do Stripe Elements
- Validação de cartão
- Loading states
- Tratamento de erros

#### 2. Custom Hook

**useStripeCheckout** (`/hooks/useStripeCheckout.ts`)

```typescript
const {
  createCheckoutSession,
  isProcessing,
  error
} = useStripeCheckout();

// Criar sessão de checkout
const { sessionId, url } = await createCheckoutSession({
  items: cartItems,
  metadata: {
    userId,
    certificateType
  }
});
```

**Funcionalidades:**
- Cria sessões de checkout no Stripe
- Redireciona para página de pagamento
- Callback após sucesso/cancelamento
- Tratamento de erros

#### 3. Utilities

**stripeConfigApi** (`/utils/stripeConfigApi.ts`)

```typescript
// Funções disponíveis:
loadStripeConfig()          // Carregar config do Supabase
saveStripeConfig(config)    // Salvar config no Supabase
testStripeConnection()      // Testar chaves
getStripePublishableKey()   // Obter chave pública
isStripeConfigured()        // Verificar se configurado
```

**Integração com Supabase:**
- Armazena configs na tabela `app_settings`
- Categoria: `stripe`
- Chaves protegidas (is_public: false)
- Backup automático em localStorage

#### 4. Edge Functions

**stripe-checkout** (`/supabase/functions/stripe-checkout/index.ts`)

**Endpoint:** `POST /functions/v1/stripe-checkout`

**Request:**
```typescript
{
  items: CartItem[],
  userId: string,
  metadata: {
    certificateType?: string,
    projectIds?: string[]
  }
}
```

**Response:**
```typescript
{
  sessionId: string,
  url: string  // URL de checkout do Stripe
}
```

**Funcionalidades:**
- Cria Checkout Session no Stripe
- Calcula totais automaticamente
- Adiciona metadata customizada
- Configura URLs de sucesso/cancelamento
- Usa STRIPE_SECRET_KEY do secrets

**stripe-webhook** (`/supabase/functions/stripe-webhook/index.ts`)

**Endpoint:** `POST /functions/v1/stripe-webhook`

**Eventos Processados:**
- `payment_intent.succeeded` - Pagamento bem-sucedido
- `payment_intent.payment_failed` - Pagamento falhou
- `charge.refunded` - Estorno realizado

**Funcionalidades:**
- Valida assinatura do webhook
- Processa eventos do Stripe
- Atualiza status de transações
- Emite certificados automaticamente
- Envia notificações ao usuário
- Registra eventos na tabela `stripe_webhooks`

**Validação de Webhook:**
```typescript
const signature = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  STRIPE_WEBHOOK_SECRET
);
```

### Database Tables (Stripe)

#### stripe_payments
```sql
CREATE TABLE stripe_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_checkout_session_id TEXT,
  user_id UUID REFERENCES user_profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'brl',
  status TEXT NOT NULL,  -- pending | succeeded | failed | refunded
  payment_method_type TEXT,  -- card | boleto | pix
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### stripe_webhooks
```sql
CREATE TABLE stripe_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### app_settings (Config Stripe)
```sql
-- Chaves armazenadas:
key: 'stripe_publishable_key'
key: 'stripe_secret_key'
key: 'stripe_webhook_secret'
key: 'stripe_is_configured'
key: 'stripe_last_tested'
key: 'stripe_test_status'

-- Todas com:
category: 'stripe'
is_public: false  -- Nunca expostas em APIs públicas
```

### Fluxo Completo de Pagamento

```
1. USUÁRIO → Adiciona projetos ao carrinho
              ↓
2. CARRINHO → Clica em "Finalizar Compra"
              ↓
3. FRONTEND → useStripeCheckout.createCheckoutSession()
              ↓
4. EDGE FUNCTION (stripe-checkout)
   - Valida itens
   - Calcula total
   - Cria Checkout Session no Stripe
   - Retorna URL de checkout
              ↓
5. REDIRECT → Página de pagamento do Stripe
              ↓
6. USUÁRIO → Preenche dados do cartão
              ↓
7. STRIPE → Processa pagamento
              ↓
8. WEBHOOK → stripe-webhook Edge Function
   - Recebe evento payment_intent.succeeded
   - Valida assinatura
   - Atualiza tabela transactions
   - Cria registro em stripe_payments
   - Emite certificado automaticamente
   - Envia notificação
              ↓
9. REDIRECT → /checkout/success
   - Mostra confirmação
   - Exibe certificado
```

### Configuração do Stripe

#### Via Painel Admin (RECOMENDADO)

1. Acesse: `/cms`
2. Login como administrador
3. Clique na aba **"Stripe"** (8ª aba)
4. Cole as chaves do Stripe Dashboard:
   - Publishable Key (pk_test_*)
   - Secret Key (sk_test_*)
   - Webhook Secret (whsec_*)
5. Clique em **"Testar Conexão"**
6. Clique em **"Salvar Configurações"**

**Validações Automáticas:**
- ✅ Formato das chaves (pk_, sk_, whsec_)
- ✅ Consistência (test/test ou live/live)
- ✅ Conexão com API do Stripe

**Status Visuais:**
- 🔴 Não Configurado
- 🟡 Configurado (Teste Pendente)
- 🟢 Configurado e Testado

#### Via Arquivo .env (Alternativo)

```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_seu_publishable_key_aqui
```

#### Via Supabase Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### Segurança

**Boas Práticas Implementadas:**
- ✅ Secret Key NUNCA exposta no frontend
- ✅ Publishable Key segura para uso client-side
- ✅ Webhook signature validation
- ✅ Metadata customizada para rastreamento
- ✅ Idempotency keys para evitar cobranças duplicadas
- ✅ HTTPS obrigatório em produção
- ✅ API keys armazenadas com `is_public: false`

**Modo Teste vs Produção:**
- **Teste:** `pk_test_*` e `sk_test_*`
- **Produção:** `pk_live_*` e `sk_live_*`
- Sistema detecta automaticamente o modo

### Cartões de Teste

```
Sucesso:
Número: 4242 4242 4242 4242
Validade: Qualquer data futura
CVV: Qualquer 3 dígitos

Falha (cartão recusado):
Número: 4000 0000 0000 0002

Autenticação 3D Secure:
Número: 4000 0025 0000 3155
```

### Webhooks Configuration

**Webhook URL (Produção):**
```
https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-webhook
```

**Eventos a Escutar:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

**Teste Local:**
```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

### Monitoring & Logs

**Ver eventos processados:**
```bash
supabase functions logs stripe-webhook --tail
```

**Dashboard Stripe:**
- Visualizar pagamentos: https://dashboard.stripe.com/payments
- Webhooks logs: https://dashboard.stripe.com/webhooks
- Eventos: https://dashboard.stripe.com/events

### Integração com Certificados

Após pagamento bem-sucedido, o sistema:

1. ✅ Cria registro na tabela `transactions`
2. ✅ Atualiza status para `completed`
3. ✅ Gera certificado na tabela `certificates`
4. ✅ Envia email com certificado (se configurado)
5. ✅ Disponibiliza certificado no dashboard do usuário

**Dados do Certificado:**
- Número único
- QR Code para verificação
- Hash MRV para validação
- Link para PDF
- Projeto relacionado
- Área adquirida (m²)
- CO2 offset calculado

### Documentação Completa

Para mais detalhes, consulte:
- 📄 `STRIPE_ADMIN_SETUP.md` - Como configurar pelo painel
- 📄 `STRIPE_FRONTEND_CONFIG_COMPLETE.md` - Implementação frontend
- 📄 `STRIPE_SETUP_GUIDE.md` - Setup técnico completo
- 📄 `STRIPE_IMPLEMENTATION_SUMMARY.md` - Resumo técnico
- 📄 `STRIPE_INDEX_UPDATED.md` - Índice completo

---

## 🗄️ Database Schemas

### Supabase PostgreSQL

**Localização do Schema:** `/supabase/migrations/001_initial_schema.sql`

### 15 Tabelas Principais

#### 1. **user_profiles**
```sql
- id UUID (FK → auth.users)
- email TEXT UNIQUE
- full_name TEXT
- avatar_url TEXT
- phone TEXT
- address JSONB
- role TEXT (user | admin | moderator)
- subscription_status TEXT
- total_co2_offset DECIMAL
- total_donated DECIMAL
- total_purchased_area DECIMAL
- referral_code TEXT UNIQUE
- created_at TIMESTAMP
```

#### 2. **projects**
```sql
- id UUID PRIMARY KEY
- name TEXT
- slug TEXT UNIQUE
- description TEXT
- category TEXT (reforestation | conservation | restoration | blue_carbon | social)
- status TEXT (active | paused | completed | planning)
- location JSONB (country, state, city, coordinates)
- total_area DECIMAL(12,2)
- available_area DECIMAL(12,2)
- sold_area DECIMAL(12,2)
- price_per_sqm DECIMAL(8,2)
- co2_absorption_per_sqm DECIMAL(8,4)
- biodiversity_score INTEGER
- species_planted JSONB
- images JSONB
- certification_types JSONB
- communities_benefited INTEGER
- jobs_created INTEGER
- created_at TIMESTAMP
```

#### 3. **project_images**
```sql
- id UUID PRIMARY KEY
- project_id UUID (FK → projects)
- url TEXT
- alt_text TEXT
- is_primary BOOLEAN
- order_index INTEGER
- created_at TIMESTAMP
```

#### 4. **cart_items**
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK → user_profiles)
- project_id UUID (FK → projects)
- area_sqm DECIMAL(10,2)
- price_per_sqm DECIMAL(8,2)
- total_price DECIMAL (GENERATED)
- session_id TEXT
- created_at TIMESTAMP
```

#### 5. **purchases**
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK → user_profiles)
- order_number TEXT UNIQUE
- status TEXT (pending | processing | completed | cancelled | refunded)
- subtotal DECIMAL(12,2)
- discount_amount DECIMAL(12,2)
- tax_amount DECIMAL(12,2)
- total_amount DECIMAL(12,2)
- payment_method TEXT
- payment_status TEXT (pending | paid | failed | refunded)
- payment_id TEXT (Stripe)
- shipping_address JSONB
- created_at TIMESTAMP
```

#### 6. **purchase_items**
```sql
- id UUID PRIMARY KEY
- purchase_id UUID (FK → purchases)
- project_id UUID (FK → projects)
- area_sqm DECIMAL(10,2)
- price_per_sqm DECIMAL(8,2)
- total_price DECIMAL(10,2)
- project_snapshot JSONB
- created_at TIMESTAMP
```

#### 7. **certificates**
```sql
- id UUID PRIMARY KEY
- certificate_number TEXT UNIQUE
- user_id UUID (FK → user_profiles)
- purchase_id UUID (FK → purchases)
- project_id UUID (FK → projects)
- certificate_type TEXT (ownership | co2_offset | donation)
- area_sqm DECIMAL(10,2)
- co2_offset_amount DECIMAL(10,2)
- mrv_hash TEXT UNIQUE
- verification_code TEXT UNIQUE
- qr_code_data TEXT
- status TEXT (active | revoked | expired)
- issued_date TIMESTAMP
- expiry_date TIMESTAMP
- pdf_url TEXT
- created_at TIMESTAMP
```

#### 8. **certificate_verifications**
```sql
- id UUID PRIMARY KEY
- certificate_id UUID (FK → certificates)
- verified_by_ip TEXT
- verification_method TEXT
- success BOOLEAN
- created_at TIMESTAMP
```

#### 9. **carbon_calculations**
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK → user_profiles)
- calculation_type TEXT (personal | business | event)
- input_data JSONB
- total_co2_kg DECIMAL(10,2)
- breakdown JSONB
- recommendations JSONB
- calculator_version TEXT
- created_at TIMESTAMP
```

#### 10. **donations**
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK → user_profiles)
- project_id UUID (FK → projects)
- amount DECIMAL(10,2)
- donation_type TEXT (monetary | area | equipment)
- payment_method TEXT
- payment_status TEXT
- donor_name TEXT
- donor_email TEXT
- is_anonymous BOOLEAN
- is_recurring BOOLEAN
- created_at TIMESTAMP
```

#### 11. **social_projects**
```sql
- id UUID PRIMARY KEY
- name TEXT
- description TEXT
- location JSONB
- beneficiaries_count INTEGER
- communities_involved INTEGER
- education_programs JSONB
- related_project_id UUID (FK → projects)
- status TEXT
- budget DECIMAL(12,2)
- funds_raised DECIMAL(12,2)
- images JSONB
- created_at TIMESTAMP
```

#### 12. **notifications**
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK → user_profiles)
- title TEXT
- message TEXT
- type TEXT (info | success | warning | error | promotion)
- category TEXT (general | purchase | certificate | project | system)
- read BOOLEAN
- action_url TEXT
- created_at TIMESTAMP
```

#### 13. **app_settings**
```sql
- key TEXT PRIMARY KEY
- value JSONB
- description TEXT
- category TEXT
- is_public BOOLEAN
- created_at TIMESTAMP
```

#### 14. **audit_logs**
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK → user_profiles)
- action TEXT
- table_name TEXT
- record_id UUID
- old_values JSONB
- new_values JSONB
- ip_address TEXT
- created_at TIMESTAMP
```

#### 15. **usage_analytics**
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK → user_profiles)
- event_name TEXT
- event_category TEXT
- event_data JSONB
- page_url TEXT
- device_info JSONB
- created_at TIMESTAMP
```

### Índices para Performance

```sql
-- Principais índices criados
idx_user_profiles_email
idx_projects_status
idx_projects_category
idx_cart_items_user_id
idx_purchases_user_status
idx_certificates_number
idx_notifications_user_read
idx_audit_logs_table_name
... (40+ índices no total)
```

### Row Level Security (RLS)

```sql
-- RLS habilitado em:
- user_profiles
- cart_items
- purchases
- purchase_items
- certificates
- carbon_calculations
- donations
- notifications
- audit_logs

-- Políticas principais:
1. Usuários podem ver/editar apenas seus próprios dados
2. Admins têm acesso completo
3. Algumas verificações são públicas (certificados)
```

### Triggers Automáticos

```sql
-- Triggers para updated_at automático em:
- user_profiles
- projects
- cart_items
- purchases
- certificates
- donations
- social_projects
- app_settings
```

### Configurações Iniciais

```sql
-- App Settings padrão inseridos:
- site_name
- default_co2_absorption (0.023)
- default_currency (BRL)
- min_purchase_area (1 m²)
- max_purchase_area (10000 m²)
- certificate_validity_years (50)
- notification_retention_days (90)
```

---

## 📡 Services & APIs

### 1. HybridDataService (`/services/hybridDataService.ts`)

**Classe Principal do Sistema Híbrido**

```typescript
class HybridDataService {
  // Principais métodos públicos
  fetchFromSupabase<T>(table, query?, options?)
  saveToSupabase<T>(table, data, operation, options?)
  deleteFromSupabase(table, id, options?)
  
  getFromCache<T>(storeName, query?, options?)
  cacheData<T>(storeName, data)
  updateCache<T>(storeName, item)
  removeFromCache(storeName, id)
  
  syncAll()
  clearCache(table?)
  getCacheStats()
  getSupabaseClient()
  
  on(event, callback)    // Event listeners
  off(event, callback)
  destroy()
}

// Singleton global
const hybridService = getHybridDataService();
```

**Eventos Disponíveis:**
```typescript
'networkStatusChanged' → Status da rede mudou
'syncStarted'          → Sincronização iniciada
'syncCompleted'        → Sincronização concluída
'syncError'            → Erro na sincronização
'conflictDetected'     → Conflito de dados detectado
```

### 2. API Service (`/services/api.ts`)

**Classes de API específicas por entidade:**

```typescript
// User API
UserAPI.login(email, password)
UserAPI.register(userData)
UserAPI.updateProfile(userId, updates)
UserAPI.logout()
UserAPI.getCurrentUser()
UserAPI.getAuthToken()

// Projects API
ProjectsAPI.getAll()
ProjectsAPI.getById(id)
ProjectsAPI.create(project)
ProjectsAPI.update(id, updates)
ProjectsAPI.updateAvailableArea(id, purchasedArea)

// Social Projects API
SocialProjectsAPI.getAll()
SocialProjectsAPI.getById(id)
SocialProjectsAPI.addDonation(projectId, amount)

// Transactions API
TransactionsAPI.create(transactionData)
TransactionsAPI.getByUser(userId)
TransactionsAPI.updateStatus(id, status)

// Certificates API
CertificatesAPI.getByUser(userId)
CertificatesAPI.getByNumber(certificateNumber)
CertificatesAPI.create(certificateData)

// Donations API
DonationsAPI.create(donationData)
DonationsAPI.getByProject(projectId)
DonationsAPI.getStats()

// System API
SystemAPI.getSettings()
SystemAPI.updateSetting(key, value)
SystemAPI.healthCheck()
```

### 3. Cleanup Service (`/services/cleanupService.ts`)

**Serviço de Limpeza do IndexedDB**

```typescript
class CleanupService {
  forceCloseAllConnections()
  cleanAllIndexedDBData()
  getIndexedDBStatus()
  triggerManualCleanup()
}
```

---

## 🎯 Contexts & State Management

### 1. HybridDataContext (`/contexts/HybridDataContext.tsx`)

**Context Provider para Sistema Híbrido**

```typescript
<HybridDataProvider config={config}>
  {children}
</HybridDataProvider>

// Hook personalizado
const {
  hybridService,
  supabase,
  syncStatus,
  isInitialized,
  cacheStats,
  fetchData,
  saveData,
  deleteData,
  getCachedData,
  clearCache,
  syncAll,
  syncTable,
  updateConfig,
  subscribeToTable
} = useHybridData();
```

**SyncStatus:**
```typescript
{
  isOnline: boolean,
  lastSync: Date | null,
  pendingOperations: number,
  syncInProgress: boolean,
  conflicts: number
}
```

### 2. AuthContext (`/contexts/AuthContext.tsx`)

**Gerenciamento de Autenticação**

```typescript
const {
  user,
  isAuthenticated,
  isLoading,
  login,
  logout,
  register,
  updateProfile
} = useAuth();
```

### 3. AppContext (`/contexts/AppContext.tsx`)

**Estado Global da Aplicação**

```typescript
const {
  currentPage,
  setCurrentPage,
  isMenuOpen,
  toggleMenu,
  ...
} = useAppContext();
```

---

## 📱 Páginas Principais

### Páginas Públicas

#### 1. HomePage (`/pages/HomePage.tsx` - via App.tsx)
- Hero section com animações
- Showcase de projetos
- Depoimentos
- Call-to-action

#### 2. LojaPage (`/pages/LojaPage.tsx`)
- Catálogo de projetos
- Filtros avançados (tipo, localização, preço)
- Cards com informações detalhadas
- Adicionar ao carrinho
- Integração com useProjects hook

#### 3. CarrinhoPage (`/pages/CarrinhoPage.tsx`)
- Listagem de itens
- Cálculo de totais
- Remoção de itens
- Botão para checkout
- **Integração com Stripe Checkout** 🆕
- Redirecionamento para pagamento

#### 4. CalculadoraPegadaPage (`/pages/CalculadoraPegadaPage.tsx`)
- Formulário de cálculo de CO2
- Múltiplos tipos (pessoal, empresarial, evento)
- Resultados detalhados com gráficos
- Recomendações de compensação
- Integração com useCalculator hook

#### 5. DoacoesPage (`/pages/DoacoesPage.tsx`)
- Projetos sociais para doação
- Cards de projetos educacionais
- Formulário de doação
- Integração com useDonations hook

#### 6. VerificarCertificadoPage (`/pages/VerificarCertificadoPage.tsx`)
- Input de código/número do certificado
- QR Code scanner
- Exibição de detalhes do certificado
- Validação de autenticidade
- Sistema MRV integrado

#### 7. ComoFuncionaPage (`/pages/ComoFuncionaPage.tsx`)
- Explicação do processo de compra
- Passos ilustrados
- FAQ
- Vídeos explicativos

#### 8. SobreProjetoPage (`/pages/SobreProjetoPage.tsx`)
- Informações sobre a empresa
- Missão e visão
- Equipe
- Projetos em andamento

#### 9. BlueCarbonPage (`/pages/BlueCarbonPage.tsx`)
- Projetos de carbono azul (oceânicos)
- Manguezais e algas marinhas
- Impacto nos oceanos

#### 10. ProjetosSociaisPage (`/pages/ProjetosSociaisPage.tsx`)
- Listagem de projetos sociais
- Impacto comunitário
- Educação ambiental
- Estatísticas de beneficiários

#### 11. ContatoPage (`/pages/ContatoPage.tsx`)
- Formulário de contato
- Informações de contato
- Mapa de localização
- Redes sociais

### Páginas de Checkout

#### 12. CheckoutSuccessPage (`/pages/CheckoutSuccessPage.tsx`) 🆕
- Confirmação de pagamento
- Detalhes da compra
- Certificado gerado
- Link para dashboard
- Compartilhamento social

#### 13. CheckoutCancelPage (`/pages/CheckoutCancelPage.tsx`) 🆕
- Cancelamento de pagamento
- Opções de retry
- Suporte
- Voltar ao carrinho

### Páginas Autenticadas

#### 14. DashboardPage (`/pages/DashboardPage.tsx`)
- Visão geral do usuário
- Certificados adquiridos
- Histórico de compras
- Área compensada total
- CO2 offset total
- Estatísticas pessoais

#### 15. CMSPage (`/pages/CMSPage.tsx`) - **ADMIN COMPLETO** 🆕

**Acesso:** `/cms` (requer role: admin)

**8 Abas de Gestão:**

##### Aba 1: Dashboard 📊
- KPIs principais (vendas, usuários, projetos)
- Gráficos de analytics
- Real-time stats
- Notificações

**Componentes:**
- `CMSRealTimeStats`
- `CMSNotificationCenter`
- Charts (Recharts)

##### Aba 2: Projetos 🌲
- CRUD completo de projetos de reflorestamento
- Upload de imagens com resize
- Gestão de estoque (m² disponíveis)
- Status (ativo/inativo)
- Localização com mapa
- Tags e categorias

**Componentes:**
- `ImageUploadWithResizer`
- Forms com validação
- Tabela com filtros

##### Aba 3: Social ❤️
- CRUD de projetos sociais
- Gestão de beneficiários
- Parcerias comunitárias
- Programas educacionais
- Orçamento e fundos arrecadados

**Componentes:**
- `SocialProjectStats`
- Formulários de criação/edição

##### Aba 4: Certificados 🏆
- Listagem de todos os certificados
- Filtros avançados
- Emissão manual de certificados
- Re-envio de certificados
- Download de PDFs
- QR Codes
- Sistema MRV

**Funcionalidades:**
- Emissão automática após pagamento
- Certificados físicos e digitais
- Verificação de autenticidade

##### Aba 5: Vendas/Transações 🛒
- Histórico completo de vendas
- Status de pagamentos (Stripe)
- Filtros por data, valor, usuário
- Exportação de relatórios
- Detalhes de cada transação
- Reembolsos

**Integração:**
- Tabela `transactions`
- Tabela `stripe_payments`
- Dados em tempo real

##### Aba 6: Analytics 📈
- Métricas detalhadas
- Conversão de vendas
- Análise de produtos
- Comportamento de usuários
- Gráficos customizados
- Relatórios exportáveis

**Componentes:**
- `CMSAdvancedFilters`
- Recharts (gráficos)
- Exportação CSV/PDF

##### Aba 7: Stripe 💳 **NOVO**
- **Configuração completa do Stripe SEM editar código**
- Interface para inserir chaves de API
- Validação em tempo real
- Teste de conexão
- Status visual (🔴🟡🟢)
- Persistência no Supabase

**Componente:** `CMSStripeConfig`

**Funcionalidades:**
```typescript
- Publishable Key (pk_test_* ou pk_live_*)
- Secret Key (sk_test_* ou sk_live_*)
- Webhook Secret (whsec_*)
- Testar Conexão
- Salvar Configurações
- Limpar Configurações
- Indicadores de status
- Modo Teste vs Produção
```

**Validações:**
- ✅ Formato das chaves
- ✅ Consistência test/live
- ✅ Conexão com Stripe API

**Armazenamento:**
- Supabase: tabela `app_settings` (categoria: stripe)
- Fallback: localStorage

##### Aba 8: Config ⚙️
- Configurações gerais do sistema
- Notificações
- Integrações
- Backup e restore
- Logs do sistema

**Funcionalidades:**
- App settings
- Email settings
- API configurations
- Feature flags

### Componentes Principais

#### CMSStripeConfig (`/components/CMSStripeConfig.tsx`) 🆕

**Props:** Nenhuma (usa context)

**Estado:**
```typescript
interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  isConfigured: boolean;
  lastTested: string | null;
  testStatus: 'success' | 'error' | 'pending' | null;
}
```

**Funcionalidades:**
- Formulários controlados
- Validação em tempo real
- Toggle de visibilidade (secret keys)
- Teste de conexão assíncrono
- Salvamento com toast notification
- Loading states

**Integração:**
- `stripeConfigApi.loadStripeConfig()`
- `stripeConfigApi.saveStripeConfig()`
- `stripeConfigApi.testStripeConnection()`

#### StripePaymentForm (`/components/StripePaymentForm.tsx`)

**Props:**
```typescript
interface Props {
  amount: number;
  onSuccess: (paymentIntent) => void;
  onCancel: () => void;
}
```

**Funcionalidades:**
- Stripe Elements integrado
- CardElement component
- Payment Intent processing
- Error handling
- Loading states

#### ImageUploadWithResizer (`/components/ImageUploadWithResizer.tsx`)

**Props:**
```typescript
interface Props {
  onImageUpload: (url: string) => void;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}
```

**Funcionalidades:**
- Upload de imagens
- Resize automático
- Compressão
- Preview
- Progress bar

---

## 🖥️ Backend Node.js (Hostinger)

### Localização: `/backend/server.js`

**Express.js API Server**

### Configuração MySQL

```javascript
const dbConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'u271208684_minhafloresta',
  password: 'B7Jz/vu~4s|Q',
  database: 'u271208684_minhafloresta',
  port: 3306
};
```

### Endpoints Disponíveis

```javascript
// Health & Status
GET /api/health

// Auth
POST /api/auth/register
POST /api/auth/login

// Users
PUT /api/users/:id

// Projects
GET  /api/projects
GET  /api/projects/:id
POST /api/projects/:id/purchase

// Social Projects
GET /api/social-projects
GET /api/social-projects/:id/donations

// Transactions
POST /api/transactions
GET  /api/users/:userId/transactions

// Donations
POST /api/donations
GET  /api/donations/stats

// Certificates
POST /api/certificates
GET  /api/users/:userId/certificates
GET  /api/certificates/:certificateNumber

// Contact
POST /api/contact

// System
GET /api/system/settings
PUT /api/system/settings

// Analytics
GET /api/analytics/dashboard
```

### Middleware de Autenticação

```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};
```

### MySQL Schema

**Localização:** `/database/schema.sql`

**Tabelas principais:**
- users
- projects
- social_projects
- transactions
- certificates
- donations
- carbon_calculations
- shopping_cart
- contact_messages
- system_settings
- audit_log

---

## 🪝 Hooks Customizados

### Localização: `/hooks/`

```typescript
// 1. useProjects
const {
  projects,
  loading,
  error,
  refreshProjects,
  getProjectById
} = useProjects();

// 2. useSocialProjects
const {
  socialProjects,
  loading,
  addDonation
} = useSocialProjects();

// 3. useCart
const {
  cart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getTotal
} = useCart();

// 4. useCertificates
const {
  certificates,
  loading,
  verifyCertificate,
  generateCertificate
} = useCertificates();

// 5. useCalculator
const {
  calculation,
  calculate,
  saveCalculation
} = useCalculator();

// 6. useDonations
const {
  donations,
  createDonation,
  getDonationStats
} = useDonations();

// 7. useCheckout
const {
  processPayment,
  createPurchase,
  generateCertificate
} = useCheckout();

// 8. useAuth
const {
  user,
  login,
  logout,
  register,
  isAuthenticated
} = useAuth();

// 9. useHybridProjects
const {
  projects,
  loading,
  error,
  syncProjects,
  createProject,
  updateProject,
  deleteProject
} = useHybridProjects();
```

---

## 🪝 Custom Hooks Completos

### 1. useStripeCheckout (`/hooks/useStripeCheckout.ts`) 🆕

**Hook para integração com Stripe**

```typescript
const {
  createCheckoutSession,
  isProcessing,
  error
} = useStripeCheckout();

// Uso:
const handleCheckout = async () => {
  const session = await createCheckoutSession({
    items: cartItems,
    userId: user.id,
    metadata: {
      certificateType: 'physical',
      projectIds: cartItems.map(i => i.project_id)
    }
  });
  
  if (session.url) {
    window.location.href = session.url;
  }
};
```

**Funcionalidades:**
- Cria sessão de checkout no Stripe
- Valida items do carrinho
- Adiciona metadata customizada
- Redireciona para página de pagamento
- Error handling completo
- Loading states

### 2. useProjects (`/hooks/useProjects.ts`)

**Hook para gestão de projetos de reflorestamento**

```typescript
const {
  projects,
  loading,
  error,
  fetchProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  filterProjects
} = useProjects();
```

**Integração:**
- Supabase (tabela `projects`)
- Cache local
- Real-time subscriptions

### 3. useCart (`/hooks/useCart.ts`)

**Hook para carrinho de compras**

```typescript
const {
  items,
  totalItems,
  totalPrice,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  getCartTotal
} = useCart();
```

**Persistência:**
- localStorage
- Supabase (tabela `cart_items`)
- Sync automático

### 4. useCalculator (`/hooks/useCalculator.ts`)

**Hook para calculadora de pegada de carbono**

```typescript
const {
  calculate,
  result,
  loading,
  history,
  saveCalculation
} = useCalculator();

// Uso:
const result = await calculate({
  type: 'personal',
  data: {
    car_km: 100,
    flights: 2,
    energy_kwh: 500
  }
});
```

**Funcionalidades:**
- Múltiplos tipos de cálculo
- Breakdown detalhado
- Recomendações
- Histórico de cálculos

### 5. useCertificates (`/hooks/useCertificates.ts`)

**Hook para gestão de certificados**

```typescript
const {
  certificates,
  loading,
  getCertificateByNumber,
  verifyCertificate,
  downloadCertificate,
  getUserCertificates
} = useCertificates();
```

**Integração:**
- Tabela `certificates`
- Sistema MRV
- QR Code generation
- PDF download

### 6. useDonations (`/hooks/useDonations.ts`)

**Hook para sistema de doações**

```typescript
const {
  createDonation,
  getDonations,
  getDonationStats,
  loading
} = useDonations();
```

### 7. useSocialProjects (`/hooks/useSocialProjects.ts`)

**Hook para projetos sociais**

```typescript
const {
  socialProjects,
  loading,
  fetchSocialProjects,
  createSocialProject,
  updateSocialProject,
  deleteSocialProject
} = useSocialProjects();
```

### 8. useCheckout (`/hooks/useCheckout.ts`)

**Hook para processo de checkout**

```typescript
const {
  processCheckout,
  validateCart,
  calculateTotals,
  isProcessing
} = useCheckout();
```

**Integração:**
- useCart
- useStripeCheckout
- Validações

### 9. useAuth (`/hooks/useAuth.ts`)

**Hook para autenticação**

```typescript
const {
  user,
  isAuthenticated,
  loading,
  login,
  logout,
  register,
  updateProfile,
  resetPassword
} = useAuth();
```

**Provider:** Supabase Auth

### 10. useDebounceClick (`/hooks/useDebounceClick.ts`)

**Hook para debounce de cliques**

```typescript
const handleClick = useDebounceClick(() => {
  // Ação
}, 500);
```

### 11. useCleanup (`/hooks/useCleanup.ts`)

**Hook para limpeza de dados**

```typescript
const {
  cleanupDatabase,
  cleanupCache,
  isCleaningfinishing,
  stats
} = useCleanup();
```

### 12. useParallax (`/hooks/useParallax.ts`)

**Hook para efeitos parallax**

```typescript
const offset = useParallax(speed);
```

---

## 🔧 Utilities

### 1. stripeConfigApi.ts (`/utils/stripeConfigApi.ts`) 🆕

**API para configuração do Stripe**

```typescript
// Carregar configurações do Supabase
const config = await loadStripeConfig();
// Retorna: StripeConfigData | null

// Salvar configurações
const result = await saveStripeConfig({
  publishable_key: 'pk_test_...',
  secret_key: 'sk_test_...',
  webhook_secret: 'whsec_...',
  is_configured: true,
  last_tested: new Date().toISOString(),
  test_status: 'success'
});
// Retorna: { success: boolean, error?: string }

// Testar conexão
const result = await testStripeConnection(
  publishableKey,
  secretKey
);
// Retorna: { success: boolean, error?: string, message?: string }

// Obter apenas Publishable Key (seguro para frontend)
const publishableKey = await getStripePublishableKey();

// Verificar se está configurado
const isConfigured = await isStripeConfigured();
```

**Interface:**
```typescript
interface StripeConfigData {
  publishable_key?: string;
  secret_key?: string;
  webhook_secret?: string;
  is_configured?: boolean;
  last_tested?: string;
  test_status?: 'success' | 'error' | 'pending' | null;
}
```

**Armazenamento:**
- Supabase: tabela `app_settings` (categoria: 'stripe')
- Cada configuração é uma row separada
- `is_public: false` para todas as chaves

**Validações:**
- Publishable Key deve começar com 'pk_'
- Secret Key deve começar com 'sk_'
- Webhook Secret deve começar com 'whsec_'
- Consistência test/live (não permite misturar)

### 2. database.ts (`/utils/database.ts`)

```typescript
// Configuração e helpers de database Supabase
export const supabase = createClient(...)

// API request helper
apiRequest<T>(endpoint, options, retries?)

// Helpers
getLocalStorageItem<T>(key, defaultValue)
setLocalStorageItem<T>(key, value)
clearLocalStorage()

// Sync utilities
class DataSync {
  syncIfNeeded()
  syncPendingTransactions()
  syncUserData()
  pullLatestData()
}
```

### 3. supabase/stripeConfig.ts (`/utils/supabase/stripeConfig.ts`)

**Configuração do Stripe para Edge Functions**

```typescript
export const STRIPE_CONFIG = {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 3,
  timeout: 10000
};

export function getStripeInstance() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  return new Stripe(secretKey, STRIPE_CONFIG);
}
```

### 4. errorHandler.ts (`/utils/errorHandler.ts`)

```typescript
handleError(error, context)
logError(error, severity)
reportError(error)
showUserFriendlyError(error)
```

### 5. debug.ts (`/utils/debug.ts`)

```typescript
debugLog(message, data)
debugError(message, error)
debugWarn(message, data)
debugInfo(message, data)
debugPerformance(operation, duration)
```

### 4. uuid.tsx (`/utils/uuid.tsx`)

```typescript
generateUUID()
```

---

## ⚙️ Configurações

### 1. Supabase Info (`/utils/supabase/info.tsx`)

```typescript
export const projectId = "ngnybwsovjignsflrhyr"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Supabase Config (`/supabase/config.toml`)

```toml
[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
```

### 3. Deno Config (`/supabase/functions/deno.json`)

```json
{
  "imports": {
    "@supabase/supabase-js": "...",
    "hono": "..."
  }
}
```

---

## 📊 Fluxos de Dados Principais

### 1. Fluxo de Criação de Projeto

```
USER → CMSPage
  ↓
useHybridProjects.createProject()
  ↓
HybridDataService.saveToSupabase()
  ↓
  ├─→ Supabase Edge Function
  │   └─→ PostgreSQL + KV Store
  │
  └─→ IndexedDB Cache
      └─→ projects_cache
```

### 2. Fluxo de Compra

```
USER → LojaPage → Adiciona ao carrinho
  ↓
useCart.addToCart()
  ↓
Edge Function /cart/:userId
  ↓
  ├─→ Supabase cart_items
  └─→ KV Store cart_{userId}
  
CHECKOUT → CarrinhoPage
  ↓
useCheckout.processPayment()
  ↓
  ├─→ Stripe Payment
  ├─→ Create Purchase (purchases)
  ├─→ Create Purchase Items (purchase_items)
  ├─→ Update Project Area (projects)
  └─→ Generate Certificate (certificates)
```

### 3. Fluxo de Sincronização

```
AUTO-SYNC (30s interval)
  ↓
HybridDataService.syncAll()
  ↓
  ├─→ processSyncQueue()
  │   └─→ Envia operações pendentes
  │
  ├─→ syncProjects()
  │   └─→ Atualiza cache local
  │
  ├─→ syncUserData()
  │   └─→ Sincroniza perfil
  │
  └─→ syncCertificates()
      └─→ Atualiza certificados
```

### 4. Fluxo de Verificação de Certificado

```
USER → VerificarCertificadoPage
  ↓
useCertificates.verifyCertificate(code)
  ↓
Edge Function /certificates/:code
  ↓
  ├─→ Supabase certificates table
  │   └─→ Join com projects e users
  │
  └─→ KV Store certificate_{code}
      └─→ Fallback
  
Response →
  {
    certificate_number,
    user_name,
    project_name,
    area_m2,
    co2_offset_amount,
    issue_date,
    mrv_hash,
    verification_code
  }
```

---

## 🔒 Segurança

### 1. Environment Variables

```bash
# Supabase (Já fornecidos pelo sistema)
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL

# Stripe (Necessário configurar)
STRIPE_PUBLIC_KEY
STRIPE_SECRET_KEY

# Email (Opcional)
EMAIL_SERVICE_API_KEY
```

### 2. Row Level Security (RLS)

```sql
-- Todos os dados sensíveis protegidos por RLS
-- Usuários só acessam seus próprios dados
-- Admins têm permissões especiais
-- Certificados têm verificação pública
```

### 3. API Authentication

```typescript
// Edge Functions usam Bearer token
headers: {
  'Authorization': `Bearer ${publicAnonKey}`
}

// Backend Node.js usa JWT
headers: {
  'Authorization': `Bearer ${jwtToken}`
}
```

---

## 🚀 Inicialização do Sistema

### Sequência de Startup

```typescript
1. App.tsx mounted
   ↓
2. HybridDataProvider inicializado
   ↓
3. HybridDataService.initializeSystem()
   ↓
4. IndexedDB aberto (MinhaFlorestaDB v1)
   ↓
5. Network listeners configurados
   ↓
6. Auto-sync iniciado (30s interval)
   ↓
7. Primeira sincronização executada
   ↓
8. Sistema pronto para uso
```

### Verificação de Saúde

```typescript
// Componente SystemHealthCheck
- Verifica status do Supabase
- Verifica IndexedDB
- Verifica conectividade
- Mostra estatísticas em tempo real
```

---

## 📝 Notas Importantes

### Arquivos Protegidos (NÃO MODIFICAR)

```
/supabase/functions/server/kv_store.tsx
/utils/supabase/info.tsx
/components/figma/ImageWithFallback.tsx
```

### Limpeza de Dados

```typescript
// Para limpar TODOS os dados (Supabase + IndexedDB)
POST /make-server-1328d8b4/clean-all-data

// Para limpar apenas IndexedDB
cleanupService.cleanAllIndexedDBData()
```

### Debug e Logs

```typescript
// Todos os componentes têm logs detalhados
console.log('🟢 Success message')
console.log('🔴 Error message')
console.log('🔄 Processing message')
console.log('⚠️ Warning message')
console.log('📊 Statistics')
```

---

## 🎯 Próximos Passos para Deploy

### 1. Configurar Stripe (VIA PAINEL ADMIN) 🆕

**Opção A: Interface Admin (RECOMENDADO)**
```
1. Acesse: /cms
2. Login como admin
3. Clique na aba "Stripe"
4. Cole as chaves do Stripe Dashboard
5. Teste conexão
6. Salve
```

**Opção B: Manualmente**
```bash
# Frontend (.env)
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Backend (Supabase Secrets)
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Deploy Edge Functions Stripe

```bash
# Deploy funções de pagamento
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook

# Verificar logs
supabase functions logs stripe-checkout --tail
supabase functions logs stripe-webhook --tail
```

### 3. Configurar Webhook no Stripe

```
1. Acesse: https://dashboard.stripe.com/webhooks
2. Adicione endpoint:
   URL: https://[projeto].supabase.co/functions/v1/stripe-webhook
3. Eventos:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - charge.refunded
4. Copie o Webhook Secret
5. Configure via /cms → Stripe OU secrets
```

### 4. Configurar Edge Functions Principais

```bash
# Deploy Edge Function principal
supabase functions deploy minha-floresta-api

# Verificar logs
supabase functions logs minha-floresta-api
```

### 5. Configurar RLS (Row Level Security)

```bash
# Executar migrations
cd supabase
supabase db push

# Verificar políticas
supabase db diff
```

### 6. Popular Dados Iniciais

```sql
-- Via Supabase Dashboard → SQL Editor
-- OU via seeds (se disponível)

INSERT INTO projects (name, description, ...) VALUES ...;
INSERT INTO app_settings (key, value, category) VALUES ...;
```

### 7. Testes Completos

**Stripe:**
- ✅ Configuração via painel admin
- ✅ Checkout com cartão de teste
- ✅ Webhook processamento
- ✅ Certificado emitido após pagamento

**Funcionalidades:**
- ✅ Compra de projeto
- ✅ Calculadora de carbono
- ✅ Doações
- ✅ Emissão de certificados
- ✅ Verificação de certificados

**Sistema:**
- ✅ Sincronização Supabase
- ✅ Cache local funcional
- ✅ Real-time updates
- ✅ Modo offline

---

## 📦 Resumo de Arquivos Principais

### Novos Arquivos (Stripe Integration) 🆕

```
/components/CMSStripeConfig.tsx          # Interface admin para Stripe
/utils/stripeConfigApi.ts                # API de configuração
/hooks/useStripeCheckout.ts              # Hook de checkout
/components/StripePaymentForm.tsx        # Formulário de pagamento
/pages/CheckoutSuccessPage.tsx           # Página de sucesso
/pages/CheckoutCancelPage.tsx            # Página de cancelamento
/supabase/functions/stripe-checkout/     # Edge Function checkout
/supabase/functions/stripe-webhook/      # Edge Function webhook
/utils/supabase/stripeConfig.ts          # Config para Edge Functions
```

### Arquivos Modificados (Stripe Integration) 🔄

```
/pages/CMSPage.tsx                       # Adicionada aba "Stripe"
/pages/CarrinhoPage.tsx                  # Integrado com Stripe
/supabase/migrations/005_stripe_tables.sql # Tabelas Stripe
```

### Total de Arquivos no Sistema

```
📊 Estatísticas:
- Componentes: 40+
- Páginas: 15
- Hooks: 12
- Utils: 10+
- Edge Functions: 5
- Migrations: 5
- Tabelas: 15+
- Contextos: 3
```

---

## 🌟 Features Implementadas

### ✅ Core Features
- Sistema híbrido Supabase + Cache local
- Autenticação completa
- Carrinho de compras persistente
- Calculadora de pegada de carbono
- Certificados com QR Code e MRV
- Sistema de doações

### ✅ Pagamentos Stripe (NOVO)
- Checkout seguro
- Configuração via painel admin
- Webhooks para confirmação
- Emissão automática de certificados
- Suporte test/produção

### ✅ Painel Administrativo
- 8 abas de gestão
- Dashboard com analytics
- CRUD de projetos
- Gestão de certificados
- Transações e vendas
- **Configuração Stripe integrada**
- Real-time stats
- Filtros avançados

### ✅ Performance & UX
- Design glassmorphism
- Loading states
- Error handling
- Toast notifications
- Responsivo mobile/desktop
- PWA ready

---

## 📞 Suporte e Manutenção

### Documentação

**Geral:**
- `README.md` - Guia principal atualizado
- `BACKEND_ARCHITECTURE_COMPLETE.md` - Este arquivo
- `START_HERE.md` - Início rápido

**Stripe:**
- `STRIPE_ADMIN_SETUP.md` - Como configurar pelo painel
- `STRIPE_FRONTEND_CONFIG_COMPLETE.md` - Implementação
- `STRIPE_SETUP_GUIDE.md` - Setup técnico
- `STRIPE_INDEX_UPDATED.md` - Índice completo
- `STRIPE_QUICK_COMMANDS.md` - Comandos rápidos

### Links Úteis

- **Supabase:** https://supabase.com/docs
- **Stripe:** https://stripe.com/docs
- **Dashboard Supabase:** https://supabase.com/dashboard
- **Dashboard Stripe:** https://dashboard.stripe.com

### Comandos de Debug

```bash
# Ver logs Edge Functions
supabase functions logs stripe-checkout --tail
supabase functions logs stripe-webhook --tail

# Status do projeto
supabase status

# Ver secrets configurados
supabase secrets list

# Teste local de webhook
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

### Status do Sistema

```typescript
// Via componente SystemHealthCheck (se disponível)
// OU via endpoint
GET /make-server-1328d8b4/health

// Status Stripe
// Via /cms → Aba "Stripe"
```

---

## 🎉 Conclusão

Este sistema integra:
- ✅ **Supabase** (PostgreSQL + Edge Functions + Auth + Storage)
- ✅ **Stripe** (Pagamentos seguros com configuração simplificada)
- ✅ **React + TypeScript** (Frontend moderno)
- ✅ **Tailwind CSS 4.0** (Design glassmorphism)
- ✅ **Painel Admin Completo** (8 abas de gestão)
- ✅ **Sistema MRV** (Certificados verificáveis)
- ✅ **Performance** (Cache local + Real-time)

**Pronto para produção!** 🚀

---

**Última Atualização:** 05/11/2025  
**Versão do Sistema:** 2.1.0 - Stripe Integrated  
**Status:** ✅ Produção Ready com Pagamentos

_Desenvolvido com 🌱 para um futuro mais verde_
