#!/usr/bin/env node

/**
 * Configuração para executar MCP localmente conectando ao MySQL da Hostinger
 */

const fs = require('fs');
const path = require('path');

// Configuração para conexão remota com Hostinger
const hostingerRemoteConfig = {
  // MySQL da Hostinger (já configurado)
  mysql: {
    host: 'sql10.freesqldatabase.com',
    user: 'u271208684_minhafloresta',
    password: 'B7Jz/vu~4s|Q',
    database: 'u271208684_minhafloresta',
    port: 3306,
    connectionLimit: 5,
    acquireTimeout: 30000,
    timeout: 30000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  },
  
  // Configuração do MCP local
  mcp: {
    port: 3001,
    host: 'localhost',
    cors: true,
    allowOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://minhafloresta.ampler.me',
      'https://*.ampler.me'
    ]
  },
  
  // Configuração de segurança
  security: {
    maxQueryTime: 30000,
    maxConnections: 5,
    rateLimitRequests: 100,
    rateLimitWindow: 60000
  }
};

function createRemoteConfigFile() {
  const configPath = path.join(__dirname, 'remote-config.json');
  
  console.log('🌐 CONFIGURAÇÃO MCP → HOSTINGER REMOTO');
  console.log('=' .repeat(50));
  
  // Salvar configuração
  fs.writeFileSync(configPath, JSON.stringify(hostingerRemoteConfig, null, 2));
  
  console.log('✅ Configuração criada:', configPath);
  console.log('');
  console.log('📊 CONFIGURAÇÃO:');
  console.log('┌─────────────────────────────────────────┐');
  console.log(`│ MySQL Host: ${hostingerRemoteConfig.mysql.host.padEnd(22)} │`);
  console.log(`│ Database: ${hostingerRemoteConfig.mysql.database.padEnd(24)} │`);
  console.log(`│ MCP Port: ${hostingerRemoteConfig.mcp.port.toString().padEnd(28)} │`);
  console.log(`│ Max Connections: ${hostingerRemoteConfig.mysql.connectionLimit.toString().padEnd(17)} │`);
  console.log('└─────────────────────────────────────────┘');
  
  console.log('');
  console.log('🚀 COMO USAR:');
  console.log('');
  console.log('1️⃣ No seu COMPUTADOR LOCAL:');
  console.log('   cd mcp');
  console.log('   npm install');
  console.log('   npm run remote-start');
  console.log('');
  console.log('2️⃣ TESTAR conexão:');
  console.log('   npm run remote-test');
  console.log('');
  console.log('3️⃣ MODO INTERATIVO:');
  console.log('   npm run remote-interactive');
  console.log('');
  console.log('📱 FRONTEND conecta em:');
  console.log('   http://localhost:3001 (MCP local)');
  console.log('   ↕️');
  console.log(`   ${hostingerRemoteConfig.mysql.host} (MySQL Hostinger)`);
  console.log('');
  console.log('🌍 VANTAGENS:');
  console.log('   ✅ Funciona mesmo sem Node.js no servidor');
  console.log('   ✅ Acesso total ao MySQL da Hostinger');
  console.log('   ✅ Interface MCP completa');
  console.log('   ✅ Desenvolvimento local com dados remotos');
  console.log('   ✅ Deploy do frontend na Hostinger');
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('   - Frontend fica na Hostinger');
  console.log('   - MCP roda no seu computador');
  console.log('   - MySQL fica na Hostinger');
  console.log('   - Melhor dos dois mundos!');
  
  return configPath;
}

function updatePackageJsonScripts() {
  const packagePath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Adicionar scripts para conexão remota
    packageJson.scripts = {
      ...packageJson.scripts,
      'remote-start': 'node mysql-server.js --remote',
      'remote-test': 'node test-mcp.js --remote',
      'remote-interactive': 'node test-mcp.js --remote --interactive',
      'hostinger-remote': 'node hostinger-remote-config.js'
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Scripts adicionados ao package.json');
  }
}

function createRemoteStartScript() {
  const serverContent = `#!/usr/bin/env node

/**
 * MCP Server configurado para conectar remotamente ao MySQL da Hostinger
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Carregar configuração remota
const configPath = path.join(__dirname, 'remote-config.json');
let config;

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.error('🌐 Usando configuração remota para Hostinger');
} else {
  console.error('❌ Arquivo remote-config.json não encontrado');
  console.error('💡 Execute: npm run hostinger-remote');
  process.exit(1);
}

// Usar configuração remota
const DB_CONFIG = config.mysql;

console.error('🔗 Conectando ao MySQL da Hostinger...');
console.error(\`📡 Host: \${DB_CONFIG.host}\`);
console.error(\`🗄️  Database: \${DB_CONFIG.database}\`);

// Resto do código igual ao mysql-server.js original...
// (importar o código do mysql-server.js aqui)

// Adaptar para aceitar argumentos --remote
const isRemoteMode = process.argv.includes('--remote');

if (isRemoteMode) {
  console.error('🌐 MCP Server em modo REMOTO - conectando à Hostinger');
}

// Continue com o servidor MCP normal...
`;

  const remoteServerPath = path.join(__dirname, 'mysql-server-remote.js');
  fs.writeFileSync(remoteServerPath, serverContent);
  console.log('✅ Servidor remoto criado:', remoteServerPath);
}

// Executar configuração
function main() {
  console.log('🎯 CONFIGURANDO MCP PARA HOSTINGER REMOTO...\n');
  
  const configFile = createRemoteConfigFile();
  updatePackageJsonScripts();
  // createRemoteStartScript();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 CONFIGURAÇÃO REMOTA PRONTA!');
  console.log('=' .repeat(50));
  console.log('');
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('');
  console.log('1️⃣ No seu COMPUTADOR (não no servidor):');
  console.log('   cd mcp');
  console.log('   npm install');
  console.log('   npm start  # Conecta ao MySQL da Hostinger');
  console.log('');
  console.log('2️⃣ TESTAR:');
  console.log('   npm test  # Testa conexão remota');
  console.log('');
  console.log('3️⃣ FRONTEND na Hostinger:');
  console.log('   - Upload dos arquivos React');
  console.log('   - Configurar para conectar ao MCP local');
  console.log('');
  console.log('💡 RESULTADO:');
  console.log('   ✅ Frontend na Hostinger (rápido)');
  console.log('   ✅ MCP no seu computador (poderoso)');
  console.log('   ✅ MySQL na Hostinger (confiável)');
  
  return configFile;
}

module.exports = { hostingerRemoteConfig, createRemoteConfigFile };

if (require.main === module) {
  main();
}`;