# 🚨 AÇÕES MANUAIS NECESSÁRIAS - Minha Floresta

## ⚠️ URGENTE - Erro Atual

**Erro:** `column projects.status does not exist`

**👉 SOLUÇÃO:** Execute a migração `004_fix_projects_table.sql`

📖 **Guia completo:** `/FIX_PROJECTS_STATUS_ERROR.md`

**Tempo:** ~5 minutos

---

## ✅ Correções Automáticas Já Aplicadas

As seguintes correções foram aplicadas automaticamente no código:

1. ✅ `/utils/database.ts` - URL da API corrigida para usar o projectId correto
2. ✅ `/verify-current-state.js` - PROJECT_REF corrigido
3. ✅ `/check-and-fix-supabase.sh` - PROJECT_REF corrigido
4. ✅ `/supabase/config.toml` - Adicionada configuração para function "server"
5. ✅ `/utils/supabase/stripeConfig.ts` - Validação segura de import.meta.env
6. ✅ `/.env` - Arquivo criado com variáveis de ambiente
7. ✅ `/.gitignore` - Criado para proteger arquivos sensíveis

---

## 🔴 AÇÕES MANUAIS OBRIGATÓRIAS

Estas ações **DEVEM** ser executadas manualmente no Supabase Dashboard e via CLI:

### 1️⃣ Limpar Edge Functions Conflitantes no Dashboard

**Onde:** https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/functions

**O que fazer:**
1. Acesse o link acima
2. **DELETE** as seguintes functions se existirem:
   - `mf-backend`
   - `make-server`
   - `minha-floresta-api`
   - `api`
3. **MANTENHA** apenas a function `server` (se existir)

**Por quê?**  
Múltiplas functions competindo pelas mesmas rotas causam erros 403 e comportamento imprevisível.

---

### 2️⃣ Fazer Deploy da Edge Function "server"

**Terminal - Execute os comandos:**

```bash
# 1. Fazer login no Supabase CLI
supabase login

# 2. Linkar ao projeto correto
supabase link --project-ref ngnybwsovjignsflrhyr

# 3. Deploy da function principal
supabase functions deploy server

# 4. Verificar se deployou corretamente
supabase functions list --project-ref ngnybwsovjignsflrhyr
```

**Resultado esperado:**
```
  server   deployed   1 hour ago
```

---

### 3️⃣ Configurar Environment Variables (Secrets)

**Obter Service Role Key:**
1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/settings/api
2. Na seção "Project API keys", copie o **service_role** (não o anon key!)
3. É uma key que começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Configurar via CLI:**

```bash
# 1. Configurar SUPABASE_URL
supabase secrets set SUPABASE_URL="https://ngnybwsovjignsflrhyr.supabase.co" --project-ref ngnybwsovjignsflrhyr

# 2. Configurar SUPABASE_SERVICE_ROLE_KEY (cole a key que você copiou)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key_aqui" --project-ref ngnybwsovjignsflrhyr

# 3. Verificar se foram setadas
supabase secrets list --project-ref ngnybwsovjignsflrhyr
```

**Resultado esperado:**
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY (se já existir)
```

---

### 4️⃣ Aplicar Schema do Banco de Dados

**⚠️ IMPORTANTE:** Execute as migrações NA ORDEM:

#### **Migração 1: Schema Inicial (001_initial_schema.sql)**

**Opção A - Via Supabase CLI (Recomendado):**

```bash
# Aplicar todas as migrations
supabase db push --project-ref ngnybwsovjignsflrhyr
```

**Opção B - Via Dashboard SQL Editor:**

1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
2. Clique em "New Query"
3. Abra o arquivo `/supabase/migrations/001_initial_schema.sql` 
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em "Run" (Ctrl+Enter)

**Resultado esperado:**
15 tabelas criadas (user_profiles, projects, purchases, certificates, etc)

---

#### **Migração 4: Correção da Tabela Projects (004_fix_projects_table.sql)**

**🚨 URGENTE - CORRIGE ERRO: "column projects.status does not exist"**

**Via Dashboard SQL Editor:**

1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
2. Clique em "New Query"
3. Abra o arquivo `/supabase/migrations/004_fix_projects_table.sql`
4. Copie TODO o conteúdo (269 linhas)
5. Cole no SQL Editor
6. Clique em "Run" (Ctrl+Enter)

**Resultado esperado:**
```
✅ Coluna status adicionada à tabela projects
✅ Coluna slug adicionada à tabela projects
✅ Coluna category adicionada à tabela projects
✅ Índices criados
🎉 Migração 004_fix_projects_table.sql concluída!
```

**Guia completo:** `/FIX_PROJECTS_STATUS_ERROR.md`

---

#### **Migração 5: Stripe (005_stripe_tables.sql) - OPCIONAL**

**Necessário apenas se for usar pagamentos via Stripe**

1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
2. Copie conteúdo de `/supabase/migrations/005_stripe_tables.sql`
3. Execute no SQL Editor

**Guia completo:** `/STRIPE_SETUP_GUIDE.md`

---

### 5️⃣ Testar Endpoints

**Abra o navegador ou terminal e teste:**

```bash
# 1. Status check
curl https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/status

# Resposta esperada:
# {"status":"operational","connected":true,"timestamp":"..."}

# 2. Health check
curl https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/health

# Resposta esperada:
# {"status":"ok","timestamp":"..."}

# 3. Projects endpoint
curl https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/projects

# Resposta esperada:
# {"success":true,"data":[],"count":0,"source":"hybrid"}

# 4. Test endpoint
curl https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/test

# Resposta esperada:
# {"message":"Server is working!","timestamp":"...","status":"ok"}
```

**Se algum endpoint retornar erro:**
- ❌ 403 Forbidden: Ainda há functions conflitantes (volte ao passo 1)
- ❌ 404 Not Found: Function não foi deployada (volte ao passo 2)
- ❌ 500 Internal Error: Faltam environment variables (volte ao passo 3)

---

## 📊 Verificação Completa

**Execute o script de verificação:**

```bash
node verify-current-state.js
```

**Resultado esperado:**
```
✅ Working functions: 1
   - server (GOOD - keep this one)

✅ Database: Tables already exist

🎯 NEXT STEPS:
1. ✅ Functions look good!
2. ✅ Test your React app
```

---

## 🎯 Após Completar Todas as Ações

### O que estará funcionando:

✅ **Frontend React** - 100% funcional  
✅ **IndexedDB Cache** - 100% funcional  
✅ **Supabase Connection** - 100% funcional  
✅ **Edge Functions** - 100% funcional  
✅ **Database Tables** - 100% funcional  
✅ **Sistema Híbrido** - 100% funcional  
✅ **Sincronização** - 100% funcional  

### Funcionalidades disponíveis:

- ✅ CMS - Criar, editar e deletar projetos
- ✅ Loja - Visualizar e comprar m² de reflorestamento
- ✅ Carrinho - Persistência online e offline
- ✅ Calculadora - Calcular pegada de carbono
- ✅ Certificados - Gerar e verificar certificados
- ✅ Doações - Sistema de doações para projetos sociais
- ✅ Dashboard - Administração completa
- ✅ Modo Offline - Sistema funciona sem internet

---

## 🔍 Logs e Diagnóstico

### Ver Logs da Edge Function:

```bash
supabase functions logs server --project-ref ngnybwsovjignsflrhyr
```

### Ver tabelas criadas:

```bash
supabase db list --project-ref ngnybwsovjignsflrhyr
```

### Testar conexão:

```bash
supabase status --project-ref ngnybwsovjignsflrhyr
```

---

## ⚠️ Troubleshooting

### Problema: "Function não encontrada"
**Solução:**
```bash
# Re-deploy
supabase functions deploy server --project-ref ngnybwsovjignsflrhyr
```

### Problema: "403 Forbidden"
**Solução:**
1. Deletar TODAS as outras functions no Dashboard
2. Manter apenas `server`
3. Re-deploy da function `server`

### Problema: "Database connection failed"
**Solução:**
```bash
# Verificar se service role key está correta
supabase secrets list --project-ref ngnybwsovjignsflrhyr

# Re-setar se necessário
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="nova_key" --project-ref ngnybwsovjignsflrhyr
```

### Problema: "Tables não existem"
**Solução:**
```bash
# Re-aplicar migrations
supabase db push --project-ref ngnybwsovjignsflrhyr
```

---

## 📞 Links Importantes

- **Dashboard:** https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr
- **Functions:** https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/functions
- **Database:** https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/database/tables
- **API Settings:** https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/settings/api
- **SQL Editor:** https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/editor
- **Logs:** https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/logs/edge-functions

---

## ✅ Checklist Final

Marque cada item conforme completar:

- [ ] 1. Functions conflitantes deletadas no Dashboard
- [ ] 2. Login no Supabase CLI (`supabase login`)
- [ ] 3. Projeto linkado (`supabase link --project-ref ngnybwsovjignsflrhyr`)
- [ ] 4. Function "server" deployada (`supabase functions deploy server`)
- [ ] 5. SUPABASE_URL configurada
- [ ] 6. SUPABASE_SERVICE_ROLE_KEY configurada
- [ ] 7. Schema do banco aplicado (`supabase db push`)
- [ ] 8. Endpoints testados (todos retornam 200 OK)
- [ ] 9. Script de verificação executado (`node verify-current-state.js`)
- [ ] 10. Aplicação React testada (abrir no navegador)

---

**Tempo estimado para completar:** 20-30 minutos

**Dificuldade:** Fácil (seguir passo a passo)

**Resultado final:** Sistema 100% funcional! 🎉

---

**Documento criado em:** 03/11/2025  
**Última atualização:** 03/11/2025, 14:45 BRT
