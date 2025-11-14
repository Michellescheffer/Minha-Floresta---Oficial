# 📋 ORDEM DE EXECUÇÃO DOS SCRIPTS SQL

## 🎯 IMPORTANTE
Execute os scripts **NESTA ORDEM** no Supabase SQL Editor para garantir que todas as funcionalidades do CMS funcionem corretamente.

---

## ✅ SCRIPTS A EXECUTAR

### 1️⃣ **Verificar Estrutura Atual** (Opcional)
**Arquivo**: `check-tables-structure.sql`  
**Objetivo**: Verificar quais tabelas já existem e suas estruturas  
**Ação**: Execute e envie o resultado se precisar de diagnóstico

---

### 2️⃣ **Criar Tabelas de Imagens** ⚠️ CRÍTICO
**Arquivo**: `create-images-tables.sql`  
**Objetivo**: Criar tabelas `site_images` e `certificate_images`  
**Necessário para**: Aba "Imagens" do CMS

**O que cria**:
- ✅ Tabela `site_images` (hero banner)
- ✅ Tabela `certificate_images` (imagens de certificados)
- ✅ Índices de performance
- ✅ Triggers de updated_at
- ✅ RLS policies
- ✅ Dados de exemplo

**Status**: 🔴 OBRIGATÓRIO - Aba Imagens não funciona sem isso

---

### 3️⃣ **Criar Tabela de Configurações** ⚠️ CRÍTICO
**Arquivo**: `create-site-settings-table.sql`  
**Objetivo**: Criar tabela `site_settings`  
**Necessário para**: Aba "Configurações" do CMS

**O que cria**:
- ✅ Tabela `site_settings`
- ✅ Campos de configuração do site
- ✅ Campos de contato
- ✅ Campos de redes sociais
- ✅ Campos de pagamento (Stripe)
- ✅ Modo manutenção
- ✅ RLS policies
- ✅ Configurações padrão

**Status**: 🔴 OBRIGATÓRIO - Aba Configurações não funciona sem isso

---

### 4️⃣ **Criar Tabela de Projetos de Doação** ⚠️ CRÍTICO
**Arquivo**: `create-donation-projects-table.sql`  
**Objetivo**: Criar tabela `donation_projects`  
**Necessário para**: Aba "Doações" do CMS

**O que cria**:
- ✅ Tabela `donation_projects`
- ✅ Campos de projeto de doação
- ✅ Barra de progresso (goal_amount, current_amount)
- ✅ Status (active, paused, completed)
- ✅ Índices de performance
- ✅ RLS policies
- ✅ Projeto de exemplo

**Status**: 🔴 OBRIGATÓRIO - Aba Doações não funciona sem isso

---

### 5️⃣ **Criar Tabela de Certificados de Doação** ⚠️ CRÍTICO
**Arquivo**: `create-donation-certificates-table.sql`  
**Objetivo**: Criar tabela `donation_certificates`  
**Necessário para**: Sistema de certificação de doações

**O que cria**:
- ✅ Tabela `donation_certificates`
- ✅ Geração automática de número (DOA-YYYY-NNNNNN)
- ✅ Função PL/pgSQL para numeração
- ✅ Trigger automático
- ✅ Campos de doador (nome, email, CPF)
- ✅ Doação anônima
- ✅ Índices de performance
- ✅ RLS policies
- ✅ Certificado de exemplo

**Status**: 🔴 OBRIGATÓRIO - Certificados de doação não funcionam sem isso

---

### 6️⃣ **Corrigir Políticas RLS** (Se necessário)
**Arquivo**: `fix-rls-policies.sql`  
**Objetivo**: Ajustar políticas de segurança  
**Necessário para**: Garantir acesso correto aos dados

**Status**: 🟡 OPCIONAL - Execute se tiver problemas de permissão

---

### 7️⃣ **Corrigir Tabela de Certificados** (Se necessário)
**Arquivo**: `fix-certificates-table.sql`  
**Objetivo**: Ajustar estrutura da tabela certificates  
**Necessário para**: Corrigir problemas na tabela de certificados

**Status**: 🟡 OPCIONAL - Execute se tiver problemas com certificados

---

## 🚀 COMO EXECUTAR

### Passo a Passo:

1. **Acesse o Supabase SQL Editor**:
   ```
   https://ngnybwsovjignsflrhyr.supabase.co/project/ngnybwsovjignsflrhyr/sql/new
   ```

2. **Para cada script obrigatório (2 a 5)**:
   - Abra o arquivo `.sql` no VS Code
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em **RUN** (ou pressione Ctrl+Enter)
   - Aguarde a mensagem de sucesso
   - Verifique se não há erros

3. **Verificar Sucesso**:
   ```sql
   -- Execute esta query para verificar se as tabelas foram criadas:
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
     AND table_name IN (
       'site_images', 
       'certificate_images', 
       'site_settings', 
       'donation_projects', 
       'donation_certificates'
     )
   ORDER BY table_name;
   ```
   
   **Resultado esperado**: 5 tabelas listadas

---

## ✅ CHECKLIST DE EXECUÇÃO

Marque conforme for executando:

- [ ] 1. Verificar estrutura atual (opcional)
- [ ] 2. ✅ Criar tabelas de imagens (`create-images-tables.sql`)
- [ ] 3. ✅ Criar tabela de configurações (`create-site-settings-table.sql`)
- [ ] 4. ✅ Criar tabela de projetos de doação (`create-donation-projects-table.sql`)
- [ ] 5. ✅ Criar tabela de certificados de doação (`create-donation-certificates-table.sql`)
- [ ] 6. Corrigir RLS (se necessário)
- [ ] 7. Corrigir certificados (se necessário)

---

## 🎯 APÓS EXECUTAR TODOS OS SCRIPTS

### Teste cada aba do CMS:

1. **Dashboard** ✅ (já funciona)
2. **Projetos** ✅ (já funciona)
3. **Doações** 🆕 (vai funcionar após script 4)
4. **Certificados** ✅ (já funciona)
5. **Clientes** ✅ (já funciona)
6. **Analytics** ✅ (já funciona)
7. **Imagens** 🆕 (vai funcionar após script 2)
8. **Configurações** 🆕 (vai funcionar após script 3)

---

## ⚠️ PROBLEMAS CONHECIDOS

### Se encontrar erro "relation does not exist":
- A tabela ainda não foi criada
- Execute o script correspondente

### Se encontrar erro "permission denied":
- Problema de RLS
- Execute o script `fix-rls-policies.sql`

### Se encontrar erro "column does not exist":
- Estrutura da tabela está diferente
- Execute o script de correção correspondente

---

## 📞 SUPORTE

Se encontrar qualquer erro durante a execução:
1. Copie a mensagem de erro completa
2. Identifique qual script causou o erro
3. Verifique se executou os scripts na ordem correta
4. Me envie o erro para análise

---

## 🎉 CONCLUSÃO

Após executar os **5 scripts obrigatórios**, todas as 8 abas do CMS estarão 100% funcionais!

**Tempo estimado**: 5-10 minutos  
**Dificuldade**: Fácil (copiar e colar)  
**Impacto**: Alto (CMS completo)
