# 🔧 Correção Urgente: Column projects.status does not exist

**Erro:** `column projects.status does not exist`  
**Data:** 04/11/2025  
**Status:** ⚠️ **AÇÃO MANUAL NECESSÁRIA**

---

## ❌ PROBLEMA

A tabela `projects` no Supabase não tem a coluna `status` (e outras colunas importantes), causando erro ao buscar projetos.

**Erro completo:**
```json
{
  "code": "42703",
  "details": null,
  "hint": null,
  "message": "column projects.status does not exist"
}
```

---

## ✅ SOLUÇÃO - Executar Migração 004

A migração `004_fix_projects_table.sql` já foi criada e corrige esse problema. Você precisa executá-la **manualmente** no SQL Editor do Supabase.

---

## 🚀 PASSO A PASSO (5 MINUTOS)

### **PASSO 1: Abrir SQL Editor**

Acesse o SQL Editor do seu projeto Supabase:
```
https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
```

Ou navegue:
1. Dashboard Supabase
2. Seu projeto (ngnybwsovjignsflrhyr)
3. Menu lateral: **SQL Editor**
4. Clique em **"New Query"**

---

### **PASSO 2: Copiar SQL da Migração**

Abra o arquivo:
```
/supabase/migrations/004_fix_projects_table.sql
```

**Copie TODO o conteúdo** do arquivo (269 linhas).

---

### **PASSO 3: Colar no SQL Editor**

1. Cole todo o código no SQL Editor
2. **NÃO modifique nada**
3. Clique no botão **"Run"** (ou pressione Ctrl/Cmd + Enter)

---

### **PASSO 4: Aguardar Execução**

A migração vai:
- ✅ Adicionar coluna `status` (se não existir)
- ✅ Adicionar coluna `slug` (se não existir)  
- ✅ Adicionar coluna `category` (se não existir)
- ✅ Adicionar coluna `long_description` (se não existir)
- ✅ Adicionar coluna `featured` (se não existir)
- ✅ Adicionar coluna `priority` (se não existir)
- ✅ Gerar slugs automáticos para projetos existentes
- ✅ Criar índices de performance
- ✅ Exibir estrutura atual da tabela

**Tempo estimado:** 5-10 segundos

---

### **PASSO 5: Verificar Sucesso**

Na área de **Messages/Results**, você deve ver mensagens como:

```
✅ Coluna status adicionada à tabela projects
✅ Coluna slug adicionada à tabela projects
✅ Coluna category adicionada à tabela projects
✅ Índice idx_projects_status criado
✅ SUCESSO! Todas as colunas necessárias estão presentes na tabela projects
🎉 Migração 004_fix_projects_table.sql concluída!
```

Se ver **"⚠️ Coluna XXX já existe"** - tudo bem! Significa que a coluna já estava lá.

---

### **PASSO 6: Recarregar Aplicação**

```bash
# No seu terminal
# Ctrl+C para parar o servidor (se estiver rodando)
npm run dev
```

Agora o erro `column projects.status does not exist` deve ter sumido! ✅

---

## 🔍 VERIFICAÇÃO RÁPIDA

Para confirmar que a migração funcionou, execute este SQL:

```sql
-- Ver estrutura da tabela projects
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'projects'
ORDER BY ordinal_position;
```

**Deve aparecer:** `status`, `slug`, `category`, `featured`, `priority`, `long_description`

---

## 🧪 TESTE NO FRONTEND

Após executar a migração:

1. Acesse: `http://localhost:5173/loja`
2. Os projetos devem carregar **sem erro**
3. Verifique o console do navegador - não deve ter erros de `status`

---

## ❓ SE DER ERRO

### Erro: "relation 'projects' does not exist"

**Causa:** A tabela `projects` não foi criada ainda  
**Solução:** Execute a migração `001_initial_schema.sql` primeiro

```sql
-- No SQL Editor, execute:
-- Copie e cole TODO o conteúdo de /supabase/migrations/001_initial_schema.sql
```

---

### Erro: "permission denied"

**Causa:** Você não tem permissão de admin  
**Solução:** 
1. Verifique se está logado com a conta correta
2. Verifique em Settings > Database se tem acesso
3. Se necessário, use a service_role key

---

### Projetos continuam não aparecendo

**Causa:** Tabela pode estar vazia  
**Solução:** Adicionar projetos de exemplo

```sql
-- Inserir projeto de teste
INSERT INTO public.projects (
    name,
    slug,
    description,
    category,
    status,
    location,
    total_area,
    available_area,
    price_per_sqm
) VALUES (
    'Projeto Teste',
    'projeto-teste',
    'Projeto de teste para verificação',
    'reforestation',
    'active',
    '{"country": "Brasil", "state": "SP", "city": "São Paulo"}'::jsonb,
    10000,
    10000,
    25.00
);
```

---

## 📋 ORDEM CORRETA DAS MIGRAÇÕES

Se você nunca executou nenhuma migração, execute nesta ordem:

1. **001_initial_schema.sql** - Cria todas as tabelas
2. **002_macarrao_amarelo.sql** - Tabela de configuração (opcional)
3. **004_fix_projects_table.sql** - **ESTA AQUI** (corrige projects)
4. **005_stripe_tables.sql** - Stripe (se quiser usar pagamentos)

---

## ⚡ COMANDO RÁPIDO (Alternativa via CLI)

Se tiver Supabase CLI instalado:

```bash
# Aplicar migração via CLI
supabase db push
```

Isso vai aplicar automaticamente todas as migrações da pasta `/supabase/migrations/`.

---

## 🎯 CHECKLIST

- [ ] Abri o SQL Editor do Supabase
- [ ] Copiei TODO o conteúdo de `004_fix_projects_table.sql`
- [ ] Colei no SQL Editor
- [ ] Cliquei em "Run"
- [ ] Vi mensagens de sucesso ✅
- [ ] Recarreguei a aplicação (`npm run dev`)
- [ ] Erro `column projects.status does not exist` sumiu
- [ ] Projetos carregam normalmente em `/loja`

---

## 📊 O QUE A MIGRAÇÃO FAZ

### Colunas Adicionadas:
- **status** - Estado do projeto (active, paused, completed, planning)
- **slug** - URL amigável (projeto-amazonia)
- **category** - Categoria (reforestation, conservation, etc)
- **long_description** - Descrição detalhada
- **featured** - Projeto em destaque (boolean)
- **priority** - Ordem de exibição (integer)

### Funcionalidades:
- ✅ Verifica se coluna já existe antes de criar (seguro)
- ✅ Gera slugs automaticamente para projetos sem slug
- ✅ Cria índices para melhor performance
- ✅ Exibe estrutura completa da tabela ao final

### Totalmente Seguro:
- ✅ Não apaga dados existentes
- ✅ Não sobrescreve colunas que já existem
- ✅ Pode ser executado múltiplas vezes sem problema

---

## 🆘 PRECISA DE AJUDA?

### Links Úteis:
- **SQL Editor:** https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/sql
- **Documentação Supabase:** https://supabase.com/docs/guides/database
- **Arquivo da migração:** `/supabase/migrations/004_fix_projects_table.sql`

### Verificação Manual:
```sql
-- Ver se tabela projects existe
SELECT * FROM public.projects LIMIT 1;

-- Ver colunas da tabela
\d public.projects
```

---

## ✅ APÓS EXECUTAR

Você deve ver:

**Frontend:**
- ✅ Loja carrega sem erros
- ✅ Projetos aparecem normalmente
- ✅ Filtros funcionam (status, category, featured)

**Banco de Dados:**
- ✅ Tabela `projects` com todas as colunas
- ✅ Índices criados
- ✅ Slugs gerados

---

**Status:** ⏳ **AGUARDANDO EXECUÇÃO DA MIGRAÇÃO**

Execute a migração agora para corrigir o erro! 🚀

**Tempo necessário:** ~5 minutos
