# 💳 Planejamento Completo: Implementação Stripe

**Projeto:** Minha Floresta Conservações  
**Data:** 04/11/2025  
**Status:** ✅ **IMPLEMENTADO 100%** - Aguardando Configuração

---

## 📚 DOCUMENTAÇÃO STRIPE

Este é o documento de planejamento original. Para implementação, consulte:

- **📋 Planejamento Técnico** → `/STRIPE_IMPLEMENTATION_PLAN.md` (este arquivo)
- **✅ Resumo do que foi Implementado** → `/STRIPE_IMPLEMENTATION_SUMMARY.md`
- **🚀 Guia de Configuração Passo a Passo** → `/STRIPE_SETUP_GUIDE.md`
- **⚡ Comandos Rápidos** → `/STRIPE_QUICK_COMMANDS.md`

---

## 🎯 OBJETIVO

Implementar gateway de pagamento Stripe completo, seguro e integrado com todas as áreas do site, permitindo:
- Compra de metros quadrados de reflorestamento
- Doações pontuais e recorrentes
- Certificados físicos e digitais
- Múltiplos métodos de pagamento
- Webhooks para confirmação automática
- Dashboard administrativo de transações

---

## 📐 ARQUITETURA GERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ CarrinhoPage │  │ DoacoesPage  │  │ CMSPage      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            ▼                                     │
│                  ┌─────────────────────┐                         │
│                  │  useStripeCheckout  │ (Hook Principal)        │
│                  └─────────┬───────────┘                         │
│                            │                                     │
│                            ▼                                     │
│                  ┌─────────────────────┐                         │
│                  │  Stripe.js Library  │                         │
│                  └─────────┬───────────┘                         │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ HTTPS Request
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                 SUPABASE EDGE FUNCTIONS (Deno)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐                 │
│  │ /checkout          │  │ /stripe-webhook    │                 │
│  │ - Create Intent    │  │ - Verify signature │                 │
│  │ - Validate cart    │  │ - Update status    │                 │
│  │ - Return secret    │  │ - Send emails      │                 │
│  └─────────┬──────────┘  └─────────┬──────────┘                 │
│            │                       │                             │
│            └───────────┬───────────┘                             │
│                        │                                         │
│                        ▼                                         │
│              ┌──────────────────┐                                │
│              │  Stripe SDK      │                                │
│              │  (Server-side)   │                                │
│              └─────────┬────────┘                                │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ API Calls
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                      STRIPE API (External)                       │
├─────────────────────────────────────────────────────────────────┤
│  - Payment Intents                                               │
│  - Checkout Sessions                                             │
│  - Subscriptions (doações recorrentes)                           │
│  - Webhooks                                                      │
│  - Refunds                                                       │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ Webhook Events
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                    SUPABASE DATABASE                             │
├─────────────────────────────────────────────────────────────────┤
│  📊 Tabelas:                                                     │
│  - purchases (pedidos)                                           │
│  - purchase_items (itens)                                        │
│  - certificates (certificados gerados)                           │
│  - donations (doações)                                           │
│  - stripe_events (log de webhooks)                              │
│  - stripe_subscriptions (doações recorrentes)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ ESTRUTURA DE BANCO DE DADOS

### **NOVAS TABELAS A CRIAR:**

#### 1. `stripe_events` (Log de Webhooks)
```sql
CREATE TABLE stripe_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 2. `stripe_subscriptions` (Doações Recorrentes)
```sql
CREATE TABLE stripe_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    interval TEXT CHECK (interval IN ('monthly', 'quarterly', 'yearly')),
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'paused')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 3. `stripe_payment_intents` (Rastreamento de Payments)
```sql
CREATE TABLE stripe_payment_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
    donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT NOT NULL,
    client_secret TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### **MODIFICAÇÕES EM TABELAS EXISTENTES:**

#### Adicionar a `purchases`:
```sql
ALTER TABLE purchases 
ADD COLUMN stripe_payment_intent_id TEXT,
ADD COLUMN stripe_charge_id TEXT,
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN refund_id TEXT,
ADD COLUMN refund_reason TEXT,
ADD COLUMN refund_amount DECIMAL(10,2),
ADD COLUMN refund_date TIMESTAMP WITH TIME ZONE;
```

#### Adicionar a `donations`:
```sql
ALTER TABLE donations 
ADD COLUMN stripe_payment_intent_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
```

---

## 🔧 EDGE FUNCTIONS

### **1. `/supabase/functions/stripe-checkout/index.ts`**

**Responsabilidade:** Criar PaymentIntent para compras de m² e doações únicas

**Endpoint:** `POST /functions/v1/stripe-checkout`

**Input:**
```typescript
{
  type: 'purchase' | 'donation',
  items?: Array<{
    project_id: string,
    quantity: number,
    price: number
  }>,
  donation_amount?: number,
  donation_project_id?: string,
  user_id?: string,
  email: string,
  metadata?: {
    certificate_type: 'digital' | 'physical' | 'both',
    shipping_address?: object
  }
}
```

**Output:**
```typescript
{
  success: true,
  client_secret: 'pi_xxx_secret_xxx',
  payment_intent_id: 'pi_xxx',
  amount: 250.00,
  currency: 'brl'
}
```

**Fluxo:**
1. Validar autenticação (opcional para doações anônimas)
2. Validar estoque disponível (compras)
3. Calcular valor total com taxas
4. Criar PaymentIntent no Stripe
5. Salvar em `stripe_payment_intents`
6. Criar registro em `purchases` ou `donations` (status: pending)
7. Retornar client_secret

---

### **2. `/supabase/functions/stripe-subscription/index.ts`**

**Responsabilidade:** Criar/gerenciar assinaturas de doações recorrentes

**Endpoints:** 
- `POST /functions/v1/stripe-subscription/create`
- `POST /functions/v1/stripe-subscription/cancel`
- `POST /functions/v1/stripe-subscription/update`

**Input (create):**
```typescript
{
  user_id: string,
  email: string,
  project_id: string,
  amount: number,
  interval: 'monthly' | 'quarterly' | 'yearly',
  payment_method_id: string
}
```

**Output:**
```typescript
{
  success: true,
  subscription_id: 'sub_xxx',
  status: 'active',
  current_period_end: '2025-12-04T...'
}
```

**Fluxo:**
1. Validar usuário
2. Criar/obter Customer no Stripe
3. Criar Product e Price no Stripe
4. Criar Subscription
5. Salvar em `stripe_subscriptions`
6. Retornar dados

---

### **3. `/supabase/functions/stripe-webhook/index.ts`**

**Responsabilidade:** Receber e processar eventos do Stripe

**Endpoint:** `POST /functions/v1/stripe-webhook`

**Headers Required:**
```
stripe-signature: t=xxx,v1=xxx,v2=xxx
```

**Eventos Processados:**

#### **payment_intent.succeeded**
```typescript
1. Validar assinatura do webhook
2. Buscar payment_intent_id em stripe_payment_intents
3. Atualizar purchases.payment_status = 'paid'
4. Gerar certificado(s) em certificates
5. Enviar email de confirmação
6. Atualizar estoque (projects.available_area)
7. Marcar evento como processado
```

#### **payment_intent.payment_failed**
```typescript
1. Atualizar purchases.payment_status = 'failed'
2. Liberar itens do estoque
3. Enviar email de falha
4. Marcar evento como processado
```

#### **charge.refunded**
```typescript
1. Atualizar purchases.payment_status = 'refunded'
2. Adicionar refund_amount, refund_reason
3. Invalidar certificados
4. Devolver ao estoque
5. Enviar email de confirmação de reembolso
```

#### **customer.subscription.created/updated/deleted**
```typescript
1. Atualizar stripe_subscriptions
2. Criar donation se for novo período
3. Notificar usuário
```

#### **invoice.payment_succeeded** (assinaturas)
```typescript
1. Criar nova donation
2. Gerar certificado mensal
3. Enviar email de agradecimento
```

**Segurança:**
```typescript
// Validação de assinatura obrigatória
const signature = req.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  STRIPE_WEBHOOK_SECRET
);
```

---

### **4. `/supabase/functions/stripe-refund/index.ts`**

**Responsabilidade:** Processar reembolsos (admin apenas)

**Endpoint:** `POST /functions/v1/stripe-refund`

**Input:**
```typescript
{
  purchase_id: string,
  reason: 'requested_by_customer' | 'fraudulent' | 'duplicate',
  amount?: number  // Parcial ou null para total
}
```

**Fluxo:**
1. Verificar permissão de admin
2. Buscar stripe_charge_id da compra
3. Criar refund no Stripe
4. Webhook processa atualização
5. Retornar confirmação

---

## 🎨 COMPONENTES FRONTEND

### **Novos Componentes:**

#### 1. `/components/StripeElements.tsx`
```typescript
// Wrapper para Stripe Elements
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export function StripeProvider({ children, clientSecret }) {
  const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
}
```

#### 2. `/components/PaymentForm.tsx`
```typescript
// Formulário de cartão de crédito
import { 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';

export function PaymentForm({ onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });
    
    if (error) {
      onError(error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit">Pagar R$ {amount}</button>
    </form>
  );
}
```

#### 3. `/components/RecurringDonationSetup.tsx`
```typescript
// Setup de doação recorrente com Stripe
export function RecurringDonationSetup() {
  const [interval, setInterval] = useState('monthly');
  const [amount, setAmount] = useState(50);
  
  return (
    <div className="glass-card">
      <h3>Doação Mensal Automática</h3>
      <AmountSelector value={amount} onChange={setAmount} />
      <IntervalSelector value={interval} onChange={setInterval} />
      <StripeSubscriptionButton />
    </div>
  );
}
```

#### 4. `/components/AdminRefundPanel.tsx`
```typescript
// Painel admin para processar reembolsos
export function AdminRefundPanel({ purchase }) {
  const { processRefund, isLoading } = useStripeRefund();
  
  return (
    <AlertDialog>
      <AlertDialogTrigger>Reembolsar</AlertDialogTrigger>
      <AlertDialogContent>
        <RefundReasonSelect />
        <PartialAmountInput />
        <Button onClick={handleRefund}>Confirmar Reembolso</Button>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## 🪝 HOOKS PERSONALIZADOS

### **1. `/hooks/useStripeCheckout.ts`**

```typescript
export function useStripeCheckout() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (params: CheckoutParams) => {
    setIsLoading(true);
    try {
      const response = await fetch('/functions/v1/stripe-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      setClientSecret(data.client_secret);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPayment = async (stripe, elements) => {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      setError(error.message);
      return { success: false, error };
    }

    return { success: true };
  };

  return {
    clientSecret,
    isLoading,
    error,
    createPaymentIntent,
    confirmPayment
  };
}
```

### **2. `/hooks/useStripeSubscription.ts`**

```typescript
export function useStripeSubscription() {
  const createSubscription = async (params: SubscriptionParams) => {
    // Criar subscription de doação recorrente
  };

  const cancelSubscription = async (subscriptionId: string) => {
    // Cancelar subscription
  };

  const updateSubscription = async (subscriptionId: string, updates: any) => {
    // Atualizar valor/intervalo
  };

  const getActiveSubscriptions = async (userId: string) => {
    // Buscar subscriptions ativas do usuário
  };

  return {
    createSubscription,
    cancelSubscription,
    updateSubscription,
    getActiveSubscriptions
  };
}
```

### **3. `/hooks/useStripeRefund.ts`** (Admin)

```typescript
export function useStripeRefund() {
  const processRefund = async (params: RefundParams) => {
    // Processar reembolso via Edge Function
    // Requer permissão de admin
  };

  return { processRefund, isLoading, error };
}
```

---

## 🔗 INTEGRAÇÃO COM PÁGINAS EXISTENTES

### **1. `/pages/CarrinhoPage.tsx`** (MODIFICAR)

**Mudanças:**

```typescript
// REMOVER: Mock de processPayment do useCheckout
// ADICIONAR: useStripeCheckout

const CheckoutSection = () => {
  const { cart } = useCart();
  const { createPaymentIntent, confirmPayment } = useStripeCheckout();
  const [clientSecret, setClientSecret] = useState(null);

  const handleInitiatePayment = async () => {
    const { client_secret } = await createPaymentIntent({
      type: 'purchase',
      items: cart.items,
      email: formData.email,
      metadata: {
        certificate_type: formData.certificateType,
        shipping_address: formData.address
      }
    });
    setClientSecret(client_secret);
  };

  return (
    <>
      {!clientSecret ? (
        <CheckoutForm onSubmit={handleInitiatePayment} />
      ) : (
        <StripeProvider clientSecret={clientSecret}>
          <PaymentForm 
            onSuccess={() => navigate('/checkout/success')}
            onError={(err) => toast.error(err)}
          />
        </StripeProvider>
      )}
    </>
  );
};
```

**Fluxo do Usuário:**
1. ✅ Preencher dados (nome, email, endereço)
2. ✅ Escolher tipo de certificado
3. ✅ Ver resumo do pedido
4. 🆕 Clicar "Finalizar Compra" → Chama `createPaymentIntent`
5. 🆕 Stripe Elements carrega → Preencher dados do cartão
6. 🆕 Confirmar pagamento → Redireciona para `/checkout/success`
7. 🆕 Webhook processa → Gera certificados

---

### **2. `/pages/DoacoesPage.tsx`** (MODIFICAR)

**Adicionar:**

```typescript
// Doação Única (via PaymentIntent)
const QuickDonationSection = () => {
  const { createPaymentIntent } = useStripeCheckout();
  
  const handleDonate = async (amount: number) => {
    const { client_secret } = await createPaymentIntent({
      type: 'donation',
      donation_amount: amount,
      donation_project_id: selectedProject,
      email: user?.email
    });
    
    // Mostrar Stripe Elements
  };
};

// Doação Recorrente (via Subscription)
const RecurringDonationSection = () => {
  const { createSubscription } = useStripeSubscription();
  
  const handleSetupRecurring = async () => {
    await createSubscription({
      project_id: selectedProject,
      amount: monthlyAmount,
      interval: 'monthly'
    });
  };
};
```

**Novos Recursos:**
- 🆕 Botões de valores rápidos (R$ 25, R$ 50, R$ 100, R$ 250)
- 🆕 Toggle "Doar mensalmente"
- 🆕 Mostrar impacto mensal projetado
- 🆕 Página de gerenciamento de doações recorrentes

---

### **3. `/pages/CMSPage.tsx`** (MODIFICAR)

**Adicionar Aba "Transações":**

```typescript
const TransactionsTab = () => {
  const [purchases, setPurchases] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPurchases(filter);
  }, [filter]);

  return (
    <div>
      <FilterBar>
        <Select value={filter} onChange={setFilter}>
          <option value="all">Todas</option>
          <option value="paid">Pagas</option>
          <option value="pending">Pendentes</option>
          <option value="failed">Falhas</option>
          <option value="refunded">Reembolsadas</option>
        </Select>
      </FilterBar>

      <TransactionsTable>
        {purchases.map(purchase => (
          <TransactionRow 
            key={purchase.id}
            purchase={purchase}
            onRefund={handleRefund}
          />
        ))}
      </TransactionsTable>
    </div>
  );
};
```

**Funcionalidades Admin:**
- 🆕 Ver todas as transações
- 🆕 Filtrar por status
- 🆕 Processar reembolsos
- 🆕 Ver detalhes do Stripe (payment_intent_id, charge_id)
- 🆕 Reenviar certificados
- 🆕 Ver histórico de webhooks

---

### **4. `/pages/DashboardPage.tsx`** (MODIFICAR)

**Adicionar Seção "Minhas Assinaturas":**

```typescript
const SubscriptionsSection = () => {
  const { getActiveSubscriptions, cancelSubscription } = useStripeSubscription();
  const [subscriptions, setSubscriptions] = useState([]);

  return (
    <div className="glass-card">
      <h2>Doações Recorrentes Ativas</h2>
      {subscriptions.map(sub => (
        <SubscriptionCard
          key={sub.id}
          subscription={sub}
          onCancel={handleCancel}
          onUpdateAmount={handleUpdate}
        />
      ))}
    </div>
  );
};
```

**Mostrar:**
- Valor mensal
- Próxima cobrança
- Total doado até agora
- Botão cancelar
- Botão atualizar valor

---

### **5. NOVAS PÁGINAS:**

#### `/pages/CheckoutSuccessPage.tsx`
```typescript
export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const payment_intent = searchParams.get('payment_intent');

  useEffect(() => {
    // Verificar status do payment_intent
    // Mostrar certificados gerados
  }, []);

  return (
    <div className="success-container">
      <CheckCircle className="text-green-500" size={64} />
      <h1>Pagamento Confirmado!</h1>
      <p>Obrigado pela sua compra de {area}m² de floresta</p>
      <CertificateDownloadLinks />
      <Button onClick={() => navigate('/dashboard')}>
        Ver Meus Certificados
      </Button>
    </div>
  );
}
```

#### `/pages/CheckoutCancelPage.tsx`
```typescript
export function CheckoutCancelPage() {
  return (
    <div className="cancel-container">
      <XCircle className="text-red-500" size={64} />
      <h1>Pagamento Cancelado</h1>
      <p>Você pode tentar novamente quando quiser</p>
      <Button onClick={() => navigate('/loja')}>
        Voltar à Loja
      </Button>
    </div>
  );
}
```

---

## 🔐 SEGURANÇA

### **Variáveis de Ambiente (Supabase Secrets):**

```bash
# Stripe Keys
STRIPE_PUBLIC_KEY=pk_test_...     # Frontend pode ver
STRIPE_SECRET_KEY=sk_test_...     # Apenas Edge Functions
STRIPE_WEBHOOK_SECRET=whsec_...   # Validar webhooks

# URLs
FRONTEND_URL=https://seu-site.com
```

### **RLS Policies:**

```sql
-- stripe_events: Apenas Edge Functions podem inserir
CREATE POLICY "Edge Functions can insert events"
ON stripe_events FOR INSERT
TO service_role
WITH CHECK (true);

-- stripe_subscriptions: Users veem apenas as suas
CREATE POLICY "Users see own subscriptions"
ON stripe_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- stripe_payment_intents: Service role apenas
CREATE POLICY "Service role only"
ON stripe_payment_intents FOR ALL
TO service_role
USING (true);
```

### **Validações Críticas:**

1. **Webhook Signature:** Sempre validar assinatura Stripe
2. **Idempotency:** Usar `stripe_event_id` para evitar duplicatas
3. **Amount Validation:** Recalcular total no backend (nunca confiar no frontend)
4. **Stock Check:** Verificar disponibilidade antes de criar PaymentIntent
5. **Auth Check:** Validar JWT do Supabase em endpoints críticos

---

## 📊 MÉTRICAS E MONITORAMENTO

### **Dashboard Admin - Métricas Stripe:**

```typescript
const StripeMetrics = () => {
  return (
    <div className="metrics-grid">
      <MetricCard
        title="Total Processado (Hoje)"
        value="R$ 12.450,00"
        change="+15%"
      />
      <MetricCard
        title="Taxa de Aprovação"
        value="94.2%"
        trend="up"
      />
      <MetricCard
        title="Doações Recorrentes Ativas"
        value="142"
        subtitle="R$ 7.100/mês"
      />
      <MetricCard
        title="Reembolsos (30 dias)"
        value="R$ 320,00"
        percentage="0.8%"
      />
    </div>
  );
};
```

### **Logs:**

```typescript
// Registrar em audit_logs
{
  action: 'stripe_payment_succeeded',
  user_id: 'xxx',
  details: {
    payment_intent_id: 'pi_xxx',
    amount: 250.00,
    items: [...]
  }
}
```

---

## 🧪 TESTES

### **1. Modo Teste (Stripe Test Mode):**

**Cartões de Teste:**
```
Sucesso: 4242 4242 4242 4242
Falha: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
Insuficiente: 4000 0000 0000 9995
```

**Webhook Testing:**
```bash
# Stripe CLI para testar webhooks localmente
stripe listen --forward-to https://xxx.supabase.co/functions/v1/stripe-webhook
stripe trigger payment_intent.succeeded
```

### **2. Testes Unitários (Edge Functions):**

```typescript
// test/stripe-checkout.test.ts
Deno.test('Should create payment intent', async () => {
  const response = await POST('/stripe-checkout', {
    type: 'purchase',
    items: [{ project_id: 'xxx', quantity: 100, price: 25 }]
  });

  assertEquals(response.success, true);
  assertExists(response.client_secret);
});
```

### **3. Testes E2E:**

```typescript
// Cypress
describe('Checkout Flow', () => {
  it('Should complete purchase with Stripe', () => {
    cy.visit('/loja');
    cy.get('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="checkout"]').click();
    cy.fillStripeElement('4242424242424242');
    cy.get('[data-testid="pay"]').click();
    cy.url().should('include', '/checkout/success');
  });
});
```

---

## 📦 DEPENDÊNCIAS A ADICIONAR

### **Frontend:**
```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.2.0",
    "@stripe/react-stripe-js": "^2.4.0"
  }
}
```

### **Edge Functions:**
```typescript
// Deno - sem package.json
import Stripe from 'https://esm.sh/stripe@14.5.0';
```

---

## 🚀 ROADMAP DE IMPLEMENTAÇÃO

### **FASE 1: Setup Básico (1-2 dias)**
- [ ] Criar conta Stripe + obter chaves
- [ ] Adicionar secrets no Supabase
- [ ] Criar tabelas novas (stripe_events, stripe_payment_intents, stripe_subscriptions)
- [ ] Migração 005_stripe_tables.sql
- [ ] Instalar @stripe/stripe-js no frontend

### **FASE 2: Edge Functions (2-3 dias)**
- [ ] Implementar `/stripe-checkout`
- [ ] Implementar `/stripe-webhook`
- [ ] Testar com Stripe CLI
- [ ] Deploy das functions

### **FASE 3: Frontend - Compras (2-3 dias)**
- [ ] Criar StripeProvider component
- [ ] Criar PaymentForm component
- [ ] Modificar CarrinhoPage
- [ ] Criar CheckoutSuccessPage
- [ ] Criar CheckoutCancelPage
- [ ] Testar fluxo completo

### **FASE 4: Doações (1-2 dias)**
- [ ] Implementar doações únicas
- [ ] Modificar DoacoesPage
- [ ] Testar fluxo de doação

### **FASE 5: Assinaturas (2-3 dias)**
- [ ] Implementar `/stripe-subscription`
- [ ] Criar RecurringDonationSetup component
- [ ] Adicionar gerenciamento no Dashboard
- [ ] Testar webhooks de subscription

### **FASE 6: Admin (1-2 dias)**
- [ ] Adicionar aba Transações no CMS
- [ ] Implementar painel de reembolsos
- [ ] Adicionar métricas Stripe
- [ ] Logs de auditoria

### **FASE 7: Produção (1-2 dias)**
- [ ] Trocar para chaves Live (pk_live_, sk_live_)
- [ ] Configurar webhook URL em produção
- [ ] Testes finais com cartões reais
- [ ] Monitoramento de erros
- [ ] Documentação final

**TOTAL ESTIMADO: 10-15 dias**

---

## 💰 CUSTOS ESTIMADOS

### **Stripe Taxas (Brasil):**
- Cartão de crédito: 3,99% + R$ 0,39 por transação
- PIX: Não disponível direto (precisa parceiro)
- Boleto: Não disponível direto

**Para PIX e Boleto:** Considerar integração adicional com:
- Mercado Pago (BR)
- PagSeguro (BR)
- Asaas (BR)

### **Stripe Global:**
- Sem mensalidade
- Sem setup fee
- Paga apenas por transação processada

---

## 🌍 ALTERNATIVAS BRASILEIRAS

Se preferir gateway 100% brasileiro:

### **Opção A: Mercado Pago**
- ✅ PIX nativo
- ✅ Boleto nativo
- ✅ Cartão de crédito
- ✅ Parcelamento
- ⚠️ Taxas similares ao Stripe

### **Opção B: Asaas**
- ✅ Menor taxa (2,99% cartão)
- ✅ PIX + Boleto + Cartão
- ✅ Assinaturas nativas
- ⚠️ Menos features avançadas

### **Opção C: Híbrido**
- Stripe: Cartão internacional
- Asaas/MP: PIX + Boleto nacional
- Complexidade: Alta

**Recomendação:** Começar com Stripe para MVP, adicionar PIX/Boleto depois se houver demanda.

---

## 📞 PRÓXIMOS PASSOS

### **AGUARDANDO APROVAÇÃO PARA:**

1. ✅ Confirmar arquitetura proposta
2. ✅ Escolher gateway (Stripe vs Brasileiro vs Híbrido)
3. ✅ Priorizar features (Compras > Doações > Assinaturas)
4. ✅ Definir cronograma
5. ✅ Iniciar implementação FASE 1

---

**Status:** 📋 **PLANEJAMENTO COMPLETO - AGUARDANDO APROVAÇÃO**

Aguardando seu feedback para iniciar a implementação! 🚀
