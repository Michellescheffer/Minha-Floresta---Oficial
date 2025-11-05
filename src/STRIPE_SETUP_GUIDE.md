# 🚀 Guia de Configuração Stripe

**Projeto:** Minha Floresta Conservações  
**Data:** 04/11/2025  
**Status:** ✅ Implementação Completa - Aguardando Configuração

---

## 📋 PRÉ-REQUISITOS

- [x] Implementação Stripe completa (código)
- [x] Tabelas do banco de dados criadas (migração 005)
- [x] Edge Functions implementadas
- [ ] Conta Stripe criada
- [ ] Chaves de API configuradas
- [ ] Webhook configurado

---

## PASSO 1: Criar Conta Stripe

### 1.1 Registro
1. Acesse: https://dashboard.stripe.com/register
2. Preencha os dados:
   - Email
   - Nome completo
   - País: **Brasil**
   - Tipo de negócio: **Organização ambiental / E-commerce**
3. Verifique seu email

### 1.2 Ativar Modo de Teste
1. No dashboard, verifique se está em **"Modo de Teste"** (toggle no canto superior direito)
2. ✅ Modo de teste permite testar sem cobranças reais

---

## PASSO 2: Obter Chaves de API

### 2.1 Acessar Chaves
1. No Stripe Dashboard, vá em: **Developers** → **API keys**
2. Você verá 2 tipos de chaves:

#### Publishable Key (pk_test_...)
- ✅ Segura para uso no frontend
- ✅ Pode ser exposta no código
- Exemplo: `pk_test_51AbCdEf...`

#### Secret Key (sk_test_...)
- ⚠️ **NUNCA** exponha no frontend
- ⚠️ Apenas no backend/Edge Functions
- Exemplo: `sk_test_51AbCdEf...`

### 2.2 Copiar Chaves
1. Clique em **"Reveal test key"** para ver a Secret Key
2. Copie ambas as chaves (você vai usar nos próximos passos)

---

## PASSO 3: Aplicar Migração SQL

### 3.1 Acessar SQL Editor do Supabase
1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
2. Clique em **"New Query"**

### 3.2 Executar Migração 005
1. Abra o arquivo: `/supabase/migrations/005_stripe_tables.sql`
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor
4. Clique em **"Run"**

### 3.3 Verificar Sucesso
Você deve ver a mensagem:
```
✅ Migração 005 concluída com sucesso!
📊 Tabelas criadas:
   - stripe_payment_intents
   - stripe_events
   - stripe_subscriptions
```

---

## PASSO 4: Configurar Edge Functions

### 4.1 Adicionar Secrets no Supabase

#### Via Dashboard:
1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/settings/functions
2. Clique em **"Edge Function Secrets"**
3. Adicione os seguintes secrets:

```bash
# Secret Key
Name: STRIPE_SECRET_KEY
Value: sk_test_SEU_SECRET_KEY_AQUI

# Webhook Secret (você vai obter no PASSO 5)
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_SEU_WEBHOOK_SECRET_AQUI
```

4. Clique em **"Save"**

#### Via CLI (Alternativa):
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_SEU_SECRET_KEY_AQUI
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI
```

### 4.2 Deploy das Edge Functions

```bash
# Navegar até a pasta do projeto
cd /caminho/para/minha-floresta

# Deploy stripe-checkout
supabase functions deploy stripe-checkout

# Deploy stripe-webhook
supabase functions deploy stripe-webhook
```

**URLs das Functions (anote para o próximo passo):**
```
https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-checkout
https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-webhook
```

---

## PASSO 5: Configurar Webhook no Stripe

### 5.1 Criar Endpoint
1. No Stripe Dashboard, vá em: **Developers** → **Webhooks**
2. Clique em **"Add endpoint"**
3. Preencha:
   - **Endpoint URL:** `https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-webhook`
   - **Description:** Minha Floresta - Production Webhook
   - **Version:** Latest API version

### 5.2 Selecionar Eventos
Marque os seguintes eventos:

**Payment Intents:**
- [x] `payment_intent.succeeded`
- [x] `payment_intent.payment_failed`
- [x] `payment_intent.canceled`

**Charges:**
- [x] `charge.refunded`

**Subscriptions:** (para doações recorrentes)
- [x] `customer.subscription.created`
- [x] `customer.subscription.updated`
- [x] `customer.subscription.deleted`

**Invoices:** (para doações recorrentes)
- [x] `invoice.payment_succeeded`
- [x] `invoice.payment_failed`

### 5.3 Obter Webhook Secret
1. Após criar o endpoint, clique nele
2. Clique em **"Reveal"** no campo **"Signing secret"**
3. Copie o valor (começa com `whsec_...`)
4. **VOLTE AO PASSO 4.1** e adicione como `STRIPE_WEBHOOK_SECRET`

---

## PASSO 6: Configurar Frontend

### 6.1 Criar arquivo .env
1. Na raiz do projeto, copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Edite `.env` e adicione sua Publishable Key:
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_SEU_PUBLISHABLE_KEY_AQUI
```

### 6.2 Instalar Dependências
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## PASSO 7: Testar Integração

### 7.1 Testar Checkout
1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse: http://localhost:5173/loja
3. Adicione um projeto ao carrinho
4. Vá para o carrinho e preencha os dados
5. Use um cartão de teste do Stripe:

**Cartões de Teste:**
```
Sucesso: 4242 4242 4242 4242
Falha: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
Insuficiente: 4000 0000 0000 9995

Qualquer data futura (ex: 12/25)
Qualquer CVC de 3 dígitos (ex: 123)
```

### 7.2 Verificar Webhook
1. No Stripe Dashboard, vá em **Developers** → **Webhooks**
2. Clique no endpoint criado
3. Verifique a aba **"Events"** - deve aparecer eventos processados

### 7.3 Testar com Stripe CLI (Opcional)
```bash
# Instalar Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Escutar webhooks localmente
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger evento de teste
stripe trigger payment_intent.succeeded
```

---

## PASSO 8: Verificar no Supabase

### 8.1 Verificar Tabelas
Execute no SQL Editor:

```sql
-- Ver payment intents
SELECT * FROM stripe_payment_intents ORDER BY created_at DESC LIMIT 5;

-- Ver eventos processados
SELECT * FROM stripe_events ORDER BY created_at DESC LIMIT 10;

-- Ver compras com Stripe
SELECT 
  p.*,
  spi.stripe_payment_intent_id,
  spi.status as stripe_status
FROM purchases p
LEFT JOIN stripe_payment_intents spi ON spi.purchase_id = p.id
WHERE p.payment_method = 'stripe'
ORDER BY p.created_at DESC
LIMIT 10;
```

### 8.2 Verificar Logs das Functions
1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/functions
2. Clique em `stripe-checkout` ou `stripe-webhook`
3. Veja logs na aba **"Logs"**

---

## PASSO 9: Ir para Produção

### 9.1 Ativar Stripe Account
1. No Stripe Dashboard, complete o onboarding:
   - Dados bancários
   - Documentação da empresa
   - Termos de serviço

### 9.2 Trocar para Chaves Live
1. No Stripe Dashboard, **desative** o "Modo de Teste"
2. Vá em **Developers** → **API keys**
3. Copie as chaves **Live** (começam com `pk_live_` e `sk_live_`)
4. Atualize os secrets no Supabase:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_SEU_SECRET_KEY_AQUI
```
5. Atualize o `.env`:
```bash
VITE_STRIPE_PUBLIC_KEY=pk_live_SEU_PUBLISHABLE_KEY_AQUI
```

### 9.3 Atualizar Webhook
1. Crie novo endpoint de produção no Stripe
2. Use a mesma URL das Functions
3. Copie o novo Webhook Secret
4. Atualize no Supabase:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_LIVE_AQUI
```

---

## 📊 CHECKLIST FINAL

### Configuração Inicial
- [ ] Conta Stripe criada
- [ ] Chaves de API obtidas (pk_test_ e sk_test_)
- [ ] Migração 005 aplicada no Supabase
- [ ] Secrets configurados no Supabase
- [ ] Edge Functions deployed
- [ ] Webhook configurado no Stripe
- [ ] Frontend configurado (.env)
- [ ] Dependências instaladas

### Testes
- [ ] Checkout funciona (Payment Intent criado)
- [ ] Pagamento com cartão de teste funciona
- [ ] Webhook recebe eventos
- [ ] Certificados são gerados automaticamente
- [ ] Email de confirmação enviado (quando implementado)
- [ ] Status de compra atualiza corretamente

### Produção
- [ ] Stripe account ativado e verificado
- [ ] Chaves Live configuradas
- [ ] Webhook de produção criado
- [ ] Testes com cartão real realizados
- [ ] Monitoramento configurado

---

## 🆘 TROUBLESHOOTING

### Erro: "Stripe não está configurado"
**Causa:** VITE_STRIPE_PUBLIC_KEY não está definida  
**Solução:**
1. Verifique se `.env` existe na raiz
2. Verifique se a chave começa com `pk_test_` ou `pk_live_`
3. Reinicie o servidor de desenvolvimento

### Erro: "Webhook signature verification failed"
**Causa:** STRIPE_WEBHOOK_SECRET incorreto  
**Solução:**
1. Copie o Webhook Secret do Stripe Dashboard
2. Atualize no Supabase: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`
3. Aguarde 1-2 minutos para propagar

### Erro: "Payment Intent creation failed"
**Causa:** STRIPE_SECRET_KEY incorreta ou expirada  
**Solução:**
1. Verifique se a chave começa com `sk_test_` ou `sk_live_`
2. Regenere a chave no Stripe Dashboard se necessário
3. Atualize no Supabase

### Webhook não recebe eventos
**Possíveis causas:**
1. URL do endpoint incorreta → Verifique no Stripe Dashboard
2. Edge Function não deployada → `supabase functions deploy stripe-webhook`
3. Assinatura não configurada → Adicione STRIPE_WEBHOOK_SECRET

### Certificados não são gerados
**Causa:** Webhook não processou `payment_intent.succeeded`  
**Solução:**
1. Verifique logs da Edge Function `stripe-webhook`
2. Verifique tabela `stripe_events` - evento deve estar `processed: true`
3. Verifique tabela `certificates` - deve ter novos registros

---

## 📞 SUPORTE

### Stripe
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com

### Supabase
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions

---

**Status:** 📋 **AGUARDANDO CONFIGURAÇÃO**

Após completar todos os passos, o sistema Stripe estará 100% funcional! 🚀
