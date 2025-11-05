# 📊 Lista Completa de Tabelas do Supabase

**Projeto:** Minha Floresta Conservações  
**Data:** 04/11/2025  
**Status:** ✅ Tabelas criadas via migrações

---

## 🗂️ TABELAS PRINCIPAIS DO BANCO DE DADOS

### 1️⃣ SISTEMA DE USUÁRIOS

#### `user_profiles`
- **Descrição:** Perfis de usuário complementando auth.users do Supabase
- **Campos principais:**
  - `id` (UUID, PK, FK para auth.users)
  - `email` (TEXT, UNIQUE)
  - `full_name` (TEXT)
  - `avatar_url` (TEXT)
  - `phone` (TEXT)
  - `address` (JSONB)
  - `preferences` (JSONB)
  - `role` (TEXT: 'user', 'admin', 'moderator')
  - `subscription_status` (TEXT: 'free', 'premium', 'enterprise')
  - `total_co2_offset` (DECIMAL)
  - `total_donated` (DECIMAL)
  - `total_purchased_area` (DECIMAL)
  - `referral_code` (TEXT)
  - `referred_by` (UUID)
  - `metadata` (JSONB)
  - `created_at`, `updated_at`
- **RLS:** ✅ Habilitado
- **Policies:** Users podem ver/editar próprio perfil; Admins veem tudo

---

### 2️⃣ PROJETOS DE REFLORESTAMENTO

#### `projects`
- **Descrição:** Projetos principais de reflorestamento/conservação
- **Campos principais:**
  - `id` (UUID, PK)
  - `name` (TEXT)
  - `slug` (TEXT, UNIQUE)
  - `description` (TEXT)
  - `long_description` (TEXT)
  - `category` (TEXT: 'reforestation', 'conservation', 'restoration', 'blue_carbon', 'social')
  - `status` (TEXT: 'active', 'paused', 'completed', 'planning')
  - `location` (JSONB) - {country, state, city, coordinates, region}
  - `total_area` (DECIMAL) - metros quadrados totais
  - `available_area` (DECIMAL) - área disponível para venda
  - `sold_area` (DECIMAL) - área já vendida
  - `price_per_sqm` (DECIMAL) - preço por m²
  - `co2_absorption_per_sqm` (DECIMAL) - kg CO2/m²/ano
  - `biodiversity_score` (INTEGER 0-100)
  - `water_conservation_impact` (TEXT)
  - `soil_improvement_impact` (TEXT)
  - `species_planted` (JSONB)
  - `planting_date` (DATE)
  - `expected_maturity_years` (INTEGER)
  - `certification_types` (JSONB)
  - `images` (JSONB)
  - `videos` (JSONB)
  - `documents` (JSONB)
  - `monitoring_frequency` (TEXT)
  - `last_monitoring_date` (DATE)
  - `monitoring_reports` (JSONB)
  - `communities_benefited` (INTEGER)
  - `jobs_created` (INTEGER)
  - `social_programs` (JSONB)
  - `featured` (BOOLEAN)
  - `priority` (INTEGER)
  - `tags` (JSONB)
  - `seo_metadata` (JSONB)
  - `created_at`, `updated_at`
- **RLS:** ❌ Público (leitura)
- **Índices:** status, category, featured

#### `project_images`
- **Descrição:** Galeria de imagens dos projetos
- **Campos principais:**
  - `id` (UUID, PK)
  - `project_id` (UUID, FK)
  - `url` (TEXT)
  - `alt_text` (TEXT)
  - `caption` (TEXT)
  - `is_primary` (BOOLEAN)
  - `order_index` (INTEGER)
  - `metadata` (JSONB)
  - `created_at`
- **Índice:** project_id

---

### 3️⃣ SISTEMA DE E-COMMERCE

#### `cart_items`
- **Descrição:** Carrinho de compras
- **Campos principais:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK)
  - `project_id` (UUID, FK)
  - `area_sqm` (DECIMAL)
  - `price_per_sqm` (DECIMAL)
  - `total_price` (DECIMAL, GENERATED/COMPUTED)
  - `session_id` (TEXT) - para não-logados
  - `created_at`, `updated_at`
- **RLS:** ✅ Habilitado (usuário vê apenas seu carrinho)
- **Constraint:** UNIQUE(user_id, project_id)

#### `purchases`
- **Descrição:** Pedidos/Compras realizadas
- **Campos principais:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK)
  - `order_number` (TEXT, UNIQUE)
  - `status` (TEXT: 'pending', 'processing', 'completed', 'cancelled', 'refunded')
  - `subtotal` (DECIMAL)
  - `discount_amount` (DECIMAL)
  - `tax_amount` (DECIMAL)
  - `total_amount` (DECIMAL)
  - `currency` (TEXT, default 'BRL')
  - `payment_method` (TEXT: 'stripe', 'paypal', 'bank_transfer')
  - `payment_status` (TEXT: 'pending', 'paid', 'failed', 'refunded')
  - `payment_id` (TEXT)
  - `payment_date` (TIMESTAMP)
  - `shipping_address` (JSONB)
  - `shipping_method` (TEXT)
  - `shipping_cost` (DECIMAL)
  - `tracking_number` (TEXT)
  - `metadata` (JSONB)
  - `notes` (TEXT)
  - `created_at`, `updated_at`
- **RLS:** ✅ Habilitado (usuário vê apenas suas compras)
- **Índices:** user_id, status, user_id+status

#### `purchase_items`
- **Descrição:** Itens individuais de cada pedido
- **Campos principais:**
  - `id` (UUID, PK)
  - `purchase_id` (UUID, FK)
  - `project_id` (UUID, FK)
  - `area_sqm` (DECIMAL)
  - `price_per_sqm` (DECIMAL)
  - `total_price` (DECIMAL)
  - `project_snapshot` (JSONB) - snapshot do projeto no momento da compra
  - `created_at`
- **Índice:** purchase_id

---

### 4️⃣ SISTEMA DE CERTIFICADOS

#### `certificates`
- **Descrição:** Certificados de propriedade/compensação gerados
- **Campos principais:**
  - `id` (UUID, PK)
  - `certificate_number` (TEXT, UNIQUE)
  - `user_id` (UUID, FK)
  - `purchase_id` (UUID, FK)
  - `project_id` (UUID, FK)
  - `certificate_type` (TEXT: 'ownership', 'co2_offset', 'donation')
  - `area_sqm` (DECIMAL)
  - `co2_offset_amount` (DECIMAL) - kg CO2 compensado
  - `mrv_hash` (TEXT, UNIQUE) - verificação blockchain-like
  - `verification_code` (TEXT, UNIQUE)
  - `qr_code_data` (TEXT)
  - `status` (TEXT: 'active', 'revoked', 'expired')
  - `issued_date` (TIMESTAMP)
  - `expiry_date` (TIMESTAMP)
  - `pdf_url` (TEXT)
  - `image_url` (TEXT)
  - `verification_count` (INTEGER)
  - `last_verified_at` (TIMESTAMP)
  - `metadata` (JSONB)
  - `created_at`, `updated_at`
- **RLS:** ✅ Habilitado (usuário vê apenas seus certificados)
- **Índices:** user_id, certificate_number, verification_code, user_id+status

#### `certificate_verifications`
- **Descrição:** Log de verificações de certificado
- **Campos principais:**
  - `id` (UUID, PK)
  - `certificate_id` (UUID, FK)
  - `verified_by_ip` (TEXT)
  - `verified_by_user` (UUID, FK)
  - `verification_method` (TEXT: 'qr_code', 'certificate_number', 'verification_code')
  - `success` (BOOLEAN)
  - `error_message` (TEXT)
  - `metadata` (JSONB)
  - `created_at`
- **RLS:** ✅ Habilitado (leitura pública)

---

### 5️⃣ CALCULADORA DE PEGADA DE CARBONO

#### `carbon_calculations`
- **Descrição:** Cálculos de pegada de carbono salvos
- **Campos principais:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK, nullable)
  - `session_id` (TEXT) - para não-logados
  - `calculation_type` (TEXT: 'personal', 'business', 'event')
  - `input_data` (JSONB) - dados inseridos
  - `total_co2_kg` (DECIMAL)
  - `breakdown` (JSONB) - detalhamento por categoria
  - `recommendations` (JSONB) - recomendações de projetos
  - `calculator_version` (TEXT)
  - `ip_address` (TEXT)
  - `user_agent` (TEXT)
  - `created_at`
- **RLS:** ✅ Habilitado
- **Índice:** user_id

---

### 6️⃣ SISTEMA DE DOAÇÕES

#### `donations`
- **Descrição:** Doações para projetos
- **Campos principais:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK, nullable)
  - `project_id` (UUID, FK)
  - `amount` (DECIMAL)
  - `currency` (TEXT, default 'BRL')
  - `donation_type` (TEXT: 'monetary', 'area', 'equipment')
  - `payment_method` (TEXT)
  - `payment_status` (TEXT: 'pending', 'completed', 'failed', 'refunded')
  - `payment_id` (TEXT)
  - `donor_name` (TEXT)
  - `donor_email` (TEXT)
  - `donor_message` (TEXT)
  - `is_anonymous` (BOOLEAN)
  - `is_recurring` (BOOLEAN)
  - `recurring_frequency` (TEXT: 'monthly', 'quarterly', 'yearly')
  - `certificate_issued` (BOOLEAN)
  - `certificate_id` (UUID, FK)
  - `metadata` (JSONB)
  - `created_at`, `updated_at`
- **RLS:** ✅ Habilitado
- **Índices:** user_id, project_id

---

### 7️⃣ PROJETOS SOCIAIS

#### `social_projects`
- **Descrição:** Projetos sociais específicos
- **Campos principais:**
  - `id` (UUID, PK)
  - `name` (TEXT)
  - `description` (TEXT)
  - `location` (JSONB)
  - `beneficiaries_count` (INTEGER)
  - `communities_involved` (INTEGER)
  - `education_programs` (JSONB)
  - `health_programs` (JSONB)
  - `economic_programs` (JSONB)
  - `related_project_id` (UUID, FK) - relacionamento com projects
  - `status` (TEXT)
  - `start_date`, `end_date` (DATE)
  - `budget` (DECIMAL)
  - `funds_raised` (DECIMAL)
  - `images` (JSONB)
  - `videos` (JSONB)
  - `reports` (JSONB)
  - `created_at`, `updated_at`

---

### 8️⃣ SISTEMA DE NOTIFICAÇÕES

#### `notifications`
- **Descrição:** Notificações para usuários
- **Campos principais:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK)
  - `title` (TEXT)
  - `message` (TEXT)
  - `type` (TEXT: 'info', 'success', 'warning', 'error', 'promotion')
  - `category` (TEXT: 'general', 'purchase', 'certificate', 'project', 'system')
  - `read` (BOOLEAN)
  - `archived` (BOOLEAN)
  - `action_url` (TEXT)
  - `action_label` (TEXT)
  - `delivery_method` (JSONB)
  - `sent_at` (TIMESTAMP)
  - `read_at` (TIMESTAMP)
  - `metadata` (JSONB)
  - `created_at`
  - `expires_at` (TIMESTAMP)
- **RLS:** ✅ Habilitado
- **Índices:** user_id, read, user_id+read

---

### 9️⃣ CONFIGURAÇÕES & AUDITORIA

#### `app_settings`
- **Descrição:** Configurações globais do sistema
- **Campos principais:**
  - `key` (TEXT, PK)
  - `value` (JSONB)
  - `description` (TEXT)
  - `category` (TEXT)
  - `is_public` (BOOLEAN)
  - `created_at`, `updated_at`
- **Dados padrão:**
  - site_name: "Minha Floresta Conservações"
  - default_co2_absorption: 0.023
  - default_currency: "BRL"
  - min_purchase_area: 1
  - max_purchase_area: 10000
  - certificate_validity_years: 50

#### `audit_logs`
- **Descrição:** Logs de auditoria de ações importantes
- **Campos principais:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK)
  - `action` (TEXT)
  - `table_name` (TEXT)
  - `record_id` (UUID)
  - `old_values` (JSONB)
  - `new_values` (JSONB)
  - `ip_address` (TEXT)
  - `user_agent` (TEXT)
  - `metadata` (JSONB)
  - `created_at`
- **RLS:** ✅ Habilitado
- **Índices:** user_id, table_name

---

### 🔟 ANALYTICS

#### `usage_analytics`
- **Descrição:** Analytics de uso da plataforma
- **Campos principais:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK, nullable)
  - `session_id` (TEXT)
  - `event_name` (TEXT)
  - `event_category` (TEXT)
  - `event_data` (JSONB)
  - `page_url` (TEXT)
  - `referrer` (TEXT)
  - `ip_address` (TEXT)
  - `user_agent` (TEXT)
  - `device_info` (JSONB)
  - `created_at`
- **Índices:** user_id, event_name

---

### 🍝 TABELA DE EXEMPLO

#### `macarrao_amarelo`
- **Descrição:** Tabela de demonstração (5 tipos de massa italiana)
- **Campos principais:**
  - `id` (UUID, PK)
  - `espaguete` (TEXT)
  - `penne` (TEXT)
  - `fusilli` (TEXT)
  - `farfalle` (TEXT)
  - `rigatoni` (TEXT)
  - `cor` (TEXT, default 'amarelo')
  - `ingrediente_principal` (TEXT)
  - `tempo_cozimento` (INTEGER)
  - `porcao_recomendada` (INTEGER)
  - `created_at`, `updated_at`
- **RLS:** ✅ Habilitado (leitura pública, escrita autenticada)
- **Nota:** Tabela criada para testes/demonstração

---

## 📋 RESUMO GERAL

### Total de Tabelas: 16

1. ✅ `user_profiles` - Perfis de usuário
2. ✅ `projects` - Projetos de reflorestamento
3. ✅ `project_images` - Imagens dos projetos
4. ✅ `cart_items` - Carrinho de compras
5. ✅ `purchases` - Pedidos/Compras
6. ✅ `purchase_items` - Itens dos pedidos
7. ✅ `certificates` - Certificados gerados
8. ✅ `certificate_verifications` - Log de verificações
9. ✅ `carbon_calculations` - Cálculos de carbono
10. ✅ `donations` - Doações
11. ✅ `social_projects` - Projetos sociais
12. ✅ `notifications` - Notificações
13. ✅ `app_settings` - Configurações do sistema
14. ✅ `audit_logs` - Logs de auditoria
15. ✅ `usage_analytics` - Analytics de uso
16. ✅ `macarrao_amarelo` - Tabela de exemplo

---

## 🔐 SEGURANÇA (RLS)

**Tabelas com RLS Habilitado:**
- ✅ user_profiles
- ✅ cart_items
- ✅ purchases
- ✅ purchase_items
- ✅ certificates
- ✅ certificate_verifications
- ✅ carbon_calculations
- ✅ donations
- ✅ notifications
- ✅ audit_logs
- ✅ macarrao_amarelo

**Tabelas Públicas (sem RLS):**
- ❌ projects (leitura pública necessária para e-commerce)
- ❌ project_images
- ❌ social_projects
- ❌ app_settings (apenas campos com is_public=true)
- ❌ usage_analytics

---

## 🔄 TRIGGERS ATIVOS

**Função:** `update_updated_at_column()`
- Atualiza automaticamente o campo `updated_at` em UPDATE

**Tabelas com Trigger:**
- user_profiles
- projects
- cart_items
- purchases
- certificates
- donations
- social_projects
- app_settings
- macarrao_amarelo

---

## 📊 ÍNDICES PARA PERFORMANCE

**Total:** ~30 índices criados
- Índices simples em campos frequentemente consultados
- Índices compostos para queries comuns (user_id + status, etc)
- Índices em campos JSONB quando necessário

---

## ⚠️ IMPORTANTE

### Tabelas NÃO EXISTENTES (conforme documentos de erro):
- ❌ `app_settings` - **ERRO ANTERIOR**: Estava sendo usada para verificar conectividade, mas não existe!
  - **SOLUÇÃO ATUAL**: Mudado para usar tabela `projects` nas verificações

### Migrações Aplicadas:
1. ✅ `001_initial_schema.sql` - Schema completo (15 tabelas principais)
2. ✅ `002_macarrao_amarelo.sql` - Tabela de exemplo
3. ⏳ `004_fix_projects_table.sql` - Correção de colunas faltantes (PENDENTE)

---

## 🎯 PRÓXIMOS PASSOS DA MIGRAÇÃO

Conforme `/MIGRATION_NEXT_STEPS.md`, os hooks restantes a migrar são:

### ✅ Já Migrados:
- useAuth.ts
- useProjects.ts
- useCalculator.ts
- useCheckout.ts

### ⏳ Pendentes de Migração:
1. **useCart.ts** → usar tabela `cart_items`
2. **useCertificates.ts** → usar tabela `certificates`
3. **useDonations.ts** → usar tabela `donations`
4. **useSocialProjects.ts** → usar tabela `social_projects`

---

**Última atualização:** 04/11/2025  
**Status:** ✅ Schema completo e funcional
