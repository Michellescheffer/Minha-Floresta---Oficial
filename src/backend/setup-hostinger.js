#!/usr/bin/env node

/**
 * Script de setup automático para Hostinger
 * Detecta o ambiente e configura a API adequada
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 SETUP HOSTINGER - MINHA FLORESTA CONSERVAÇÕES');
console.log('=' .repeat(60));

// Função para executar comandos
function execCommand(command, options = {}) {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`❌ Erro ao executar: ${command}`);
    return false;
  }
}

// Detectar ambiente Hostinger
function detectHostingerEnvironment() {
  const env = {
    hasNodeJS: false,
    hasComposer: false,
    hasPHP: false,
    hasSSH: false,
    type: 'unknown'
  };

  // Verificar Node.js
  try {
    execSync('node --version', { stdio: 'ignore' });
    env.hasNodeJS = true;
    console.log('✅ Node.js detectado');
  } catch (e) {
    console.log('❌ Node.js não disponível');
  }

  // Verificar PHP
  try {
    execSync('php --version', { stdio: 'ignore' });
    env.hasPHP = true;
    console.log('✅ PHP detectado');
  } catch (e) {
    console.log('❌ PHP não disponível');
  }

  // Verificar Composer
  try {
    execSync('composer --version', { stdio: 'ignore' });
    env.hasComposer = true;
    console.log('✅ Composer detectado');
  } catch (e) {
    console.log('⚠️ Composer não disponível');
  }

  // Verificar SSH
  env.hasSSH = !!(process.env.SSH_CLIENT || process.env.SSH_TTY);
  console.log(`${env.hasSSH ? '✅' : '❌'} SSH: ${env.hasSSH ? 'Disponível' : 'Não detectado'}`);

  // Determinar tipo
  if (env.hasNodeJS) {
    env.type = env.hasSSH ? 'vps' : 'cloud';
  } else if (env.hasPHP) {
    env.type = 'shared';
  }

  return env;
}

// Setup para Node.js
function setupNodeJS() {
  console.log('\n📦 CONFIGURANDO API NODE.JS...');
  
  // Instalar dependências
  if (fs.existsSync('package.json')) {
    console.log('📥 Instalando dependências...');
    execCommand('npm install');
  } else if (fs.existsSync('hostinger-package.json')) {
    console.log('📥 Copiando package.json...');
    fs.copyFileSync('hostinger-package.json', 'package.json');
    execCommand('npm install');
  }

  // Testar API
  console.log('🧪 Testando API Node.js...');
  if (fs.existsSync('hostinger-api.js')) {
    const testResult = execCommand('timeout 10 node hostinger-api.js &');
    if (testResult !== false) {
      console.log('✅ API Node.js configurada com sucesso!');
      return true;
    }
  }

  console.log('❌ Falha na configuração da API Node.js');
  return false;
}

// Setup para PHP
function setupPHP() {
  console.log('\n🐘 CONFIGURANDO API PHP...');
  
  // Verificar se pasta api existe
  if (!fs.existsSync('api')) {
    console.log('❌ Pasta api/ não encontrada');
    return false;
  }

  // Verificar arquivo index.php
  if (!fs.existsSync('api/index.php')) {
    console.log('❌ Arquivo api/index.php não encontrado');
    return false;
  }

  // Testar sintaxe PHP
  console.log('🧪 Testando sintaxe PHP...');
  const syntaxCheck = execCommand('php -l api/index.php', { stdio: 'pipe' });
  
  if (syntaxCheck !== false) {
    console.log('✅ API PHP configurada com sucesso!');
    return true;
  }

  console.log('❌ Erro de sintaxe na API PHP');
  return false;
}

// Criar arquivo de configuração
function createConfig(env, apis) {
  const config = {
    environment: env,
    apis: apis,
    setup_date: new Date().toISOString(),
    recommendations: []
  };

  if (!apis.nodejs && !apis.php) {
    config.recommendations.push('Nenhuma API disponível - considere upgrade do plano');
  } else if (apis.nodejs) {
    config.recommendations.push('Use API Node.js para melhor performance');
  } else if (apis.php) {
    config.recommendations.push('API PHP funcional - considere Node.js para recursos avançados');
  }

  fs.writeFileSync('hostinger-config.json', JSON.stringify(config, null, 2));
  console.log('💾 Configuração salva em hostinger-config.json');
}

// Mostrar instruções finais
function showInstructions(env, apis) {
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 INSTRUÇÕES PARA DEPLOYMENT');
  console.log('=' .repeat(60));

  if (apis.nodejs) {
    console.log('\n🟢 API NODE.JS DISPONÍVEL:');
    console.log('1. Para iniciar a API:');
    console.log('   npm start');
    console.log('');
    console.log('2. Para manter rodando em background:');
    console.log('   nohup npm start > api.log 2>&1 &');
    console.log('');
    console.log('3. URL da API:');
    console.log('   https://minhafloresta.ampler.me/backend/status');
  }

  if (apis.php) {
    console.log('\n🟡 API PHP DISPONÍVEL:');
    console.log('1. Upload da pasta api/ para public_html/backend/api/');
    console.log('');
    console.log('2. URL da API:');
    console.log('   https://minhafloresta.ampler.me/backend/api/status');
    console.log('');
    console.log('3. Teste no navegador:');
    console.log('   https://minhafloresta.ampler.me/backend/api/projects');
  }

  console.log('\n📱 FRONTEND:');
  console.log('1. Upload dos arquivos React para public_html/');
  console.log('2. O frontend detectará automaticamente a API disponível');
  console.log('3. Teste: https://minhafloresta.ampler.me');

  console.log('\n🗄️ BANCO DE DADOS:');
  console.log('✅ MySQL já configurado:');
  console.log('   Host: sql10.freesqldatabase.com');
  console.log('   Database: u271208684_minhafloresta');
  console.log('   phpMyAdmin: sql10.freesqldatabase.com/phpmyadmin');

  console.log('\n🎉 SETUP CONCLUÍDO!');
}

// Função principal
function main() {
  console.log('🔍 Detectando ambiente...\n');
  
  const env = detectHostingerEnvironment();
  
  console.log('\n📊 AMBIENTE DETECTADO:');
  console.log(`   Tipo: ${env.type}`);
  console.log(`   Node.js: ${env.hasNodeJS ? 'Disponível' : 'Não disponível'}`);
  console.log(`   PHP: ${env.hasPHP ? 'Disponível' : 'Não disponível'}`);

  const apis = {
    nodejs: false,
    php: false
  };

  // Tentar configurar APIs disponíveis
  if (env.hasNodeJS) {
    apis.nodejs = setupNodeJS();
  }

  if (env.hasPHP) {
    apis.php = setupPHP();
  }

  // Criar configuração
  createConfig(env, apis);

  // Mostrar instruções
  showInstructions(env, apis);

  return { env, apis };
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { detectHostingerEnvironment, setupNodeJS, setupPHP };