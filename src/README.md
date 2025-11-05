# 🌳 Minha Floresta Conservações

Sistema completo de venda de metros quadrados de projetos de reflorestamento com design glassmorphism, integração com Supabase, pagamentos via Stripe e painel administrativo completo.

## 🚀 Como Executar

### Início Rápido (Frontend + Supabase)

```bash
# Instalar dependências
npm install

# Iniciar aplicação
npm run dev
```

Acesse: `http://localhost:5173`

### Configuração Completa

#### 1. Backend Supabase

O sistema usa **Supabase** como backend principal:

```bash
# Verificar conexão com Supabase
npm run test:supabase

# Aplicar migrações (se necessário)
cd supabase
supabase db push
```

#### 2. Configurar Stripe (Pagamentos)

**Opção A: Via Interface Admin (RECOMENDADO)** ⭐
1. Acesse `/cms` (painel administrativo)
2. Faça login como admin
3. Clique na aba **"Stripe"** (ícone de cartão)
4. Cole suas chaves do [Stripe Dashboard](https://dashboard.stripe.com)
5. Teste e salve

**Opção B: Via Arquivo .env**
```bash
# Criar arquivo .env na raiz
VITE_STRIPE_PUBLIC_KEY=pk_test_seu_publishable_key_aqui
```

📖 **Documentação:** Ver `STRIPE_ADMIN_SETUP.md` para instruções completas

#### 3. Edge Functions (Opcional - Para Pagamentos)

```bash
# Deploy das Edge Functions do Stripe
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook

# Configurar secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🔧 Status de Conexão

O sistema funciona em **modo adaptativo**:

### ✅ **Online com Supabase**
- **Verde**: "Conectado ao Supabase"
- Dados salvos no PostgreSQL (Supabase)
- Autenticação segura
- Sincronização em tempo real
- Edge Functions ativas

### 🟡 **Cache Local** 
- **Amarelo**: "Modo Cache"
- Dados carregados do localStorage
- Funcionalidade mantida
- Sincronização automática quando reconectar

## 🗄️ Banco de Dados - Supabase (PostgreSQL)

**Configuração:**
- Provider: Supabase
- Database: PostgreSQL 15
- Project ID: `ngnybwsovjignsflrhyr`
- URL: `https://ngnybwsovjignsflrhyr.supabase.co`

**Tabelas Criadas:**
- `users` - Usuários do sistema
- `projects` - Projetos de reflorestamento
- `social_projects` - Projetos sociais/educacionais
- `transactions` - Transações de compra
- `certificates` - Certificados emitidos (físicos e digitais)
- `donations` - Doações recebidas
- `cart_items` - Itens do carrinho
- `app_settings` - Configurações do sistema
- `stripe_payments` - Pagamentos via Stripe
- `stripe_webhooks` - Eventos do Stripe
- `mrv_verifications` - Verificações MRV (Monitoramento, Relato e Verificação)
- E mais...

**Segurança:**
- Row Level Security (RLS) habilitado
- Políticas de acesso por usuário
- API Keys protegidas
- Webhooks com validação de assinatura

## 🎯 Funcionalidades

### 🎨 Frontend (Glassmorphism UI)
- ✅ Homepage com hero animado
- ✅ Catálogo de projetos com filtros avançados
- ✅ Carrinho de compras com cálculo automático
- ✅ Calculadora de pegada de carbono
- ✅ Sistema de doações
- ✅ Emissão de certificados (físicos e digitais)
- ✅ Verificação de certificados com QR Code
- ✅ Dashboard do usuário
- ✅ **Painel Administrativo (CMS) Completo** 🆕
- ✅ Autenticação segura (Supabase Auth)
- ✅ **Integração com Stripe para pagamentos** 🆕

### 🛠️ Painel Administrativo (CMS)

Acesse: `/cms` (requer login de administrador)

**8 Abas de Gestão:**

1. **📊 Dashboard** - Visão geral e métricas
   - KPIs em tempo real
   - Gráficos de vendas
   - Estatísticas de projetos

2. **🌲 Projetos** - Gestão de reflorestamento
   - CRUD completo de projetos
   - Upload de imagens
   - Controle de estoque (m² disponíveis)
   - Status (ativo/inativo)

3. **❤️ Social** - Projetos sociais
   - Iniciativas educacionais
   - Parcerias comunitárias
   - Gestão de beneficiários

4. **🏆 Certificados** - Emissão e gestão
   - Certificados físicos
   - Certificados digitais
   - QR Codes
   - Sistema MRV integrado

5. **🛒 Vendas** - Transações
   - Histórico de vendas
   - Filtros avançados
   - Exportação de relatórios
   - Status de pagamentos

6. **📈 Analytics** - Análises detalhadas
   - Métricas de conversão
   - Análise de produtos
   - Comportamento de usuários
   - Relatórios customizados

7. **💳 Stripe** - Configuração de pagamentos 🆕
   - Configurar chaves de API
   - Testar conexão
   - Status em tempo real
   - Sem necessidade de editar código!

8. **⚙️ Config** - Configurações gerais
   - Configurações do sistema
   - Notificações
   - Integrações

### 💳 Sistema de Pagamentos Stripe

**Recursos:**
- ✅ Checkout seguro com Stripe
- ✅ Pagamento via cartão de crédito
- ✅ Webhooks para confirmação automática
- ✅ Emissão automática de certificados após pagamento
- ✅ Suporte para teste e produção
- ✅ Configuração via painel admin (sem código!)

**Configuração:**
1. Obtenha chaves no [Stripe Dashboard](https://dashboard.stripe.com)
2. Acesse `/cms` → Aba "Stripe"
3. Cole as chaves e teste
4. Pronto! Sistema configurado

**Cartões de Teste:**
```
Número: 4242 4242 4242 4242
Validade: Qualquer data futura
CVV: Qualquer 3 dígitos
```

### 🔐 Backend (Supabase)

- ✅ **Edge Functions** para lógica serverless
  - `stripe-checkout` - Criar sessões de pagamento
  - `stripe-webhook` - Processar eventos do Stripe
  - `minha-floresta-api` - API principal

- ✅ **Database PostgreSQL**
  - 15+ tabelas estruturadas
  - Triggers automáticos
  - Functions SQL
  - Full-text search

- ✅ **Autenticação Supabase**
  - Email/senha
  - Magic links
  - OAuth (Google, GitHub)
  - JWT tokens

- ✅ **Storage**
  - Upload de imagens
  - Certificados PDF
  - Documentos do projeto

- ✅ **Real-time**
  - Atualizações em tempo real
  - Subscriptions
  - Broadcast

## 📱 Páginas Implementadas

1. **Home** (`/`) - Hero e apresentação
2. **Como Funciona** (`/como-funciona`) - Explicação do processo
3. **Sobre o Projeto** (`/sobre-projeto`) - Informações detalhadas
4. **Loja/Catálogo** (`/loja`) - Projetos disponíveis para compra
5. **Calculadora de Pegada** (`/calculadora-pegada`) - Cálculo de CO2
6. **Carrinho & Checkout** (`/carrinho`) - Sistema de compras com Stripe
7. **Doações** (`/doacoes`) - Projetos sociais para doação
8. **Verificar Certificado** (`/verificar-certificado`) - Validação com QR Code
9. **Dashboard** (`/dashboard`) - Painel do usuário
10. **CMS Administrativo** (`/cms`) - Gestão completa (8 abas)
11. **Contato** (`/contato`) - Formulário de contato
12. **Carbono Azul** (`/carbono-azul`) - Projetos oceânicos
13. **Projetos Sociais** (`/projetos-sociais`) - Impacto social
14. **Checkout Success** (`/checkout/success`) - Confirmação de compra
15. **Checkout Cancel** (`/checkout/cancel`) - Cancelamento

## 💡 Indicadores Visuais

No canto inferior direito você verá:

- 🟢 **"Conectado ao Supabase"** = Sistema funcionando normalmente
- 🟡 **"Modo Cache"** = Usando dados locais temporariamente
- 🔴 **"Offline"** = Sem conexão com internet

## 🧪 Credenciais de Teste

**Usuário Padrão:**
- Email: `teste@minhaflorestaconservacoes.com`
- Senha: `123456`

**Administrador:**
- Email: `admin@minhaflorestaconservacoes.com`
- Senha: `admin123`

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Tokens JWT com expiração
- ✅ Row Level Security (RLS) no Supabase
- ✅ Validação de entrada em todas APIs
- ✅ CORS configurado adequadamente
- ✅ API Keys nunca expostas no frontend
- ✅ Webhook secrets para validar eventos do Stripe
- ✅ HTTPS em produção

## 📊 Tecnologias

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS 4.0** (com @theme)
- **Vite** (build tool)
- **Lucide React** (ícones)
- **Recharts** (gráficos)
- **Motion** (animações, antes Framer Motion)
- **ShadCN/UI** (componentes)
- **React Router** (navegação)
- **Sonner** (notificações toast)

### Backend
- **Supabase** (BaaS completo)
  - PostgreSQL 15
  - Edge Functions (Deno)
  - Authentication
  - Storage
  - Real-time

### Pagamentos
- **Stripe** (processamento de pagamentos)
  - Checkout Session
  - Webhooks
  - Payment Intents
  - Metadata customizada

### Desenvolvimento
- **ESLint** + **Prettier**
- **TypeScript strict mode**
- **Git** (controle de versão)

## 🎨 Design

Interface em **glassmorphism** com:
- ✅ Transparências elegantes (`bg-white/10`)
- ✅ Blur effects (`backdrop-blur-md`)
- ✅ Cores suaves (verde #10b981, azul #3b82f6, branco translúcido)
- ✅ Animações fluidas com Motion
- ✅ Responsivo para mobile, tablet e desktop
- ✅ Dark mode suave
- ✅ Acessibilidade (ARIA labels)

## 📁 Estrutura de Arquivos

```
minha-floresta/
├── components/          # Componentes React
│   ├── ui/             # Componentes ShadCN
│   ├── CMSStripeConfig.tsx  # Config Stripe (NOVO)
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── CMSPage.tsx     # Painel admin com 8 abas
│   ├── CarrinhoPage.tsx
│   └── ...
├── hooks/              # Custom hooks
│   ├── useStripeCheckout.ts  # Hook do Stripe
│   └── ...
├── utils/              # Utilitários
│   ├── stripeConfigApi.ts  # API config Stripe (NOVO)
│   └── database.ts     # API Supabase
├── contexts/           # React contexts
├── services/           # Serviços
├── supabase/          # Configuração Supabase
│   ├── functions/     # Edge Functions
│   │   ├── stripe-checkout/
│   │   └── stripe-webhook/
│   └── migrations/    # SQL migrations
├── styles/            # CSS global
└── types/             # TypeScript types
```

## 📖 Documentação Adicional

### Documentação Stripe
- 📄 `STRIPE_ADMIN_SETUP.md` - **Como configurar Stripe pelo painel**
- 📄 `STRIPE_FRONTEND_CONFIG_COMPLETE.md` - Status da implementação
- 📄 `STRIPE_SETUP_GUIDE.md` - Setup técnico completo
- 📄 `STRIPE_IMPLEMENTATION_SUMMARY.md` - Resumo técnico
- 📄 `STRIPE_QUICK_COMMANDS.md` - Comandos rápidos
- 📄 `STRIPE_CHECKLIST.md` - Checklist de configuração
- 📄 `STRIPE_INDEX_UPDATED.md` - Índice de toda documentação

### Documentação Geral
- 📄 `BACKEND_ARCHITECTURE_COMPLETE.md` - Arquitetura completa
- 📄 `DATABASE_STATUS.md` - Status do banco de dados
- 📄 `SUPABASE_CONNECTION_STATUS.md` - Conexão Supabase
- 📄 `START_HERE.md` - Guia de início

## 🏃‍♂️ Comandos Úteis

### Desenvolvimento
```bash
npm run dev              # Iniciar dev server
npm run build            # Build para produção
npm run preview          # Preview da build
npm run lint             # Rodar ESLint
```

### Supabase
```bash
supabase status          # Ver status do projeto
supabase db push         # Aplicar migrations
supabase functions deploy # Deploy de Edge Functions
supabase secrets list    # Ver secrets configurados
```

### Stripe
```bash
stripe listen            # Escutar webhooks localmente
stripe logs tail         # Ver logs em tempo real
```

## 🚀 Deploy

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy a pasta dist/
```

### Edge Functions (Supabase)
```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

### Configuração de Produção
1. Configure `VITE_STRIPE_PUBLIC_KEY` nas variáveis de ambiente
2. Configure secrets do Stripe no Supabase
3. Ative modo produção no Stripe Dashboard
4. Configure webhook de produção

## 🆘 Troubleshooting

### Erro: "Supabase connection failed"
```bash
# Verificar se as variáveis de ambiente estão corretas
cat .env

# Testar conexão
npm run test:supabase
```

### Erro: "Stripe is not defined"
**Solução:** Configure via `/cms` → Aba "Stripe" ou adicione `VITE_STRIPE_PUBLIC_KEY` no `.env`

### Erro: "Webhook signature verification failed"
**Solução:** Verifique se o `STRIPE_WEBHOOK_SECRET` está correto nos secrets do Supabase

### Migração não aplicada
```bash
cd supabase
supabase db push
```

## 🌟 Novidades (05/11/2025)

### ✨ Interface de Configuração do Stripe
- ✅ Painel admin com aba dedicada ao Stripe
- ✅ Configuração visual sem editar código
- ✅ Validação automática de chaves
- ✅ Teste de conexão integrado
- ✅ Persistência no Supabase

**Como usar:** Acesse `/cms` → Aba "Stripe"

### ✨ Sistema MRV Integrado
- ✅ Monitoramento de projetos
- ✅ Relato de impacto
- ✅ Verificação independente

## 📞 Suporte

**Documentação Externa:**
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- React: https://react.dev
- Tailwind: https://tailwindcss.com

**Dashboards:**
- Supabase: https://supabase.com/dashboard
- Stripe: https://dashboard.stripe.com

---

## 🎉 Início Rápido (TL;DR)

```bash
# 1. Instalar
npm install

# 2. Rodar
npm run dev

# 3. Acessar
http://localhost:5173

# 4. Configurar Stripe (opcional)
# Vá para /cms → Aba "Stripe" → Cole as chaves
```

**O sistema funciona perfeitamente desde o primeiro `npm run dev`! 🚀**

---

**Desenvolvido com 🌱 para um futuro mais verde**

_Versão: 2.0 - Com Supabase e Stripe integrados_  
_Última atualização: 05/11/2025_
