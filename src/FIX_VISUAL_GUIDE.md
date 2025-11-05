# 🎯 Guia Visual - Correção em 3 Passos

## ⚡ SOLUÇÃO RÁPIDA (30 segundos)

---

### 📍 PASSO 1: Abrir SQL Editor

**Clique aqui:**
```
https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
```

Ou navegue:
```
Dashboard Supabase → Seu Projeto → SQL Editor (menu lateral)
```

---

### 📋 PASSO 2: Copiar SQL

**Abra este arquivo no seu editor de código:**
```
FIX_NOW.sql
```

**Selecione TUDO:**
- Windows/Linux: `Ctrl + A`
- Mac: `Cmd + A`

**Copie:**
- Windows/Linux: `Ctrl + C`
- Mac: `Cmd + C`

---

### ▶️ PASSO 3: Executar

**No SQL Editor do Supabase:**

1. Clique em **"New Query"** (botão verde)

2. **Cole o SQL copiado:**
   - Windows/Linux: `Ctrl + V`
   - Mac: `Cmd + V`

3. Clique em **"Run"** (ou pressione `Ctrl/Cmd + Enter`)

---

### ✅ PASSO 4: Verificar Sucesso

**Na área de resultados você verá:**

```
═══════════════════════════════════════
✅ SUCESSO! Todas as colunas foram adicionadas!
═══════════════════════════════════════

📊 Colunas criadas:
   ✅ status
   ✅ slug
   ✅ category
   ✅ long_description
   ✅ featured
   ✅ priority

📈 Índices criados:
   ✅ idx_projects_status
   ✅ idx_projects_category
   ✅ idx_projects_featured
   ✅ idx_projects_slug

🚀 PRÓXIMO PASSO:
   Reinicie a aplicação: npm run dev
```

---

### 🔄 PASSO 5: Reiniciar Aplicação

**No seu terminal:**

```bash
# Se o servidor estiver rodando, pare com:
Ctrl + C

# Inicie novamente:
npm run dev
```

---

### 🎉 PRONTO!

**Acesse:**
```
http://localhost:5173/loja
```

**O erro foi corrigido!** ✅

Os projetos devem carregar normalmente agora.

---

## 🆘 Problemas?

### ❌ "relation projects does not exist"

**Causa:** Tabela `projects` não foi criada ainda

**Solução:**
1. Primeiro execute: `/supabase/migrations/001_initial_schema.sql`
2. Depois execute: `/FIX_NOW.sql`

---

### ❌ "permission denied"

**Causa:** Permissões insuficientes

**Solução:**
1. Verifique se está logado com a conta correta
2. Certifique-se de ter acesso admin ao projeto

---

### ❌ Ainda aparece erro de "status"

**Solução:**
1. Faça hard refresh no navegador: `Ctrl + Shift + R`
2. Reinicie o servidor: `npm run dev`
3. Limpe cache do navegador

---

## 🔧 Alternativa: Script Automatizado

Se você tem Supabase CLI instalado:

```bash
# Dar permissão de execução
chmod +x fix-projects-status.sh

# Executar
./fix-projects-status.sh
```

O script tentará aplicar a correção automaticamente.

---

## 📚 Documentação Completa

- **Este guia:** `/FIX_VISUAL_GUIDE.md`
- **SQL direto:** `/FIX_NOW.sql`
- **Script bash:** `/fix-projects-status.sh`
- **Instruções:** `/EXECUTE_FIX_NOW.md`
- **Guia completo:** `/FIX_PROJECTS_STATUS_ERROR.md`

---

**Tempo total:** 30 segundos  
**Dificuldade:** Muito Fácil 🟢  
**Status após executar:** ✅ Aplicação funcionando
