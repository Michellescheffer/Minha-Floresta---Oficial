#!/usr/bin/env node

/**
 * Configuração específica para Hostinger
 * Detecta automaticamente o ambiente e ajusta configurações
 */

const fs = require('fs');
const path = require('path');

// Detectar ambiente Hostinger
function detectHostingerEnvironment() {
  const env = {
    hasNodeJS: false,
    hasSSH: false,
    hasCPanel: false,
    isVPS: false,
    isShared: false,
    path: process.cwd()
  };

  // Verificar Node.js
  try {
    env.hasNodeJS = process.version && process.version.startsWith('v');
  } catch (e) {
    env.hasNodeJS = false;
  }

  // Verificar se é VPS (presença de sudo/root)
  try {
    env.isVPS = fs.existsSync('/etc/passwd') && process.getuid && process.getuid() === 0;
  } catch (e) {
    env.isVPS = false;
  }

  // Verificar cPanel (presença de diretórios típicos)
  env.hasCPanel = fs.existsSync('/home') && fs.existsSync('/public_html');

  // Verificar SSH (variáveis de ambiente típicas)
  env.hasSSH = !!(process.env.SSH_CLIENT || process.env.SSH_TTY);

  // Determinar tipo de hospedagem
  if (env.isVPS) {
    env.type = 'VPS';
  } else if (env.hasCPanel) {
    env.type = 'cPanel';
  } else if (env.hasNodeJS) {
    env.type = 'Cloud';
  } else {
    env.type = 'Shared';
    env.isShared = true;
  }

  return env;
}

// Configurações específicas por ambiente
function getHostingerConfig(env) {
  const baseConfig = {
    host: 'sql10.freesqldatabase.com',
    user: 'u271208684_minhafloresta',
    password: 'B7Jz/vu~4s|Q',
    database: 'u271208684_minhafloresta',
    port: 3306
  };

  const configs = {
    VPS: {
      ...baseConfig,
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      port: process.env.MCP_PORT || 8080
    },
    
    Cloud: {
      ...baseConfig,
      connectionLimit: 5,
      acquireTimeout: 30000,
      timeout: 30000,
      port: process.env.PORT || 8080
    },
    
    cPanel: {
      ...baseConfig,
      connectionLimit: 3,
      acquireTimeout: 20000,
      timeout: 20000,
      port: 8080
    },
    
    Shared: {
      ...baseConfig,
      connectionLimit: 1,
      acquireTimeout: 10000,
      timeout: 10000,
      // Hospedagem compartilhada normalmente não suporta MCP
      warning: 'MCP pode não funcionar em hospedagem compartilhada sem Node.js'
    }
  };

  return configs[env.type] || configs.Shared;
}

// Gerar instruções específicas
function generateInstructions(env, config) {
  const instructions = {
    VPS: `
🟢 HOSTINGER VPS DETECTADO

✅ Ambiente compatível com MCP!

Comandos para executar:

1. Setup (só uma vez):
   cd mcp
   npm install
   
2. Executar MCP:
   npm start
   
3. Executar em background:
   npm install -g pm2
   pm2 start npm --name "mcp-minha-floresta" -- start
   pm2 save
   pm2 startup
   
4. Verificar status:
   pm2 status
   pm2 logs mcp-minha-floresta

🌐 MCP estará disponível na porta: ${config.port}
`,

    Cloud: `
🔵 HOSTINGER CLOUD DETECTADO

✅ Ambiente compatível com MCP!

Comandos para executar:

1. Setup:
   cd mcp
   npm install
   
2. Executar:
   npm start
   
🌐 MCP estará disponível na porta: ${config.port}
`,

    cPanel: `
🟡 HOSTINGER cPANEL DETECTADO

Passos para configurar MCP:

1. No cPanel → Software → Setup Node.js App
2. Criar nova aplicação:
   - Node.js version: Latest
   - Application root: mcp
   - Application URL: mcp.seudominio.com
   
3. Upload arquivos MCP para pasta da aplicação
4. No terminal da aplicação:
   npm install
   npm start

⚠️ Verifique se sua hospedagem suporta Node.js Apps
`,

    Shared: `
🔴 HOSTINGER HOSPEDAGEM COMPARTILHADA

❌ MCP não funcionará diretamente

Alternativas:

1. 💻 EXECUTAR LOCALMENTE:
   - No seu computador: cd mcp && npm install && npm start
   - Conecta ao MySQL remoto da Hostinger
   
2. 📊 USAR APENAS phpMyAdmin:
   - Acesse: sql10.freesqldatabase.com/phpmyadmin
   - Use os scripts SQL em /backend/scripts/
   
3. 🚀 UPGRADE PARA VPS:
   - Hostinger VPS: ~$3.99/mês
   - Suporte completo ao Node.js e MCP
   
4. 🔄 USAR APENAS BACKEND:
   - Upload dos scripts em /backend/ 
   - Execute via SSH se disponível

${config.warning ? '⚠️ ' + config.warning : ''}
`
  };

  return instructions[env.type] || instructions.Shared;
}

// Executar detecção
function main() {
  console.log('🔍 DETECTANDO AMBIENTE HOSTINGER...\n');
  
  const env = detectHostingerEnvironment();
  const config = getHostingerConfig(env);
  
  console.log('📊 AMBIENTE DETECTADO:');
  console.log('┌─────────────────────────────────────┐');
  console.log(`│ Tipo: ${env.type.padEnd(30)} │`);
  console.log(`│ Node.js: ${(env.hasNodeJS ? '✅ Disponível' : '❌ Não encontrado').padEnd(25)} │`);
  console.log(`│ SSH: ${(env.hasSSH ? '✅ Disponível' : '❌ Não detectado').padEnd(29)} │`);
  console.log(`│ cPanel: ${(env.hasCPanel ? '✅ Detectado' : '❌ Não encontrado').padEnd(26)} │`);
  console.log(`│ VPS: ${(env.isVPS ? '✅ Detectado' : '❌ Hospedagem padrão').padEnd(29)} │`);
  console.log('└─────────────────────────────────────┘');
  
  const instructions = generateInstructions(env, config);
  console.log(instructions);
  
  // Salvar configuração
  const configPath = path.join(__dirname, 'hostinger-detected-config.json');
  fs.writeFileSync(configPath, JSON.stringify({ env, config }, null, 2));
  console.log(`\n💾 Configuração salva em: ${configPath}`);
  
  return { env, config };
}

// Exportar para uso em outros scripts
module.exports = { detectHostingerEnvironment, getHostingerConfig, generateInstructions };

// Executar se chamado diretamente
if (require.main === module) {
  main();
}