# 🚀 **EXECUTAR MCP - Passo a Passo**

## **📍 Onde Executar**

Execute todos os comandos a partir da **pasta raiz do projeto** (onde está este arquivo).

## **⚡ Setup Rápido (3 comandos)**

### **1. Instalar dependências do MCP**
```bash
cd mcp
npm install
```

### **2. Iniciar o servidor MCP**
```bash
npm start
```

### **3. Testar funcionamento (novo terminal)**
```bash
# Abrir NOVO terminal na pasta mcp
cd mcp
npm test
```

## **🎮 Modo Interativo**

Para usar o console interativo do MCP:

```bash
cd mcp
npm run interactive
```

**Comandos disponíveis no modo interativo:**
- `test connection` - Testar conexão MySQL
- `list tables` - Listar todas as tabelas
- `table stats` - Estatísticas de registros
- `query SELECT * FROM users LIMIT 5` - Executar consulta
- `describe projects` - Ver estrutura da tabela
- `exit` - Sair

## **🔍 Verificação Completa**

Execute esta sequência para verificar tudo:

```bash
# 1. Ir para pasta MCP
cd mcp

# 2. Instalar dependências
npm install

# 3. Verificar se backend está funcionando
cd ../backend
npm run test-connection

# 4. Voltar para MCP
cd ../mcp

# 5. Iniciar servidor MCP
npm start
```

**Em outro terminal:**
```bash
cd mcp
npm test
```

## **✅ Resultado Esperado**

Você deve ver algo assim:

```
🚀 Starting MCP MySQL Server...
✅ MCP Server started successfully - MySQL connection established

🧪 Running MCP MySQL Server Tests
==================================================

🛠️ Testing available tools...
✅ Tools list retrieved
Found 9 tools:
   1. query_database - Execute a SELECT query on the database
   2. insert_record - Insert a new record into a table
   3. update_record - Update records in a table
   4. delete_record - Delete records from a table
   5. list_tables - List all tables in the database
   6. describe_table - Get detailed information about a table structure
   7. get_table_stats - Get statistics for all tables
   8. backup_table - Create a backup of table data
   9. test_connection - Test database connection and get server info

🔍 Testing database connection...
✅ Connection test passed
Database connection test successful:
{
  "status": "Connected",
  "version": "MySQL 8.0.35",
  "current_time": "2024-12-19 15:30:45",
  "host": "sql10.freesqldatabase.com",
  "database": "u271208684_minhafloresta"
}

📋 Testing list tables...
✅ List tables passed
Database tables (11):
1. audit_log
2. carbon_calculations
3. certificates
4. contact_messages
5. donations
6. projects
7. shopping_cart
8. social_projects
9. system_settings
10. transactions
11. users

📊 Testing table statistics...
✅ Table stats passed
Database statistics:
[
  {
    "table": "audit_log",
    "records": 0
  },
  {
    "table": "carbon_calculations", 
    "records": 0
  },
  {
    "table": "certificates",
    "records": 0
  },
  {
    "table": "contact_messages",
    "records": 0
  },
  {
    "table": "donations",
    "records": 0
  },
  {
    "table": "projects",
    "records": 4
  },
  {
    "table": "shopping_cart",
    "records": 0
  },
  {
    "table": "social_projects",
    "records": 3
  },
  {
    "table": "system_settings",
    "records": 5
  },
  {
    "table": "transactions",
    "records": 0
  },
  {
    "table": "users",
    "records": 2
  }
]

🏗️ Testing describe table (users)...
✅ Describe table passed

🔍 Testing database query...
✅ Query test passed
Query executed successfully. 1 rows returned.

🌱 Testing projects query...
✅ Projects query passed
Query executed successfully. 3 rows returned.

==================================================
🎉 All tests completed!
🔚 MCP Server stopped
```

## **🎯 Consultas de Exemplo**

No modo interativo, teste essas consultas:

```sql
-- Ver todos os projetos
query SELECT name, type, price, available_area FROM projects

-- Contar usuários
query SELECT COUNT(*) as total_users FROM users

-- Ver projetos sociais
query SELECT title, description, goal_amount FROM social_projects

-- Configurações do sistema
query SELECT setting_key, setting_value FROM system_settings

-- Estatísticas gerais
query SELECT 
  (SELECT COUNT(*) FROM users) as usuarios,
  (SELECT COUNT(*) FROM projects) as projetos,
  (SELECT COUNT(*) FROM social_projects) as projetos_sociais
```

## **🚨 Solução de Problemas**

### **❌ "npm: command not found"**
Instale Node.js: https://nodejs.org/

### **❌ "Error: connect ENOTFOUND"**
```bash
# Testar conexão backend primeiro
cd backend
npm run test-connection
```

### **❌ "Server failed to start"**
```bash
# Verificar se porta está livre
netstat -an | grep 3306

# Reinstalar dependências
rm -rf node_modules
npm install
```

### **❌ "Module not found"**
```bash
# Instalar dependências MCP
cd mcp
npm install

# Verificar se está na pasta correta
pwd  # Deve mostrar .../mcp
ls   # Deve mostrar package.json
```

## **📊 Status das Tabelas**

Após executar, você terá acesso a estas tabelas:

| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| users | 2 | Usuários cadastrados |
| projects | 4 | Projetos de reflorestamento |
| social_projects | 3 | Projetos sociais |
| system_settings | 5 | Configurações do sistema |
| transactions | 0 | Transações (vazio) |
| certificates | 0 | Certificados (vazio) |
| donations | 0 | Doações (vazio) |
| carbon_calculations | 0 | Cálculos CO2 (vazio) |
| shopping_cart | 0 | Carrinho (vazio) |
| contact_messages | 0 | Mensagens (vazio) |
| audit_log | 0 | Log de auditoria (vazio) |

## **🎉 Próximos Passos**

1. **✅ MCP funcionando** - Acesso direto ao MySQL
2. **🔄 Integrar no frontend** - Conectar com React
3. **📊 Criar dashboards** - Métricas em tempo real
4. **🤖 Automatizar** - Scripts de backup e relatórios

---

💚 **Execute agora e tenha controle total do seu banco de dados!** 🗄️