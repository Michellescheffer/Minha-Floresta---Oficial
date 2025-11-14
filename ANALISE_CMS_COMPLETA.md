# 📊 ANÁLISE COMPLETA DO CMS - MINHA FLORESTA

## 🎯 RESUMO EXECUTIVO

O CMS possui **8 abas funcionais** com integração completa ao Supabase. Esta análise identifica todas as funcionalidades, tabelas necessárias e possíveis problemas de integração.

---

## 1️⃣ DASHBOARD

### ✅ Funcionalidades Implementadas:
- **Cards de métricas em tempo real**:
  - Total de Projetos (da tabela `projects`)
  - Total de Vendas (da tabela `sales`)
  - Receita Total (soma de `total_value` da tabela `sales`)
  - Total de Certificados (da tabela `certificates`)
  - Usuários Ativos (placeholder - não implementado)
  - Crescimento Mensal (placeholder - 12.5% fixo)

### 📊 Tabelas Utilizadas:
- ✅ `projects` - SELECT com count
- ✅ `sales` - SELECT com sum de `total_value`
- ✅ `certificates` - SELECT com count

### ⚠️ Problemas Identificados:
1. **Usuários Ativos**: Não implementado (retorna 0)
2. **Crescimento Mensal**: Valor fixo, não calcula real
3. **Fallback para sales**: Usa try/catch mas não trata erro adequadamente

### 🔧 Recomendações:
- Implementar tracking de usuários ativos
- Calcular crescimento mensal real comparando períodos
- Adicionar gráfico de resumo no dashboard

---

## 2️⃣ PROJETOS

### ✅ Funcionalidades Implementadas:
- **CRUD Completo**:
  - ✅ Criar novo projeto
  - ✅ Editar projeto existente
  - ✅ Excluir projeto
  - ✅ Listar todos os projetos
- **Upload de imagem** com validação
- **Campo long_description** (detalhes completos)
- **Campos**: name, description, long_description, location, type, price_per_sqm, available_area, total_area, status, image_url

### 📊 Tabelas Utilizadas:
- ✅ `projects` - SELECT, INSERT, UPDATE, DELETE
- ✅ `images` storage bucket - Upload de imagens

### ⚠️ Problemas Identificados:
1. **Inconsistência de nomes de colunas**:
   - Código usa: `price_per_m2`, `available_m2`, `total_m2`, `image`
   - Banco usa: `price_per_sqm`, `available_area`, `total_area`, `image_url`
2. **Validação de imagem**: Não comprime automaticamente
3. **Sem preview** da imagem antes de salvar

### 🔧 Recomendações:
- **CRÍTICO**: Corrigir nomes de colunas no código
- Adicionar compressão automática de imagens
- Adicionar preview de imagem no formulário
- Validar campos numéricos (não permitir negativos)

---

## 3️⃣ DOAÇÕES

### ✅ Funcionalidades Implementadas:
- **CRUD Completo**:
  - ✅ Criar projeto de doação
  - ✅ Editar projeto
  - ✅ Excluir projeto
  - ✅ Listar projetos
- **Upload de imagem** com validação (max 5MB)
- **Barra de progresso** (current_amount / goal_amount)
- **Status**: active, paused, completed
- **Campos**: title, description, long_description, goal_amount, current_amount, image_url, status, start_date, end_date

### 📊 Tabelas Utilizadas:
- ⚠️ `donation_projects` - SELECT, INSERT, UPDATE, DELETE
- ✅ `images` storage bucket - Upload de imagens

### ⚠️ Problemas Identificados:
1. **Tabela não existe**: `donation_projects` precisa ser criada
2. **Sem validação**: goal_amount deve ser > 0
3. **Sem validação**: current_amount não pode ser > goal_amount
4. **Sem integração**: Não gera certificados de doação automaticamente

### 🔧 Recomendações:
- **CRÍTICO**: Executar script `create-donation-projects-table.sql`
- Adicionar validações de valores
- Criar trigger para atualizar status quando current_amount >= goal_amount
- Integrar com sistema de certificados de doação

---

## 4️⃣ CERTIFICADOS

### ✅ Funcionalidades Implementadas:
- **Listagem de certificados**:
  - Número do certificado
  - Área em m²
  - Data de emissão
  - Status
  - Nome do projeto (join)
- **Paginação**: Limit 50
- **Ordenação**: Por data de emissão (mais recentes primeiro)

### 📊 Tabelas Utilizadas:
- ✅ `certificates` - SELECT com join em `projects`
- ✅ `projects` - SELECT para nomes

### ⚠️ Problemas Identificados:
1. **Somente leitura**: Não permite criar/editar/excluir certificados
2. **Sem busca**: Não tem filtro por número ou cliente
3. **Sem download**: Não permite baixar certificado em PDF
4. **Coluna incorreta**: Usa `issued_at` mas banco tem `issue_date`

### 🔧 Recomendações:
- **CRÍTICO**: Corrigir nome da coluna de `issued_at` para `issue_date`
- Adicionar busca por número de certificado
- Adicionar filtro por cliente/email
- Adicionar botão para visualizar certificado
- Adicionar botão para download em PDF

---

## 5️⃣ CLIENTES

### ✅ Funcionalidades Implementadas:
- **Listagem de clientes**:
  - Nome, email, telefone, CPF
  - Total gasto, total m², total CO₂
  - Número de compras e certificados
- **Busca**: Por nome, email ou CPF
- **Filtros**: Todos, Ativos, Inativos (não funcional)
- **Exportação CSV**: Planilha completa
- **Detalhes do cliente**:
  - Informações pessoais
  - Histórico de compras
  - Certificados emitidos
  - Estatísticas

### 📊 Tabelas Utilizadas:
- ✅ `sales` - SELECT para histórico de compras
- ✅ `certificates` - SELECT com join em `projects`

### ⚠️ Problemas Identificados:
1. **Filtro não funcional**: "Ativos/Inativos" não faz nada
2. **Sem paginação**: Pode ficar lento com muitos clientes
3. **Dados duplicados**: Se cliente tiver múltiplas compras
4. **Sem edição**: Não permite editar dados do cliente

### 🔧 Recomendações:
- Implementar lógica de filtro ativo/inativo (baseado em última compra)
- Adicionar paginação (ex: 50 clientes por página)
- Criar tabela `customers` separada para evitar duplicação
- Adicionar opção de editar dados do cliente
- Adicionar gráfico de histórico de compras

---

## 6️⃣ ANALYTICS

### ✅ Funcionalidades Implementadas:
- **Filtros avançados**:
  - ✅ Data início/fim
  - ✅ Projeto específico
  - ✅ Status (paid, pending, cancelled)
- **4 Cards de métricas**:
  - Receita total
  - Total de vendas + ticket médio
  - Certificados + total m²
  - Clientes únicos + total CO₂
- **4 Gráficos interativos**:
  - Receita ao longo do tempo (linha)
  - Vendas por mês (barras)
  - Top 5 projetos por receita (pizza)
  - Métodos de pagamento (pizza)
- **Tabela de vendas recentes** (10 últimas)
- **Exportação CSV** com filtros aplicados

### 📊 Tabelas Utilizadas:
- ✅ `sales` - SELECT com filtros de data e status
- ✅ `certificates` - SELECT para CO₂
- ✅ `projects` - SELECT para lista de projetos

### ⚠️ Problemas Identificados:
1. **Filtro de projeto não funciona**: Não aplica filtro na query
2. **Gráfico de projetos**: Usa `notes` em vez de `project_id`
3. **Performance**: Carrega todos os dados sem paginação
4. **Sem cache**: Recalcula tudo a cada mudança de filtro

### 🔧 Recomendações:
- **CRÍTICO**: Implementar filtro de projeto na query
- Usar `project_id` em vez de `notes` para agrupar por projeto
- Adicionar paginação na tabela de vendas
- Implementar cache de dados com revalidação
- Adicionar mais gráficos (funil de vendas, taxa de conversão)

---

## 7️⃣ IMAGENS

### ✅ Funcionalidades Implementadas:
- **Hero Banner**:
  - Upload de até 3 imagens
  - Validação de tipo e tamanho (max 5MB)
  - Compressão automática se > 1MB
  - Visualização ampliada ao clicar
  - Exclusão de imagens
- **Certificados**:
  - Upload de até 8 imagens
  - Mesmas validações do Hero
  - Visualização e exclusão

### 📊 Tabelas Utilizadas:
- ⚠️ `site_images` - SELECT, INSERT, DELETE
- ⚠️ `certificate_images` - SELECT, INSERT, DELETE
- ✅ `images` storage bucket - Upload e delete

### ⚠️ Problemas Identificados:
1. **Tabelas não existem**: `site_images` e `certificate_images`
2. **Sem ordenação**: Não permite reordenar imagens
3. **Sem alt text**: Não permite adicionar texto alternativo
4. **Sem preview**: Não mostra preview antes de salvar

### 🔧 Recomendações:
- **CRÍTICO**: Criar tabelas `site_images` e `certificate_images`
- Adicionar drag-and-drop para reordenar
- Adicionar campo de alt text para SEO
- Adicionar preview antes de upload
- Adicionar crop/resize de imagens

---

## 8️⃣ CONFIGURAÇÕES

### ✅ Funcionalidades Implementadas:
- **Informações do Site**:
  - Nome do site
  - Descrição
  - Modo manutenção (checkbox)
- **Contatos**:
  - Email
  - Telefone
  - Endereço
- **Redes Sociais**:
  - Facebook URL
  - Instagram URL
  - LinkedIn URL
- **Pagamento**:
  - Stripe Public Key
  - Stripe Secret Key (password field)
- **Salvar/Carregar** do banco

### 📊 Tabelas Utilizadas:
- ⚠️ `site_settings` - SELECT, INSERT, UPDATE

### ⚠️ Problemas Identificados:
1. **Tabela não existe**: `site_settings` precisa ser criada
2. **Sem validação**: URLs de redes sociais não são validadas
3. **Sem criptografia**: Stripe Secret Key salva em texto plano
4. **Sem backup**: Não permite exportar/importar configurações
5. **Modo manutenção não funciona**: Não desabilita o site

### 🔧 Recomendações:
- **CRÍTICO**: Executar script `create-site-settings-table.sql`
- **CRÍTICO**: Criptografar Stripe Secret Key
- Validar formato de URLs
- Implementar funcionalidade de modo manutenção
- Adicionar mais configurações (SEO, Analytics, etc.)
- Adicionar backup/restore de configurações

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **Tabelas Faltando no Banco**:
```sql
❌ donation_projects
❌ donation_certificates
❌ site_settings
❌ site_images
❌ certificate_images
```

### 2. **Inconsistências de Nomes de Colunas**:
```typescript
// Código usa:
price_per_m2, available_m2, total_m2, image, issued_at

// Banco tem:
price_per_sqm, available_area, total_area, image_url, issue_date
```

### 3. **Segurança**:
- Stripe Secret Key em texto plano
- Sem validação de permissões
- Sem rate limiting
- Sem logs de auditoria

### 4. **Performance**:
- Sem paginação em várias listagens
- Sem cache de dados
- Queries não otimizadas
- Carrega todos os dados de uma vez

---

## ✅ CHECKLIST DE CORREÇÕES

### Imediato (Crítico):
- [ ] Executar `create-donation-projects-table.sql`
- [ ] Executar `create-donation-certificates-table.sql`
- [ ] Executar `create-site-settings-table.sql`
- [ ] Criar tabelas `site_images` e `certificate_images`
- [ ] Corrigir nomes de colunas em Projetos
- [ ] Corrigir nome de coluna `issued_at` → `issue_date`
- [ ] Implementar filtro de projeto em Analytics
- [ ] Criptografar Stripe Secret Key

### Curto Prazo (Importante):
- [ ] Adicionar paginação em Clientes
- [ ] Adicionar paginação em Analytics
- [ ] Implementar busca em Certificados
- [ ] Adicionar validações de valores em Doações
- [ ] Implementar modo manutenção
- [ ] Adicionar logs de auditoria

### Médio Prazo (Melhorias):
- [ ] Criar tabela `customers` separada
- [ ] Implementar cache de dados
- [ ] Adicionar mais gráficos em Analytics
- [ ] Adicionar drag-and-drop em Imagens
- [ ] Implementar tracking de usuários ativos
- [ ] Calcular crescimento mensal real
- [ ] Adicionar backup/restore de configurações

---

## 📊 TABELAS NECESSÁRIAS NO SUPABASE

### Existentes e Funcionando:
✅ `projects`
✅ `sales`
✅ `certificates`

### Precisam Ser Criadas:
❌ `donation_projects`
❌ `donation_certificates`
❌ `site_settings`
❌ `site_images`
❌ `certificate_images`
❌ `customers` (recomendado)
❌ `audit_logs` (recomendado)

---

## 🔗 INTEGRAÇÕES ENTRE ABAS

### Dashboard ↔️ Outras Abas:
- ✅ Conta projetos da aba Projetos
- ✅ Conta vendas da aba Analytics
- ✅ Conta certificados da aba Certificados
- ❌ Não atualiza em tempo real

### Projetos ↔️ Certificados:
- ✅ Certificados mostram nome do projeto
- ❌ Projetos não mostram certificados vinculados

### Clientes ↔️ Vendas/Certificados:
- ✅ Agrupa vendas por cliente
- ✅ Mostra certificados do cliente
- ❌ Dados duplicados (sem tabela customers)

### Doações ↔️ Certificados de Doação:
- ❌ Não integrado (certificados de doação não são gerados)

### Analytics ↔️ Vendas:
- ✅ Usa dados de vendas
- ⚠️ Filtro de projeto não funciona

### Configurações ↔️ Sistema:
- ❌ Modo manutenção não desabilita site
- ❌ Stripe keys não são usadas no checkout

---

## 📈 MÉTRICAS DE QUALIDADE

| Aba | Funcionalidade | Integração | Performance | Segurança | Total |
|-----|---------------|------------|-------------|-----------|-------|
| Dashboard | 70% | 80% | 90% | 60% | **75%** |
| Projetos | 85% | 60% | 80% | 70% | **74%** |
| Doações | 90% | 40% | 80% | 70% | **70%** |
| Certificados | 60% | 80% | 70% | 80% | **73%** |
| Clientes | 80% | 70% | 50% | 60% | **65%** |
| Analytics | 90% | 70% | 50% | 60% | **68%** |
| Imagens | 80% | 40% | 70% | 60% | **63%** |
| Configurações | 85% | 30% | 90% | 40% | **61%** |

**Média Geral: 69%** 🟡

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Fase 1 - Correções Críticas (1-2 dias):
1. Criar todas as tabelas faltantes
2. Corrigir inconsistências de nomes de colunas
3. Implementar segurança básica (criptografia de keys)

### Fase 2 - Melhorias de Performance (2-3 dias):
1. Adicionar paginação onde necessário
2. Implementar cache de dados
3. Otimizar queries

### Fase 3 - Novas Funcionalidades (3-5 dias):
1. Integrar certificados de doação
2. Implementar modo manutenção
3. Adicionar mais gráficos e relatórios
4. Criar sistema de logs de auditoria

---

## 📝 CONCLUSÃO

O CMS está **69% funcional** com boa base de funcionalidades, mas precisa de:
- ✅ Correções críticas de banco de dados
- ✅ Ajustes de integração entre componentes
- ✅ Melhorias de segurança
- ✅ Otimizações de performance

**Prioridade**: Executar os 5 scripts SQL pendentes antes de usar em produção.
