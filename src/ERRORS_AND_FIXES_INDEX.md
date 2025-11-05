# 🔍 Índice de Erros e Correções

**Guia rápido para encontrar solução para qualquer erro**

---

## 🚨 ERROS ATIVOS AGORA

### ❌ "column projects.status does not exist"

**Código:** 42703  
**Gravidade:** 🔴 ALTA - Bloqueia uso da loja  
**Tempo de correção:** 5 minutos  

**Soluções:**
- 📖 Guia completo: `/FIX_PROJECTS_STATUS_ERROR.md`
- ⚡ Quick fix: `/QUICK_FIX_STATUS_ERROR.md`
- 📋 Checklist: `/ACOES_MANUAIS_NECESSARIAS.md` (item 4)

**Como corrigir:**
1. Abrir SQL Editor do Supabase
2. Executar migração `004_fix_projects_table.sql`
3. Reiniciar aplicação

---

## ✅ ERROS JÁ CORRIGIDOS

### ✅ TypeError: Cannot read properties of undefined (reading 'VITE_STRIPE_PUBLIC_KEY')

**Status:** CORRIGIDO AUTOMATICAMENTE  
**Data:** 04/11/2025  

**O que foi feito:**
- Arquivo: `/utils/supabase/stripeConfig.ts`
- Adicionada validação segura de `import.meta.env`
- Criado arquivo `.env` com variáveis
- Criado `.gitignore` para proteção

**Documentação:** `/STRIPE_ENV_FIX.md`

---

## 📚 DOCUMENTAÇÃO POR TIPO DE ERRO

### 🗄️ Erros de Banco de Dados

| Erro | Solução | Documento |
|------|---------|-----------|
| column X does not exist | Executar migração correspondente | `/FIX_PROJECTS_STATUS_ERROR.md` |
| table X does not exist | Executar migração 001 | `/QUICK_START_DATABASE.md` |
| permission denied | Configurar RLS ou usar service_role | `/ACOES_MANUAIS_NECESSARIAS.md` |

---

### 💳 Erros do Stripe

| Erro | Solução | Documento |
|------|---------|-----------|
| Stripe não configurado | Configurar VITE_STRIPE_PUBLIC_KEY | `/STRIPE_ENV_FIX.md` |
| Invalid API key | Verificar chave no .env | `/STRIPE_SETUP_GUIDE.md` |
| Webhook signature failed | Configurar STRIPE_WEBHOOK_SECRET | `/STRIPE_SETUP_GUIDE.md` |
| Payment failed | Usar cartão de teste correto | `/STRIPE_QUICK_COMMANDS.md` |

---

### 🔌 Erros de Conexão

| Erro | Solução | Documento |
|------|---------|-----------|
| 403 Forbidden | Limpar edge functions antigas | `/ACOES_MANUAIS_NECESSARIAS.md` |
| Network error | Verificar URL do Supabase | `/SUPABASE_RECONNECTION_COMPLETE.md` |
| CORS error | Configurar headers nas functions | `/supabase/functions/_shared/cors.ts` |

---

### ⚙️ Erros de Ambiente

| Erro | Solução | Documento |
|------|---------|-----------|
| import.meta.env undefined | Já corrigido | `/STRIPE_ENV_FIX.md` |
| .env not found | Copiar .env.example para .env | `/STRIPE_ENV_FIX.md` |
| Dependencies missing | npm install | `/START_HERE.md` |

---

## 🎯 GUIAS DE INÍCIO RÁPIDO

### Para Começar:
1. **`/START_HERE.md`** - Início absoluto (10 min)
2. **`/QUICK_FIX_STATUS_ERROR.md`** - Corrigir erro urgente (2 min)
3. **`/ACOES_MANUAIS_NECESSARIAS.md`** - Checklist completo

### Para Configurar:
1. **`/QUICK_START_DATABASE.md`** - Setup do banco
2. **`/STRIPE_SETUP_GUIDE.md`** - Setup do Stripe
3. **`/SUPABASE_RECONNECTION_COMPLETE.md`** - Conexão Supabase

---

## 📋 ÍNDICE COMPLETO DE DOCUMENTAÇÃO

### 🚀 Início Rápido
- `/START_HERE.md` - Comece aqui
- `/QUICK_FIX_STATUS_ERROR.md` - Fix rápido do erro atual
- `/SESSION_FIXES_SUMMARY.md` - Resumo das correções

### 🔧 Correções Específicas
- `/FIX_PROJECTS_STATUS_ERROR.md` - Erro projects.status (completo)
- `/STRIPE_ENV_FIX.md` - Erro import.meta.env
- `/ACOES_MANUAIS_NECESSARIAS.md` - Todas as ações pendentes

### 💳 Stripe (8 documentos)
- `/STRIPE_README.md` - Visão geral
- `/STRIPE_INDEX.md` - Navegação
- `/STRIPE_SETUP_GUIDE.md` - Setup completo
- `/STRIPE_QUICK_COMMANDS.md` - Comandos
- `/STRIPE_CHECKLIST.md` - Checklist
- `/STRIPE_IMPLEMENTATION_SUMMARY.md` - Detalhes técnicos
- `/STRIPE_IMPLEMENTATION_PLAN.md` - Arquitetura
- `/STRIPE_EXECUTIVE_SUMMARY.md` - Para gestores

### 🗄️ Banco de Dados
- `/QUICK_START_DATABASE.md` - Setup rápido
- `/DATABASE_STATUS.md` - Status atual
- `/SUPABASE_TABLES_LIST.md` - Lista de tabelas
- `/supabase/migrations/` - Migrações SQL

### 🔌 Conexão e Deploy
- `/SUPABASE_RECONNECTION_COMPLETE.md` - Conexão
- `/DEPLOY_SUPABASE.md` - Deploy
- `/AUTOMATED_SETUP_GUIDE.md` - Setup automatizado

### 📊 Status e Debugging
- `/SUPABASE_CONNECTION_STATUS.md` - Status de conexão
- `/DEBUG_README.md` - Guia de debug
- `/COMPLETE_DEBUG_REPORT.md` - Report completo

---

## 🔍 BUSCA POR MENSAGEM DE ERRO

### "column X does not exist"
→ `/FIX_PROJECTS_STATUS_ERROR.md`

### "Cannot read properties of undefined"
→ `/STRIPE_ENV_FIX.md` (já corrigido)

### "403 Forbidden"
→ `/ACOES_MANUAIS_NECESSARIAS.md` (item 1)

### "Stripe não está configurado"
→ `/STRIPE_ENV_FIX.md` ou `/STRIPE_SETUP_GUIDE.md`

### "Network error" / "Failed to fetch"
→ `/SUPABASE_RECONNECTION_COMPLETE.md`

### "permission denied for table X"
→ `/QUICK_START_DATABASE.md` (RLS)

### "relation X does not exist"
→ `/QUICK_START_DATABASE.md` (executar migração 001)

---

## ⚡ SOLUÇÕES RÁPIDAS

### 1. Erro projects.status (ATUAL)
```bash
# Solução de 30 segundos:
# 1. Abrir: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
# 2. Executar:
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
```

### 2. Aplicação não inicia
```bash
npm install
npm run dev
```

### 3. Projetos não aparecem
```bash
# Executar migração 004
# Ver: /FIX_PROJECTS_STATUS_ERROR.md
```

### 4. Stripe não funciona
```bash
# Criar .env (se não existir)
cp .env.example .env

# Editar .env e adicionar:
VITE_STRIPE_PUBLIC_KEY=pk_test_SUA_CHAVE
```

---

## 📊 STATUS DOS COMPONENTES

| Componente | Status | Documentação |
|------------|--------|--------------|
| Frontend | ✅ 100% | - |
| Banco de Dados | ⏳ 75% | `/FIX_PROJECTS_STATUS_ERROR.md` |
| Stripe (código) | ✅ 100% | `/STRIPE_README.md` |
| Stripe (config) | ⏳ 0% | `/STRIPE_SETUP_GUIDE.md` |
| Edge Functions | ⏳ 0% | `/ACOES_MANUAIS_NECESSARIAS.md` |
| Deploy | ⏳ 0% | `/DEPLOY_SUPABASE.md` |

---

## 🎯 FLUXO DE RESOLUÇÃO DE PROBLEMAS

```
┌─────────────────────────┐
│   Erro aconteceu?       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 1. Ler mensagem de erro │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 2. Buscar neste índice  │
│    (por erro ou tipo)   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 3. Abrir documento      │
│    recomendado          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 4. Seguir solução       │
│    passo a passo        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 5. Testar aplicação     │
└───────────┬─────────────┘
            │
            ▼
      ✅ Resolvido!
```

---

## 🆘 PRECISA DE AJUDA?

### 1. Identifique o erro
- Copie a mensagem de erro completa
- Anote em qual página/ação aconteceu

### 2. Busque solução
- Use este índice para encontrar o documento certo
- Verifique a seção "Troubleshooting" do documento

### 3. Aplique a correção
- Siga o passo a passo exatamente
- Marque os itens conforme avança

### 4. Verifique
- Recarregue a aplicação
- Teste a funcionalidade
- Confirme que erro sumiu

### 5. Documente (se novo)
- Se encontrou erro não documentado
- Anote a solução que funcionou
- Considere abrir issue/PR

---

## 📞 LINKS ÚTEIS

### Dashboards:
- **Supabase:** https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr
- **SQL Editor:** https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
- **Stripe:** https://dashboard.stripe.com

### Documentação:
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **React Docs:** https://react.dev

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Antes de reportar erro, verifique:

### Básico:
- [ ] `npm install` foi executado
- [ ] `.env` existe e tem valores corretos
- [ ] `npm run dev` está rodando
- [ ] Navegador está atualizado

### Banco de Dados:
- [ ] Migração 001 foi executada
- [ ] Migração 004 foi executada
- [ ] Tabelas existem no Supabase
- [ ] RLS está configurado

### Stripe (se aplicável):
- [ ] `VITE_STRIPE_PUBLIC_KEY` está no .env
- [ ] Chave começa com `pk_test_` ou `pk_live_`
- [ ] Edge functions foram deployadas
- [ ] Webhook está configurado

---

## 🎉 CONCLUSÃO

**Este índice cobre:**
- ✅ 2 erros conhecidos (1 ativo, 1 corrigido)
- ✅ 30+ documentos de ajuda
- ✅ Soluções rápidas
- ✅ Guias completos
- ✅ Links úteis

**Para começar:**
1. Vá para `/START_HERE.md`
2. Corrija erro atual: `/QUICK_FIX_STATUS_ERROR.md`
3. Continue setup: `/ACOES_MANUAIS_NECESSARIAS.md`

---

**Atualizado em:** 04/11/2025  
**Versão:** 1.0.0  
**Mantido por:** Figma Make AI
