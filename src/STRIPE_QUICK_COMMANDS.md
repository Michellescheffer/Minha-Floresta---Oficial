# ⚡ Comandos Rápidos - Stripe Setup

**Copie e cole estes comandos para configurar rapidamente**

---

## 📦 INSTALAR DEPENDÊNCIAS

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## 🗄️ APLICAR MIGRAÇÃO NO SUPABASE

### Opção 1: Via SQL Editor (Recomendado)
1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
2. Abra `/supabase/migrations/005_stripe_tables.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique "Run"

### Opção 2: Via CLI
```bash
supabase db push
```

---

## 🔐 CONFIGURAR SECRETS NO SUPABASE

```bash
# Secret Key do Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_SEU_SECRET_KEY_AQUI

# Webhook Secret (obter após criar webhook)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI
```

### Verificar secrets:
```bash
supabase secrets list
```

---

## 🚀 DEPLOY EDGE FUNCTIONS

```bash
# Deploy stripe-checkout
supabase functions deploy stripe-checkout

# Deploy stripe-webhook  
supabase functions deploy stripe-webhook

# Deploy ambas de uma vez
supabase functions deploy stripe-checkout stripe-webhook
```

### Ver logs:
```bash
# Logs do checkout
supabase functions logs stripe-checkout

# Logs do webhook
supabase functions logs stripe-webhook
```

---

## ⚙️ CONFIGURAR FRONTEND

```bash
# Criar .env a partir do exemplo
cp .env.example .env

# Editar .env (adicionar VITE_STRIPE_PUBLIC_KEY)
nano .env
# ou
code .env
```

**Adicione no .env:**
```
VITE_STRIPE_PUBLIC_KEY=pk_test_SEU_PUBLISHABLE_KEY_AQUI
```

---

## 🧪 TESTAR LOCALMENTE

```bash
# Iniciar dev server
npm run dev

# Em outro terminal - Stripe CLI (opcional)
stripe listen --forward-to https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-webhook

# Trigger evento de teste
stripe trigger payment_intent.succeeded
```

---

## 🔍 VERIFICAR NO SUPABASE

### Via SQL Editor:
```sql
-- Ver payment intents
SELECT * FROM stripe_payment_intents 
ORDER BY created_at DESC LIMIT 5;

-- Ver eventos de webhook
SELECT * FROM stripe_events 
ORDER BY created_at DESC LIMIT 10;

-- Ver compras Stripe
SELECT 
  p.id,
  p.email,
  p.total_amount,
  p.payment_status,
  p.stripe_payment_intent_id,
  p.created_at
FROM purchases p
WHERE p.payment_method = 'stripe'
ORDER BY p.created_at DESC
LIMIT 10;

-- Ver certificados gerados
SELECT 
  c.certificate_number,
  c.area_sqm,
  c.status,
  p.email,
  proj.name as project_name
FROM certificates c
JOIN purchases p ON p.id = c.purchase_id
JOIN projects proj ON proj.id = c.project_id
WHERE p.payment_method = 'stripe'
ORDER BY c.issued_at DESC
LIMIT 10;
```

---

## 🌐 URLs IMPORTANTES

### Supabase Dashboard
```
https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr
```

### SQL Editor
```
https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
```

### Edge Functions
```
https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/functions
```

### Secrets Management
```
https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/settings/functions
```

### Edge Function URLs (Production)
```
# Checkout
https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-checkout

# Webhook
https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-webhook
```

---

## 💳 STRIPE DASHBOARD

### API Keys
```
https://dashboard.stripe.com/test/apikeys
```

### Webhooks
```
https://dashboard.stripe.com/test/webhooks
```

### Payments (Ver transações)
```
https://dashboard.stripe.com/test/payments
```

### Logs
```
https://dashboard.stripe.com/test/logs
```

---

## 🧪 CARTÕES DE TESTE

```
# Sucesso
4242 4242 4242 4242

# Recusado
4000 0000 0000 0002

# 3D Secure (requer autenticação)
4000 0027 6000 3184

# Fundos insuficientes
4000 0000 0000 9995

# Data de validade: Qualquer data futura (ex: 12/25)
# CVC: Qualquer 3 dígitos (ex: 123)
# CEP: Qualquer (ex: 12345)
```

---

## 🐛 DEBUG

### Ver logs da Edge Function em tempo real:
```bash
# Terminal 1 - Logs checkout
supabase functions logs stripe-checkout --follow

# Terminal 2 - Logs webhook
supabase functions logs stripe-webhook --follow
```

### Testar Edge Function diretamente:
```bash
# Teste checkout
curl -X POST \
  https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-checkout \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "donation",
    "donation_amount": 50,
    "email": "teste@example.com"
  }'
```

### Ver todas as tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Verificar se migração foi aplicada:
```sql
SELECT * FROM stripe_payment_intents LIMIT 1;
SELECT * FROM stripe_events LIMIT 1;
SELECT * FROM stripe_subscriptions LIMIT 1;
```

---

## 🔄 ATUALIZAR APÓS MUDANÇAS

### Após modificar Edge Function:
```bash
supabase functions deploy stripe-checkout --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
```

### Após modificar .env:
```bash
# Reiniciar dev server
# Ctrl+C e depois
npm run dev
```

### Após adicionar novo secret:
```bash
supabase secrets set NOVA_VARIAVEL=valor
```

---

## 🚀 IR PARA PRODUÇÃO

```bash
# 1. Trocar para chaves Live no Supabase
supabase secrets set STRIPE_SECRET_KEY=sk_live_SEU_SECRET_KEY_LIVE

# 2. Atualizar webhook secret (após criar webhook de produção)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_LIVE

# 3. Atualizar .env
# VITE_STRIPE_PUBLIC_KEY=pk_live_SEU_PUBLISHABLE_KEY_LIVE

# 4. Rebuild e deploy
npm run build
```

---

## 📊 MÉTRICAS RÁPIDAS

```sql
-- Total vendido hoje
SELECT 
  COUNT(*) as total_vendas,
  SUM(total_amount) as total_valor
FROM purchases 
WHERE payment_status = 'paid' 
  AND payment_method = 'stripe'
  AND DATE(created_at) = CURRENT_DATE;

-- Últimas 10 transações
SELECT 
  email,
  total_amount,
  payment_status,
  created_at
FROM purchases
WHERE payment_method = 'stripe'
ORDER BY created_at DESC
LIMIT 10;

-- Eventos de webhook não processados
SELECT * FROM stripe_events 
WHERE processed = false
ORDER BY created_at DESC;

-- Taxa de sucesso (últimos 7 dias)
SELECT 
  DATE(created_at) as dia,
  COUNT(*) as total,
  COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as pagos,
  ROUND(COUNT(CASE WHEN payment_status = 'paid' THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) as taxa_sucesso
FROM purchases
WHERE payment_method = 'stripe'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY dia DESC;
```

---

## 🆘 TROUBLESHOOTING RÁPIDO

### Erro: "Stripe não está configurado"
```bash
# Verificar .env
cat .env

# Recriar .env
cp .env.example .env
nano .env
# Adicionar: VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Reiniciar dev server
npm run dev
```

### Erro: "Webhook signature verification failed"
```bash
# Reconfigurar webhook secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET

# Aguardar 1-2 minutos e testar novamente
```

### Edge Function não responde
```bash
# Ver logs
supabase functions logs stripe-checkout --follow

# Redeploy
supabase functions deploy stripe-checkout

# Verificar se secret está configurado
supabase secrets list
```

### Certificados não são gerados
```sql
-- Verificar se webhook foi recebido
SELECT * FROM stripe_events 
WHERE event_type = 'payment_intent.succeeded'
ORDER BY created_at DESC
LIMIT 5;

-- Verificar se foi processado
SELECT * FROM stripe_events 
WHERE event_type = 'payment_intent.succeeded'
  AND processed = true
ORDER BY created_at DESC
LIMIT 5;

-- Ver erro, se houver
SELECT stripe_event_id, error 
FROM stripe_events 
WHERE error IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

---

## ✅ CHECKLIST RÁPIDO

```bash
# Copie e execute linha por linha:

# 1. Instalar deps
npm install @stripe/stripe-js @stripe/react-stripe-js

# 2. Criar .env
cp .env.example .env
# Editar .env e adicionar VITE_STRIPE_PUBLIC_KEY

# 3. Configurar secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# 4. Deploy functions
supabase functions deploy stripe-checkout stripe-webhook

# 5. Iniciar dev
npm run dev

# ✅ Pronto! Acesse http://localhost:5173 e teste
```

---

**Dúvidas?** Consulte `/STRIPE_SETUP_GUIDE.md` para guia completo.
