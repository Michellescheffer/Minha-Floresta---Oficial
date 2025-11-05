#!/usr/bin/env node

/**
 * Installation script for Minha Floresta MCP Server
 * Sets up the MCP server and configures it for use
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 INSTALAÇÃO DO MCP MINHA FLORESTA CONSERVAÇÕES');
console.log('=' .repeat(60));

async function installMCP() {
  try {
    // 1. Verificar Node.js
    console.log('🔍 Verificando Node.js...');
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      console.log(`✅ Node.js ${nodeVersion} encontrado`);
      
      const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
      if (majorVersion < 18) {
        throw new Error('Node.js 18+ é necessário');
      }
    } catch (error) {
      console.log('❌ Node.js não encontrado ou versão inadequada');
      console.log('💡 Instale Node.js 18+ de https://nodejs.org/');
      process.exit(1);
    }

    // 2. Instalar dependências do MCP
    console.log('\n📦 Instalando dependências do MCP...');
    try {
      execSync('npm install', { 
        stdio: 'inherit',
        cwd: __dirname + '/..'
      });
      console.log('✅ Dependências instaladas com sucesso');
    } catch (error) {
      console.log('❌ Erro ao instalar dependências');
      throw error;
    }

    // 3. Instalar MCP CLI globalmente (opcional)
    console.log('\n🛠️ Instalando MCP CLI (opcional)...');
    try {
      execSync('npm install -g @modelcontextprotocol/cli', { 
        stdio: 'inherit'
      });
      console.log('✅ MCP CLI instalado globalmente');
    } catch (error) {
      console.log('⚠️ MCP CLI não pôde ser instalado globalmente (permissões?)');
      console.log('💡 Você ainda pode usar o MCP localmente');
    }

    // 4. Testar conexão com banco
    console.log('\n🔗 Testando conexão com banco de dados...');
    try {
      const testScript = path.join(__dirname, '../../backend/scripts/test-connection.js');
      if (fs.existsSync(testScript)) {
        execSync(`node ${testScript}`, { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '../../backend')
        });
        console.log('✅ Conexão com banco testada com sucesso');
      } else {
        console.log('⚠️ Script de teste do banco não encontrado');
      }
    } catch (error) {
      console.log('❌ Erro ao testar conexão com banco');
      console.log('💡 Execute: cd backend && npm run test-connection');
    }

    // 5. Criar arquivo de configuração
    console.log('\n⚙️ Criando configuração do MCP...');
    const configPath = path.join(__dirname, '../mcp-config.json');
    const config = {
      name: 'minha-floresta-mysql',
      description: 'MCP Server for Minha Floresta Conservações MySQL Database',
      version: '1.0.0',
      server: {
        command: 'node',
        args: ['mysql-server.js'],
        cwd: path.join(__dirname, '..'),
        env: {}
      },
      database: {
        host: 'sql10.freesqldatabase.com',
        database: 'u271208684_minhafloresta',
        tables: [
          'users', 'projects', 'social_projects', 'transactions',
          'certificates', 'donations', 'carbon_calculations',
          'shopping_cart', 'contact_messages', 'system_settings', 'audit_log'
        ]
      },
      tools: [
        'query_database', 'insert_record', 'update_record', 'delete_record',
        'list_tables', 'describe_table', 'get_table_stats', 'backup_table',
        'test_connection'
      ]
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Configuração criada: ${configPath}`);

    // 6. Testar MCP Server
    console.log('\n🧪 Testando MCP Server...');
    try {
      execSync('npm test', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('✅ MCP Server testado com sucesso');
    } catch (error) {
      console.log('⚠️ Erro no teste do MCP Server');
      console.log('💡 Execute manualmente: cd mcp && npm test');
    }

    // 7. Instruções finais
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=' .repeat(60));
    
    console.log('\n📖 COMO USAR:');
    console.log('');
    console.log('1️⃣ Iniciar o MCP Server:');
    console.log('   cd mcp');
    console.log('   npm start');
    console.log('');
    console.log('2️⃣ Testar funcionalidades:');
    console.log('   npm test                    # Testes automáticos');
    console.log('   node test-mcp.js -i        # Modo interativo');
    console.log('');
    console.log('3️⃣ Usar via MCP CLI (se instalado):');
    console.log('   mcp connect minha-floresta-mcp');
    console.log('');
    console.log('4️⃣ Integrar em aplicações:');
    console.log('   Ver exemplos em: mcp/README.md');
    console.log('');
    
    console.log('🔧 FERRAMENTAS DISPONÍVEIS:');
    config.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool}`);
    });
    
    console.log('\n🗄️ TABELAS ACESSÍVEIS:');
    config.database.tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });
    
    console.log('\n📚 DOCUMENTAÇÃO:');
    console.log('   - MCP Server: mcp/README.md');
    console.log('   - Database: backend/DATABASE_SETUP.md');
    console.log('   - Quick Start: QUICK_START_DATABASE.md');
    
    console.log('\n💚 Sua floresta digital está pronta para crescer! 🌳');

  } catch (error) {
    console.error('\n❌ ERRO NA INSTALAÇÃO:', error.message);
    console.error('\n🔧 SOLUÇÕES:');
    console.error('   1. Verificar Node.js 18+');
    console.error('   2. Verificar conexão com internet');
    console.error('   3. Verificar permissões de escrita');
    console.error('   4. Executar como administrador (se necessário)');
    process.exit(1);
  }
}

// Executar instalação
if (require.main === module) {
  installMCP();
}

module.exports = installMCP;