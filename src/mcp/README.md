# 🚀 MCP MySQL Server - Minha Floresta Conservações

**Model Context Protocol (MCP) server para acesso programático ao banco de dados MySQL da plataforma Minha Floresta Conservações.**

## 🎯 **O que é este MCP?**

Este MCP (Model Context Protocol) fornece uma interface robusta e segura para:

- ✅ **Acesso direto ao MySQL** via protocolo padronizado
- ✅ **Operações CRUD completas** (Create, Read, Update, Delete)
- ✅ **Consultas SQL seguras** com proteção contra injection
- ✅ **Monitoramento em tempo real** do banco de dados
- ✅ **Backup e estatísticas** automáticas
- ✅ **Interface programática** para integrações

## 🛠️ **Ferramentas Disponíveis**

### 📊 **Consultas e Análise**
- `query_database` - Executar consultas SELECT
- `list_tables` - Listar todas as tabelas
- `describe_table` - Estrutura detalhada de tabelas
- `get_table_stats` - Estatísticas de registros
- `test_connection` - Testar conectividade

### 📝 **Operações CRUD**
- `insert_record` - Inserir novos registros
- `update_record` - Atualizar registros existentes
- `delete_record` - Deletar registros

### 🔧 **Utilitários**
- `backup_table` - Backup completo de tabelas
- `test_connection` - Diagnóstico de conexão

## 🚀 **Instalação e Uso**

### **1. Instalar Dependências**
```bash
cd mcp
npm install
```

### **2. Iniciar o Servidor MCP**
```bash
npm start
```

### **3. Testar Funcionamento**
```bash
npm test
```

### **4. Modo Interativo**
```bash
node test-mcp.js --interactive
```

## 🔐 **Configuração de Segurança**

### **Proteções Implementadas:**
- ✅ **Apenas SELECT** para consultas livres
- ✅ **Prepared statements** para prevenir SQL injection
- ✅ **Validação de entrada** em todas as operações
- ✅ **Pool de conexões** limitado (máx. 10)
- ✅ **Timeout de segurança** (60 segundos)

### **Credenciais (já configuradas):**
```javascript
host: 'sql10.freesqldatabase.com'
user: 'u271208684_minhafloresta'
database: 'u271208684_minhafloresta'
```

## 📖 **Exemplos de Uso**

### **Via Interface MCP (Recomendado)**

```bash
# Iniciar servidor
npm start

# Em outro terminal, testar
npm test
```

### **Consultas de Exemplo**

#### **Listar Projetos**
```sql
SELECT name, type, price, available_area 
FROM projects 
WHERE status = 'active'
```

#### **Estatísticas de Usuários**
```sql
SELECT COUNT(*) as total_users, 
       COUNT(CASE WHEN email_verified = 1 THEN 1 END) as verified_users
FROM users
```

#### **Vendas por Projeto**
```sql
SELECT p.name, SUM(t.area_purchased) as total_sold, SUM(t.amount) as revenue
FROM projects p
LEFT JOIN transactions t ON p.id = t.project_id
WHERE t.payment_status = 'completed'
GROUP BY p.id
```

## 🧪 **Testes Automatizados**

### **Executar Todos os Testes**
```bash
npm test
```

### **Modo Interativo**
```bash
node test-mcp.js -i
```

**Comandos disponíveis no modo interativo:**
```
test connection    - Testar conexão
list tables        - Listar tabelas
table stats        - Estatísticas
query <SQL>        - Executar consulta
describe <table>   - Estrutura da tabela
exit              - Sair
```

## 🔌 **Integração com Aplicações**

### **Cliente Node.js**
```javascript
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

const client = new Client({
  name: 'minha-floresta-client',
  version: '1.0.0'
});

// Conectar ao servidor MCP
const transport = new StdioClientTransport({
  command: 'node',
  args: ['mcp/mysql-server.js']
});

await client.connect(transport);

// Executar consulta
const result = await client.request('tools/call', {
  name: 'query_database',
  arguments: {
    sql: 'SELECT * FROM projects WHERE type = ?',
    params: ['reforestation']
  }
});
```

### **Via CLI (usando MCP CLI)**
```bash
# Instalar MCP CLI
npm run install-mcp

# Usar o servidor
mcp connect minha-floresta-mcp
```

## 📊 **Monitoramento e Logs**

### **Logs de Conexão**
- ✅ Startup do servidor
- ✅ Status de conexão MySQL
- ✅ Operações executadas
- ✅ Erros e warnings

### **Health Check**
```bash
# Via MCP
tools/call test_connection

# Resposta esperada:
{
  "status": "Connected",
  "version": "MySQL 8.0.x",
  "host": "sql10.freesqldatabase.com",
  "database": "u271208684_minhafloresta"
}
```

## 🔄 **Backup e Restore**

### **Backup via MCP**
```bash
tools/call backup_table {"table": "users"}
tools/call backup_table {"table": "projects"}
```

### **Backup Completo**
```bash
# Script personalizado para backup completo
node scripts/full-backup.js
```

## 🚨 **Solução de Problemas**

### **Erro de Conexão**
```bash
❌ MySQL connection error
```
**Solução:**
1. Verificar internet
2. Confirmar credenciais
3. Testar `npm run test-connection` no backend

### **MCP Server não inicia**
```bash
❌ Server failed to start
```
**Solução:**
1. Verificar Node.js >= 18
2. `npm install` para dependências
3. Verificar porta não está em uso

### **Timeout de Consulta**
```bash
❌ Query timeout
```
**Solução:**
1. Otimizar consulta SQL
2. Verificar índices nas tabelas
3. Reduzir tamanho do resultado

## 📈 **Performance**

### **Otimizações Implementadas:**
- ✅ **Pool de conexões** (máx. 10 simultâneas)
- ✅ **Prepared statements** (cache de queries)
- ✅ **Timeout inteligente** (60s)
- ✅ **Reconexão automática**
- ✅ **Logs de performance**

### **Métricas Típicas:**
- **Conexão:** ~100-300ms
- **Consulta simples:** ~10-50ms
- **Consulta complexa:** ~100-500ms
- **Inserção:** ~20-100ms

## 🌍 **Casos de Uso**

### **1. Dashboard Administrativo**
- Métricas em tempo real
- Relatórios de vendas
- Gestão de usuários

### **2. Integrações de API**
- Sincronização de dados
- Webhooks automatizados
- ETL processes

### **3. Análise de Dados**
- Business Intelligence
- Relatórios personalizados
- Data mining

### **4. Automação**
- Backups automáticos
- Limpeza de dados
- Migração de dados

## 📞 **Suporte**

### **Logs e Debugging**
```bash
# Logs detalhados
DEBUG=* npm start

# Teste específico
node test-mcp.js --verbose
```

### **Contato**
- 📧 **Email:** dev@minhaflorestaconservacoes.com
- 📚 **Docs:** Ver `/backend/DATABASE_SETUP.md`
- 🐛 **Issues:** Reportar via sistema interno

---

💚 **MCP Server - Conectando sua floresta digital ao mundo!** 🌳