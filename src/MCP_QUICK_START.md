# ⚡ MCP Quick Start - Banco de Dados MySQL

## 🎯 **O que é o MCP?**

O **MCP (Model Context Protocol)** é uma interface programática robusta que permite acesso direto e seguro ao banco de dados MySQL da Minha Floresta Conservações, sem precisar do phpMyAdmin!

## 🚀 **Setup em 3 Comandos**

### **1. Instalar e Configurar**
```bash
cd mcp
npm run setup
```

### **2. Iniciar Servidor MCP**
```bash
npm start
```

### **3. Testar Funcionamento**
```bash
# Em outro terminal
npm test
```

## ✨ **Resultado Esperado**

```
🚀 Starting MCP MySQL Server...
✅ MCP Server started successfully

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
  "database": "u271208684_minhafloresta",
  "connections": "1"
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

🎉 All tests completed!
```

## 🎮 **Modo Interativo**

Para usar o MCP de forma interativa:

```bash
npm run interactive
```

**Comandos disponíveis:**
```
🎮 MCP Interactive Mode
Available commands:
  - test connection
  - list tables  
  - table stats
  - query <SQL>
  - describe <table>
  - exit

> test connection
✅ Connection test passed

> list tables
📋 Database tables (11):
1. users
2. projects
3. transactions
...

> query SELECT COUNT(*) FROM users
✅ Query executed successfully. 1 rows returned.
Data:
[
  {
    "COUNT(*)": 2
  }
]

> describe projects
🏗️ Table structure for 'projects':
[
  {
    "field": "id",
    "type": "varchar(36)",
    "null": false,
    "key": "PRI",
    "default": null,
    "extra": ""
  },
  ...
]
```

## 🛠️ **Ferramentas Principais**

### **📊 Consultas de Dados**
```bash
# Listar projetos ativos
> query SELECT name, price, available_area FROM projects WHERE status = 'active'

# Contar usuários verificados
> query SELECT COUNT(*) as verified FROM users WHERE email_verified = 1

# Vendas por projeto
> query SELECT p.name, SUM(t.area_purchased) as sold FROM projects p LEFT JOIN transactions t ON p.id = t.project_id GROUP BY p.id
```

### **📋 Informações de Estrutura**
```bash
# Listar todas as tabelas
> list tables

# Ver estrutura de uma tabela
> describe users

# Estatísticas de registros
> table stats
```

### **🔍 Diagnósticos**
```bash
# Testar conexão
> test connection

# Backup de tabela
> backup users
```

## 🔗 **Integração com Aplicações**

### **Node.js Client**
```javascript
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');

// Conectar ao MCP
const client = new Client({ name: 'minha-app', version: '1.0.0' });
await client.connect(transport);

// Executar consulta
const result = await client.request('tools/call', {
  name: 'query_database',
  arguments: {
    sql: 'SELECT * FROM projects WHERE type = ?',
    params: ['reforestation']
  }
});

console.log(result.content[0].text);
```

### **Python Client**
```python
import asyncio
from mcp import ClientSession, StdioServerParameters

async def main():
    server_params = StdioServerParameters(
        command="node",
        args=["mcp/mysql-server.js"]
    )
    
    async with ClientSession(server_params) as session:
        result = await session.call_tool(
            "query_database",
            {"sql": "SELECT COUNT(*) FROM users"}
        )
        print(result.content[0].text)

asyncio.run(main())
```

## 🎯 **Casos de Uso Práticos**

### **1. Dashboard em Tempo Real**
```bash
# Métricas do dashboard
> query SELECT (SELECT COUNT(*) FROM users) as users, (SELECT COUNT(*) FROM projects) as projects, (SELECT SUM(amount) FROM transactions WHERE payment_status = 'completed') as revenue

# Projetos mais vendidos
> query SELECT p.name, SUM(t.area_purchased) as area_sold FROM projects p JOIN transactions t ON p.id = t.project_id WHERE t.payment_status = 'completed' GROUP BY p.id ORDER BY area_sold DESC LIMIT 5
```

### **2. Relatórios Administrativos**
```bash
# Usuários cadastrados por mês
> query SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as users FROM users GROUP BY month ORDER BY month

# Doações por projeto social
> query SELECT sp.title, SUM(d.amount) as total_donated FROM social_projects sp LEFT JOIN donations d ON sp.id = d.social_project_id GROUP BY sp.id
```

### **3. Monitoramento de Vendas**
```bash
# Vendas do último mês
> query SELECT DATE(created_at) as date, COUNT(*) as transactions, SUM(amount) as revenue FROM transactions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND payment_status = 'completed' GROUP BY date

# Projetos com baixo estoque
> query SELECT name, available_area, (available_area / total_area * 100) as percent_available FROM projects WHERE available_area < 1000
```

## 🔐 **Segurança**

### **Proteções Implementadas:**
- ✅ **Apenas consultas SELECT** para operações livres
- ✅ **Prepared statements** contra SQL injection  
- ✅ **Pool de conexões** limitado
- ✅ **Timeouts** de segurança
- ✅ **Validação** de entrada

### **Operações Seguras:**
```bash
# ✅ Permitido - Consultas SELECT
> query SELECT * FROM users WHERE email = 'teste@example.com'

# ❌ Bloqueado - Modificações diretas via query
> query DELETE FROM users  # Erro: Only SELECT queries allowed

# ✅ Permitido - Via ferramentas específicas
# Use: insert_record, update_record, delete_record
```

## 🚨 **Solução de Problemas**

### **MCP não inicia**
```bash
# Verificar dependências
cd mcp
npm install

# Testar conexão banco
cd ../backend  
npm run test-connection
```

### **Erro de conexão**
```bash
❌ MySQL connection error
```
**Soluções:**
1. Verificar internet
2. Testar: `cd backend && npm run test-connection`
3. Verificar credenciais no banco

### **Timeout de consulta**
```bash
❌ Query timeout
```
**Soluções:**
1. Simplificar consulta SQL
2. Adicionar LIMIT às consultas
3. Verificar índices nas tabelas

## 📈 **Próximos Passos**

1. **✅ MCP funcionando** - Você pode consultar o banco diretamente
2. **🔄 Integrar com apps** - Use os exemplos de cliente
3. **📊 Criar dashboards** - Consultas em tempo real
4. **🤖 Automatizar** - Scripts e rotinas automáticas
5. **📚 Explorar** - Ver documentação completa em `mcp/README.md`

---

💚 **Agora você tem acesso direto e programático ao seu banco MySQL!** 🗄️

**Muito mais poderoso que phpMyAdmin para automação e integrações!** 🚀