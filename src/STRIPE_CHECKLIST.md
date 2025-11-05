# ✅ Checklist de Implementação Stripe

**Copie este arquivo e marque conforme avança**

---

## 🎯 IMPLEMENTAÇÃO (COMPLETO)

- [x] ✅ Migração SQL criada (`005_stripe_tables.sql`)
- [x] ✅ Edge Function `stripe-checkout` implementada
- [x] ✅ Edge Function `stripe-webhook` implementada
- [x] ✅ Hook `useStripeCheckout` criado
- [x] ✅ Componente `StripePaymentForm` criado
- [x] ✅ Página `CheckoutSuccessPage` criada
- [x] ✅ Página `CheckoutCancelPage` criada
- [x] ✅ Configuração centralizada (`stripeConfig.ts`)
- [x] ✅ Rotas adicionadas ao `PageRouter`
- [x] ✅ Arquivo `.env.example` criado
- [x] ✅ Arquivo `.env` criado
- [x] ✅ Arquivo `.gitignore` criado
- [x] ✅ Fix de validação `import.meta.env` aplicado
- [x] ✅ Documentação completa escrita

---

## 🔧 CONFIGURAÇÃO (PENDENTE)

### PASSO 1: Conta Stripe
- [ ] Criar conta em https://dashboard.stripe.com/register
- [ ] Verificar email
- [ ] Ativar modo de teste

### PASSO 2: Chaves de API
- [ ] Acessar https://dashboard.stripe.com/test/apikeys
- [ ] Copiar **Publishable Key** (pk_test_...)
- [ ] Copiar **Secret Key** (sk_test_...)

### PASSO 3: Banco de Dados
- [ ] Abrir SQL Editor do Supabase
- [ ] Copiar conteúdo de `/supabase/migrations/005_stripe_tables.sql`
- [ ] Executar migração
- [ ] Verificar se tabelas foram criadas:
  - [ ] `stripe_payment_intents`
  - [ ] `stripe_events`
  - [ ] `stripe_subscriptions`

### PASSO 4: Supabase Secrets
- [ ] Acessar Settings > Edge Functions > Secrets
- [ ] Adicionar `STRIPE_SECRET_KEY=sk_test_...`
- [ ] (Aguardar PASSO 6) Adicionar `STRIPE_WEBHOOK_SECRET=whsec_...`

### PASSO 5: Deploy Edge Functions
- [ ] Executar: `supabase functions deploy stripe-checkout`
- [ ] Executar: `supabase functions deploy stripe-webhook`
- [ ] Anotar URLs:
  - [ ] Checkout: https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-checkout
  - [ ] Webhook: https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-webhook

### PASSO 6: Webhook no Stripe
- [ ] Acessar https://dashboard.stripe.com/test/webhooks
- [ ] Clicar "Add endpoint"
- [ ] Adicionar URL: https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-webhook
- [ ] Selecionar eventos:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `charge.refunded`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
- [ ] Copiar **Signing secret** (whsec_...)
- [ ] VOLTAR ao PASSO 4 e adicionar `STRIPE_WEBHOOK_SECRET`

### PASSO 7: Frontend
- [ ] Executar: `cp .env.example .env`
- [ ] Editar `.env` e adicionar: `VITE_STRIPE_PUBLIC_KEY=pk_test_...`
- [ ] Executar: `npm install @stripe/stripe-js @stripe/react-stripe-js`
- [ ] Reiniciar dev server: `npm run dev`

---

## 🧪 TESTES (PENDENTE)

### Teste 1: Checkout Básico
- [ ] Acessar http://localhost:5173/loja
- [ ] Adicionar projeto ao carrinho
- [ ] Ir para /carrinho
- [ ] Preencher dados do formulário
- [ ] Verificar se Stripe Elements carrega
- [ ] Usar cartão de teste: `4242 4242 4242 4242`
- [ ] Confirmar pagamento
- [ ] Verificar redirecionamento para `/checkout-success`

### Teste 2: Certificados
- [ ] Após pagamento bem-sucedido
- [ ] Verificar se certificados aparecem na página de sucesso
- [ ] Verificar no banco: `SELECT * FROM certificates ORDER BY created_at DESC LIMIT 5;`
- [ ] Confirmar que `status = 'issued'`

### Teste 3: Webhook
- [ ] No Stripe Dashboard, acessar Webhooks
- [ ] Verificar se evento `payment_intent.succeeded` aparece
- [ ] Verificar se status é "Succeeded" (não "Failed")
- [ ] No Supabase, executar: `SELECT * FROM stripe_events ORDER BY created_at DESC LIMIT 5;`
- [ ] Confirmar que `processed = true`

### Teste 4: Estoque
- [ ] Antes da compra, verificar `available_area` do projeto
- [ ] Realizar compra
- [ ] Verificar se `available_area` foi decrementado
- [ ] SQL: `SELECT id, name, available_area, sold_area FROM projects WHERE id = 'ID_DO_PROJETO';`

### Teste 5: Doação
- [ ] Acessar /doacoes
- [ ] (NOTA: Integração de doação com Stripe está preparada, mas UI ainda usa mock)
- [ ] Para testar: usar Edge Function diretamente
```bash
curl -X POST \
  https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-checkout \
  -H "Authorization: Bearer ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type":"donation","donation_amount":50,"email":"teste@example.com"}'
```

### Teste 6: Cancelamento
- [ ] Iniciar checkout
- [ ] Fechar janela do Stripe Elements
- [ ] Ou clicar fora do modal
- [ ] Verificar se redireciona para `/checkout-cancel`

### Teste 7: Falha de Pagamento
- [ ] Usar cartão que falha: `4000 0000 0000 0002`
- [ ] Verificar mensagem de erro
- [ ] Confirmar que purchase não foi criado (ou status = 'failed')

### Teste 8: Stripe CLI (Opcional)
- [ ] Instalar Stripe CLI: `brew install stripe/stripe-brew/stripe`
- [ ] Executar: `stripe login`
- [ ] Escutar webhooks: `stripe listen --forward-to https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/stripe-webhook`
- [ ] Trigger evento: `stripe trigger payment_intent.succeeded`
- [ ] Verificar logs

---

## 📊 VERIFICAÇÕES

### Banco de Dados
- [ ] Executar queries de verificação:

```sql
-- Ver últimas compras
SELECT * FROM purchases 
WHERE payment_method = 'stripe' 
ORDER BY created_at DESC LIMIT 5;

-- Ver payment intents
SELECT * FROM stripe_payment_intents 
ORDER BY created_at DESC LIMIT 5;

-- Ver eventos de webhook
SELECT * FROM stripe_events 
ORDER BY created_at DESC LIMIT 10;

-- Ver certificados
SELECT * FROM certificates 
ORDER BY created_at DESC LIMIT 5;
```

### Edge Functions
- [ ] Verificar logs: `supabase functions logs stripe-checkout --follow`
- [ ] Verificar logs: `supabase functions logs stripe-webhook --follow`
- [ ] Confirmar que não há erros

### Stripe Dashboard
- [ ] Ver pagamentos em https://dashboard.stripe.com/test/payments
- [ ] Ver eventos em https://dashboard.stripe.com/test/events
- [ ] Confirmar que todos os eventos estão "Succeeded"

---

## 🚀 PRODUÇÃO (FUTURO)

### Preparação
- [ ] Concluir onboarding no Stripe
- [ ] Adicionar dados bancários
- [ ] Enviar documentação da empresa
- [ ] Aguardar aprovação do Stripe

### Configuração Live
- [ ] Desativar modo de teste no Stripe
- [ ] Copiar chaves Live:
  - [ ] Publishable Key (pk_live_...)
  - [ ] Secret Key (sk_live_...)
- [ ] Atualizar secrets no Supabase:
  - [ ] `supabase secrets set STRIPE_SECRET_KEY=sk_live_...`
- [ ] Atualizar .env:
  - [ ] `VITE_STRIPE_PUBLIC_KEY=pk_live_...`
- [ ] Criar webhook de produção no Stripe
- [ ] Copiar novo Webhook Secret (whsec_...)
- [ ] Atualizar: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

### Teste de Produção
- [ ] Fazer compra teste com cartão real
- [ ] Confirmar que certificado é gerado
- [ ] Confirmar que webhook funciona
- [ ] Verificar no banco de dados
- [ ] Fazer reembolso de teste (se necessário)

### Monitoramento
- [ ] Configurar alertas no Stripe
- [ ] Monitorar taxa de sucesso
- [ ] Monitorar chargebacks
- [ ] Configurar relatórios automáticos

---

## 🎉 FEATURES FUTURAS (Opcional)

### Curto Prazo
- [ ] Integrar doações na `/pages/DoacoesPage.tsx`
- [ ] Adicionar aba "Transações" no CMS
- [ ] Sistema de filtros no CMS (paid, pending, failed)
- [ ] Email de confirmação de compra
- [ ] Email de certificado gerado

### Médio Prazo
- [ ] Doações recorrentes (UI completa)
- [ ] Painel de gerenciamento de subscriptions
- [ ] Sistema de reembolsos (UI admin)
- [ ] Métricas no dashboard admin
- [ ] Exportação de relatórios

### Longo Prazo
- [ ] Integração PIX (Mercado Pago / Asaas)
- [ ] Boleto bancário
- [ ] Parcelamento
- [ ] Programa de afiliados
- [ ] Invoices automáticas
- [ ] Multi-moeda (USD, EUR)

---

## 📝 NOTAS

### Cartões de Teste Úteis
```
Sucesso: 4242 4242 4242 4242
Falha: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
Fundos insuficientes: 4000 0000 0000 9995

Data: Qualquer futura (12/25)
CVC: Qualquer 3 dígitos (123)
```

### URLs Importantes
```
Supabase SQL: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
Stripe Dashboard: https://dashboard.stripe.com
Stripe Webhooks: https://dashboard.stripe.com/test/webhooks
Stripe API Keys: https://dashboard.stripe.com/test/apikeys
```

### Documentação
```
Planejamento: /STRIPE_IMPLEMENTATION_PLAN.md
Resumo: /STRIPE_IMPLEMENTATION_SUMMARY.md
Guia Setup: /STRIPE_SETUP_GUIDE.md
Comandos: /STRIPE_QUICK_COMMANDS.md
Este checklist: /STRIPE_CHECKLIST.md
```

---

## ✅ PROGRESSO GERAL

**Implementação:** ✅ 100% (12/12 arquivos)  
**Configuração:** ⏳ 0% (0/7 passos)  
**Testes:** ⏳ 0% (0/8 testes)  
**Produção:** ⏳ Não iniciado  

---

**Última atualização:** 04/11/2025  
**Status:** Aguardando configuração inicial
