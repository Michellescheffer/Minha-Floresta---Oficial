# 🔍 DEBUG & DIAGNÓSTICO - Minha Floresta Conservações

## 📚 DOCUMENTAÇÃO DE DEBUG

Este projeto possui um sistema completo de diagnóstico e correção de problemas. Consulte os arquivos abaixo conforme sua necessidade:

---

## 📄 ARQUIVOS DE DIAGNÓSTICO

### 1️⃣ **PROBLEMS_SUMMARY.md** ⭐ COMECE AQUI
**Para:** Visão rápida dos problemas  
**Tempo de leitura:** 2-3 minutos  
**Conteúdo:**
- Lista resumida de problemas
- Status de cada componente
- Comandos rápidos de correção
- Métricas visuais

👉 **Leia este primeiro se você quer:** Entender rapidamente o que está quebrado

---

### 2️⃣ **QUICK_FIX_GUIDE.md**
**Para:** Guia passo a passo de correção  
**Tempo de leitura:** 5 minutos  
**Tempo de execução:** 10 minutos  
**Conteúdo:**
- Passo a passo detalhado
- Comandos prontos para copiar/colar
- Verificação de cada etapa
- Troubleshooting comum

👉 **Use este se você quer:** Corrigir os problemas agora mesmo

---

### 3️⃣ **SUPABASE_DEBUG_REPORT.md**
**Para:** Análise técnica completa  
**Tempo de leitura:** 15-20 minutos  
**Conteúdo:**
- Diagnóstico detalhado de todos os arquivos
- Explicação técnica de cada problema
- Arquitetura do sistema
- Checklist completo de correções
- Comandos de diagnóstico avançado

👉 **Use este se você quer:** Entender profundamente o sistema e seus problemas

---

## 🚀 INÍCIO RÁPIDO (5 minutos)

### Se você quer apenas CORRIGIR e continuar:

```bash
# 1. Instalar Supabase CLI (se não tiver)
npm install -g supabase

# 2. Login
npx supabase login

# 3. Linkar projeto
npx supabase link --project-ref ngnybwsovjignsflrhyr

# 4. Deploy Edge Functions
npx supabase functions deploy server

# 5. Aplicar Schema
npx supabase db push

# 6. Verificar
npx supabase status
```

**Pronto!** 🎉 Seu sistema deve estar 100% funcional agora.

---

## 🎯 FLUXO DE DIAGNÓSTICO RECOMENDADO

```
┌─────────────────────────────────────────┐
│  1. PROBLEMS_SUMMARY.md                 │
│     └─> Leia para entender o problema   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  2. QUICK_FIX_GUIDE.md                  │
│     └─> Execute as correções            │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  3. Teste o sistema                     │
│     └─> Acesse /dashboard               │
└─────────────┬───────────────────────────┘
              │
       ┌──────┴──────┐
       │             │
   Funciona?       Ainda
       │          quebrado?
       ▼             ▼
   🎉 FIM!    ┌──────────────────────────┐
              │ SUPABASE_DEBUG_REPORT.md │
              │  └─> Análise profunda    │
              └──────────────────────────┘
```

---

## 🔧 COMPONENTES DO SISTEMA

### ✅ Funcionando (Não precisa mexer)
- Frontend React (App.tsx, componentes, páginas)
- IndexedDB Cache System
- Sistema Híbrido (HybridDataService)
- Hooks e Contexts
- UI Components
- Sistema de Limpeza

### ❌ Precisa Correção (Ação necessária)
- Edge Functions (não deployadas)
- Database Schema (não aplicado)

### ✅ Corrigido Automaticamente
- URL da API (database.ts atualizado)

---

## 📊 STATUS ATUAL

```
┌─────────────────────────────────────────────┐
│            SISTEMA HÍBRIDO                  │
│                                             │
│  Frontend (React)        ✅ 100%           │
│  IndexedDB Cache         ✅ 100%           │
│  Edge Functions          ❌   0%           │
│  Database Schema         ❌   0%           │
│  API URLs                ✅ 100% (corrigido)│
│                                             │
│  Status Geral:           ⚠️  60%           │
└─────────────────────────────────────────────┘
```

**Após correções:**
```
Status Geral: ✅ 100% - Sistema completamente funcional
```

---

## 🔍 FERRAMENTAS DE DIAGNÓSTICO NO APP

### Componentes de Debug Disponíveis:

1. **Dashboard** (`/dashboard`)
   - Overview geral do sistema
   - Status de conexão
   - Métricas em tempo real

2. **SystemHealthCheck** (Componente)
   - Verifica saúde de todos os sistemas
   - IndexedDB, Supabase, Sync
   - Diagnóstico automático

3. **IndexedDBTest** (Componente)
   - Testa operações CRUD no IndexedDB
   - Diagnostica problemas de cache
   - Mostra estatísticas detalhadas

4. **ServerDiagnostic** (Componente)
   - Testa conexão com Edge Functions
   - Verifica endpoints
   - Mostra logs de erro

5. **DatabaseMonitor** (Componente)
   - Monitor de dados em tempo real
   - Estatísticas de tabelas
   - Status de sincronização

---

## 🆘 PRECISA DE AJUDA?

### Problemas Comuns:

**1. "Function not found"**
```bash
# Solução: Re-deploy
npx supabase functions deploy server
```

**2. "Table does not exist"**
```bash
# Solução: Aplicar schema
npx supabase db push
```

**3. "CORS error"**
- Já configurado, deve funcionar após deploy

**4. "Authentication required"**
```bash
# Verificar secrets
npx supabase secrets list
```

### Onde Encontrar Mais Informações:

- **Logs em Tempo Real:**
  ```bash
  npx supabase functions logs server --tail
  ```

- **Status do Projeto:**
  ```bash
  npx supabase status
  ```

- **Queries no Banco:**
  ```bash
  npx supabase db query "SELECT COUNT(*) FROM projects;"
  ```

---

## 📞 SUPORTE TÉCNICO

### Hierarquia de Documentação:

1. **Dúvida Rápida?** → `PROBLEMS_SUMMARY.md`
2. **Precisa Corrigir?** → `QUICK_FIX_GUIDE.md`
3. **Quer Entender Tudo?** → `SUPABASE_DEBUG_REPORT.md`
4. **Ainda com Problema?** → Consulte logs: `npx supabase functions logs server`

---

## ⏱️ TEMPO ESTIMADO

- **Ler documentação:** 5-10 minutos
- **Executar correções:** 10 minutos
- **Testar sistema:** 5 minutos
- **TOTAL:** ~25 minutos

---

## 🎉 PRÓXIMOS PASSOS (Após Correções)

1. ✅ Criar projetos de teste via CMS
2. ✅ Testar fluxo de compra
3. ✅ Gerar certificados
4. ✅ Popular com dados reais
5. ✅ Configurar pagamentos (Stripe)
6. ✅ Deploy em produção

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Antes de considerar completo:

- [ ] Edge Functions deployadas e respondendo
- [ ] 15 tabelas criadas no PostgreSQL
- [ ] URL da API corrigida (já feito ✅)
- [ ] CMS consegue criar projetos
- [ ] Loja mostra projetos
- [ ] Carrinho funciona
- [ ] Calculadora de CO2 calcula
- [ ] Sistema de sincronização ativo

---

**Versão do Sistema:** 2.0.0-hybrid  
**Última Atualização:** 03/11/2025  
**Mantido por:** Sistema de Diagnóstico Automático

---

## 🔗 LINKS RÁPIDOS

- [Dashboard Supabase](https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr)
- [Edge Functions](https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/functions)
- [Database Tables](https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/database/tables)
- [SQL Editor](https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/editor)

---

**BOM TRABALHO E BOA SORTE! 🚀🌳**
