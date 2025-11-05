# 🎯 Configuração do Stripe pelo Painel Admin

**Status:** ✅ Implementado e Pronto para Uso  
**Data:** 05/11/2025  
**Versão:** 1.0

---

## 📋 O QUE FOI CRIADO

### ✅ Nova Aba "Stripe" no CMS Admin

Foi adicionada uma aba dedicada **"Stripe"** no painel administrativo (`/cms`) com interface completa para configuração das chaves de API do Stripe.

### 📁 Arquivos Criados/Modificados

1. **`/components/CMSStripeConfig.tsx`** ✨ NOVO
   - Interface completa de configuração do Stripe
   - Formulários para Publishable Key, Secret Key e Webhook Secret
   - Validação automática de formato das chaves
   - Teste de conexão integrado
   - Status visual do estado da configuração

2. **`/utils/stripeConfigApi.ts`** ✨ NOVO
   - API para carregar/salvar configurações no Supabase
   - Funções de teste de conexão
   - Validação de chaves
   - Integração com tabela `app_settings`

3. **`/pages/CMSPage.tsx`** 🔄 MODIFICADO
   - Adicionada aba "Stripe" (8ª aba)
   - Importação do componente CMSStripeConfig
   - Ícone CreditCard adicionado

---

## 🚀 COMO USAR

### Passo 1: Acessar o Painel Admin

1. Faça login no sistema
2. Navegue até `/cms` ou clique em "Admin" no menu
3. Clique na aba **"Stripe"** (ícone de cartão de crédito)

### Passo 2: Obter as Chaves do Stripe

#### 2.1 Criar/Acessar Conta Stripe

1. Acesse: https://dashboard.stripe.com/register
2. Crie uma conta ou faça login
3. Vá para **Developers** → **API keys**

#### 2.2 Copiar as Chaves de Teste

Para **desenvolvimento/teste**, use as chaves que começam com `test`:

```
Publishable Key: pk_test_51AbCdEf...
Secret Key: sk_test_51AbCdEf...
```

⚠️ **IMPORTANTE:** Nunca use chaves de produção (`live`) durante testes!

### Passo 3: Configurar no Painel

#### 3.1 Publishable Key

1. Cole a chave no campo **"Publishable Key"**
2. O sistema valida automaticamente se começa com `pk_`
3. ✅ Aparecerá "Formato válido" se estiver correto

#### 3.2 Secret Key

1. Cole a chave no campo **"Secret Key"**
2. Use o ícone de olho 👁️ para mostrar/ocultar
3. O sistema valida se começa com `sk_`
4. ⚠️ Esta chave é sensível - nunca compartilhe!

#### 3.3 Webhook Secret (Opcional)

1. No Stripe Dashboard: **Developers** → **Webhooks**
2. Clique em **"Add endpoint"**
3. URL do webhook: `https://[seu-projeto].supabase.co/functions/v1/stripe-webhook`
4. Selecione os eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copie o **Signing secret** (whsec_...)
6. Cole no campo **"Webhook Secret"**

### Passo 4: Testar e Salvar

#### 4.1 Testar Conexão

1. Clique em **"Testar Conexão"**
2. O sistema valida:
   - Formato das chaves
   - Consistência (test/live)
   - Conexão básica
3. ✅ Status mudará para "Stripe Configurado e Testado"

#### 4.2 Salvar Configurações

1. Clique em **"Salvar Configurações"**
2. As chaves são salvas:
   - **Supabase** (tabela `app_settings`) - Persistente
   - **localStorage** - Backup local
3. ✅ Toast de confirmação aparecerá

---

## 📊 INDICADORES VISUAIS

### Status da Configuração

#### 🔴 Não Configurado
- Ícone: ❌ (cinza)
- Mensagem: "Stripe Não Configurado"
- Ação: Configure as chaves

#### 🟡 Configurado (Teste Pendente)
- Ícone: ⚠️ (amarelo)
- Mensagem: "Stripe Configurado (Teste Pendente)"
- Ação: Teste a conexão

#### 🟢 Configurado e Testado
- Ícone: ✅ (verde)
- Mensagem: "Stripe Configurado e Testado"
- Badge: "Modo Teste" ou "Modo Produção"

### Validação de Chaves

Cada campo mostra validação em tempo real:

```
✅ Formato válido
❌ Deve começar com "pk_"
❌ Deve começar com "sk_"
❌ Deve começar com "whsec_"
```

---

## 🔒 SEGURANÇA

### Onde as Chaves São Armazenadas?

#### 1. Supabase (app_settings)
```sql
-- Tabela: app_settings
-- Categoria: stripe
-- is_public: false (não expostas via API pública)

Keys armazenadas:
- stripe_publishable_key
- stripe_secret_key
- stripe_webhook_secret
- stripe_is_configured
- stripe_last_tested
- stripe_test_status
```

#### 2. localStorage (Backup)
```javascript
// Chave: minha_floresta_stripe_config
// Uso: Fallback se Supabase indisponível
// Persistência: Browser local
```

### ⚠️ AVISOS DE SEGURANÇA

1. **Secret Key** nunca deve ser exposta no frontend
   - Apenas armazenada de forma segura
   - Usada apenas nas Edge Functions do Supabase

2. **Webhook Secret** valida eventos do Stripe
   - Previne ataques de replay
   - Essencial para produção

3. **Chaves de Teste vs Produção**
   - Teste: `pk_test_...` / `sk_test_...`
   - Produção: `pk_live_...` / `sk_live_...`
   - Nunca misture!

---

## 🛠️ FUNCIONALIDADES

### 1. Salvar Configurações
- Persiste no Supabase
- Backup no localStorage
- Validação de formato
- Toast de confirmação

### 2. Testar Conexão
- Valida formato das chaves
- Verifica consistência test/live
- Atualiza status visual
- Salva resultado do teste

### 3. Limpar Configurações
- Remove do Supabase
- Remove do localStorage
- Confirmação antes de limpar
- Reset completo

### 4. Visualização de Chaves
- Secret Key oculta por padrão
- Toggle de visibilidade
- Webhook Secret oculto
- Segurança visual

---

## 📖 PRÓXIMOS PASSOS

### Após Configurar no Admin

#### 1. Configurar Edge Functions

```bash
# Adicionar secrets no Supabase
supabase secrets set STRIPE_SECRET_KEY=sk_test_SEU_SECRET_KEY_AQUI
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI

# Deploy das Edge Functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

#### 2. Testar Pagamento

1. Acesse `/loja`
2. Adicione um projeto ao carrinho
3. Vá para `/carrinho`
4. Use cartão de teste: `4242 4242 4242 4242`
5. Complete o checkout

#### 3. Verificar Webhook

1. No Stripe Dashboard: **Developers** → **Webhooks**
2. Veja eventos processados
3. Verifique logs no Supabase

---

## 🐛 TROUBLESHOOTING

### Problema: "Erro ao salvar configurações"

**Causa:** Tabela `app_settings` não existe ou sem permissões

**Solução:**
```bash
# Execute a migração inicial
cd supabase
supabase db push
```

### Problema: "Teste de conexão falhou"

**Causas possíveis:**
1. Chaves inválidas → Copie novamente do Stripe
2. Chaves inconsistentes → Use test/test ou live/live
3. Formato incorreto → Verifique pk_/sk_

### Problema: "Configurações não persistem"

**Causa:** Supabase não conectado

**Solução:** Sistema usa localStorage como fallback automático

### Problema: Badge mostra "Modo Teste" em produção

**Causa:** Usando chaves `test` em produção

**Solução:** Troque para chaves `live` quando for ao ar

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- **Setup Completo:** `/STRIPE_SETUP_GUIDE.md`
- **Implementação:** `/STRIPE_IMPLEMENTATION_SUMMARY.md`
- **Edge Functions:** `/supabase/functions/stripe-*/`
- **Checklist:** `/STRIPE_CHECKLIST.md`

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### Configuração Inicial
- [ ] Acessar aba "Stripe" no CMS
- [ ] Obter chaves de teste do Stripe Dashboard
- [ ] Inserir Publishable Key
- [ ] Inserir Secret Key
- [ ] Inserir Webhook Secret (opcional)
- [ ] Testar conexão
- [ ] Salvar configurações

### Validação
- [ ] Status mostra "Configurado e Testado"
- [ ] Badge indica "Modo Teste"
- [ ] Último teste mostra data/hora atual
- [ ] Configurações persistem após reload

### Deploy
- [ ] Configurar secrets no Supabase
- [ ] Deploy das Edge Functions
- [ ] Configurar webhook no Stripe
- [ ] Testar checkout completo

---

## 🎨 INTERFACE DO COMPONENTE

### Seções

1. **Header**
   - Título: "Configuração do Stripe"
   - Botões: Limpar, Testar, Salvar

2. **Status Card**
   - Ícone de status (verde/amarelo/cinza)
   - Mensagem de estado
   - Último teste
   - Badge modo (Teste/Produção)

3. **Alerta de Documentação**
   - Link para Stripe Dashboard
   - Instruções rápidas

4. **Cards de Configuração**
   - Publishable Key (com validação)
   - Secret Key (com toggle visibilidade)
   - Webhook Secret (com toggle visibilidade)

5. **Instruções de Deploy**
   - 3 passos numerados
   - Comandos prontos para copiar
   - Link para documentação completa

### Design Glassmorphism

- ✅ Background: `bg-white/10 backdrop-blur-md`
- ✅ Borders: `border-white/20`
- ✅ Cores suaves: verde, azul, branco translúcido
- ✅ Consistente com o resto do sistema

---

## 📞 SUPORTE

### Recursos

- **Stripe Docs:** https://stripe.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Dashboard Stripe:** https://dashboard.stripe.com

### Status

✅ **FUNCIONALIDADE 100% IMPLEMENTADA**

Tudo pronto para usar! Basta acessar o painel admin e configurar as chaves do Stripe.

---

**Última Atualização:** 05/11/2025  
**Versão do Sistema:** Minha Floresta Conservações v1.0  
**Stripe Integration:** Complete
