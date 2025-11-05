# 🚀 GUIA RÁPIDO DE CORREÇÃO - Minha Floresta Conservações

## ⚡ CORREÇÕES APLICADAS AUTOMATICAMENTE

✅ **URL da API Corrigida** - `/utils/database.ts` atualizado para usar a URL correta do Edge Function

---

## 🔧 CORREÇÕES MANUAIS NECESSÁRIAS

### 1️⃣ DEPLOY DAS EDGE FUNCTIONS (5 minutos)

**Comandos necessários:**

```bash
# 1. Fazer login no Supabase (se ainda não estiver logado)
npx supabase login

# 2. Linkar o projeto
npx supabase link --project-ref ngnybwsovjignsflrhyr

# 3. Deploy da função principal
npx supabase functions deploy server

# 4. Verificar se deployou
npx supabase functions list

# 5. Testar endpoint
curl https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/status
```

**Resultado esperado:**
```json
{
  "status": "operational",
  "connected": true,
  "timestamp": "2025-11-03T...",
  "database": "hybrid_connected",
  "supabase": "connected",
  "kv_store": "operational",
  "version": "2.0.0-hybrid"
}
```

---

### 2️⃣ APLICAR SCHEMA DO BANCO (3 minutos)

**Opção A - Via Supabase CLI (Recomendado):**

```bash
# Aplicar migration
npx supabase db push

# Verificar se aplicou
npx supabase db list
```

**Opção B - Via Dashboard:**

1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/editor
2. Clique em **SQL Editor** > **New Query**
3. Copie todo conteúdo de `/supabase/migrations/001_initial_schema.sql`
4. Cole no editor
5. Clique em **Run** (ou Ctrl+Enter)
6. Aguarde mensagem de sucesso: "✅ Todas as 15 tabelas foram criadas com sucesso!"

**Verificar se funcionou:**

```sql
-- Cole no SQL Editor e execute:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Deve retornar 15 tabelas:**
- app_settings
- audit_logs
- carbon_calculations
- cart_items
- certificate_verifications
- certificates
- donations
- notifications
- project_images
- projects
- purchase_items
- purchases
- social_projects
- usage_analytics
- user_profiles

---

### 3️⃣ VERIFICAÇÃO E TESTES (2 minutos)

**Teste 1: Edge Function está respondendo?**

```bash
curl https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/test
```

**Resultado esperado:**
```json
{
  "message": "Server is working!",
  "timestamp": "2025-11-03T...",
  "status": "ok"
}
```

**Teste 2: Projetos endpoint está funcionando?**

```bash
curl https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/projects
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": [],
  "count": 0,
  "source": "hybrid"
}
```

**Teste 3: Tabelas foram criadas?**

Acesse o dashboard:
https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/database/tables

Você deve ver as 15 tabelas listadas.

---

## 🎯 APÓS AS CORREÇÕES

### Criar Projeto de Teste via CMS

1. Acesse a aplicação
2. Faça login como admin
3. Vá para `/cms`
4. Clique em "Criar Novo Projeto"
5. Preencha os dados:
   - Nome: "Projeto Teste Amazônia"
   - Categoria: "reforestation"
   - Status: "active"
   - Área Total: 10000 m²
   - Preço por m²: R$ 25,00
   - Localização: Brasil, Amazonas, Manaus
6. Salve e verifique se aparece na listagem

### Testar Fluxo Completo

1. **Loja**: Acesse `/loja` - Deve mostrar o projeto criado
2. **Adicionar ao carrinho**: Selecione área (ex: 100 m²)
3. **Carrinho**: Verifique `/carrinho` - Item deve aparecer
4. **Calculadora**: Teste `/calculadora-pegada` - Deve calcular CO2
5. **Checkout**: Simule compra (não precisa completar pagamento)

---

## 🔍 COMANDOS DE DIAGNÓSTICO

### Ver logs das Edge Functions em tempo real:

```bash
npx supabase functions logs server --tail
```

### Verificar conexão com Supabase:

```bash
npx supabase status
```

### Ver configurações do projeto:

```bash
npx supabase projects list
```

### Executar query no banco:

```bash
npx supabase db query "SELECT COUNT(*) FROM projects;"
```

---

## ❌ TROUBLESHOOTING

### Problema: "Function not found"

**Solução:**
```bash
# Re-deploy da função
npx supabase functions deploy server --no-verify-jwt

# Verificar logs
npx supabase functions logs server
```

### Problema: "Table does not exist"

**Solução:**
```bash
# Re-aplicar migration
npx supabase db reset

# Ou aplicar manualmente via Dashboard SQL Editor
```

### Problema: "CORS error"

**Solução:** Já configurado na função, mas se persistir:
```typescript
// Arquivo já está correto em /supabase/functions/server/index.tsx
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));
```

### Problema: "Authentication required"

**Solução:**
```bash
# Verificar se SUPABASE_SERVICE_ROLE_KEY está configurada
npx supabase secrets list

# Se não estiver, adicionar:
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

---

## 📊 STATUS PÓS-CORREÇÃO

Após executar os passos acima, você deve ter:

- ✅ Edge Functions deployadas e respondendo
- ✅ 15 tabelas criadas no PostgreSQL
- ✅ URL da API corrigida no código
- ✅ Sistema híbrido funcionando (Supabase + IndexedDB)
- ✅ CMS funcional para criar/editar projetos
- ✅ Fluxo de compra operacional
- ✅ Sistema de certificados pronto
- ✅ Calculadora de pegada funcionando
- ✅ Sincronização online/offline ativa

---

## 🎉 PRÓXIMOS PASSOS (Opcional)

### Popular com Dados Reais

1. Criar 5-10 projetos via CMS
2. Adicionar imagens reais dos projetos
3. Configurar projetos sociais
4. Testar certificados completos

### Configurar Pagamentos

1. Configurar conta Stripe
2. Adicionar chaves de API
3. Testar fluxo de pagamento real

### Monitoramento

1. Configurar alertas no Supabase
2. Adicionar Google Analytics
3. Monitorar performance

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Verifique o relatório completo:** `/SUPABASE_DEBUG_REPORT.md`
2. **Consulte os logs:** `npx supabase functions logs server`
3. **Teste componente por componente:** Use `/dashboard` para diagnósticos
4. **Verificar status do sistema:** Componente `<SystemHealthCheck />` no dashboard

---

## ⏱️ TEMPO ESTIMADO TOTAL

- **Deploy Edge Functions:** 5 minutos
- **Aplicar Schema:** 3 minutos
- **Testes e Verificação:** 2 minutos
- **TOTAL:** ~10 minutos

---

**Última atualização:** 03/11/2025  
**Versão do sistema:** 2.0.0-hybrid  
**Status:** Pronto para deploy
