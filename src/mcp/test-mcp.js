#!/usr/bin/env node

/**
 * Test script for Minha Floresta MCP MySQL Server
 * Tests all available tools and database operations
 */

const { spawn } = require('child_process');
const readline = require('readline');

class MCPTester {
  constructor() {
    this.server = null;
    this.requestId = 1;
  }

  async startServer() {
    console.log('🚀 Starting MCP MySQL Server...\n');
    
    this.server = spawn('node', ['mysql-server.js'], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (this.server.killed) {
      throw new Error('Server failed to start');
    }
    
    console.log('✅ MCP Server started successfully\n');
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method,
        params
      };

      let response = '';
      
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 10000);

      this.server.stdout.once('data', (data) => {
        clearTimeout(timeout);
        try {
          response = JSON.parse(data.toString());
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });

      this.server.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async testConnection() {
    console.log('🔍 Testing database connection...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'test_connection',
        arguments: {}
      });
      
      if (response.result) {
        console.log('✅ Connection test passed');
        console.log(response.result.content[0].text);
      } else {
        console.log('❌ Connection test failed:', response.error);
      }
    } catch (error) {
      console.log('❌ Connection test error:', error.message);
    }
    
    console.log('');
  }

  async testListTables() {
    console.log('📋 Testing list tables...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'list_tables',
        arguments: {}
      });
      
      if (response.result) {
        console.log('✅ List tables passed');
        console.log(response.result.content[0].text);
      } else {
        console.log('❌ List tables failed:', response.error);
      }
    } catch (error) {
      console.log('❌ List tables error:', error.message);
    }
    
    console.log('');
  }

  async testTableStats() {
    console.log('📊 Testing table statistics...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'get_table_stats',
        arguments: {}
      });
      
      if (response.result) {
        console.log('✅ Table stats passed');
        console.log(response.result.content[0].text);
      } else {
        console.log('❌ Table stats failed:', response.error);
      }
    } catch (error) {
      console.log('❌ Table stats error:', error.message);
    }
    
    console.log('');
  }

  async testDescribeTable() {
    console.log('🏗️ Testing describe table (users)...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'describe_table',
        arguments: {
          table: 'users'
        }
      });
      
      if (response.result) {
        console.log('✅ Describe table passed');
        console.log(response.result.content[0].text);
      } else {
        console.log('❌ Describe table failed:', response.error);
      }
    } catch (error) {
      console.log('❌ Describe table error:', error.message);
    }
    
    console.log('');
  }

  async testQuery() {
    console.log('🔍 Testing database query...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'query_database',
        arguments: {
          sql: 'SELECT COUNT(*) as total_users FROM users'
        }
      });
      
      if (response.result) {
        console.log('✅ Query test passed');
        console.log(response.result.content[0].text);
      } else {
        console.log('❌ Query test failed:', response.error);
      }
    } catch (error) {
      console.log('❌ Query test error:', error.message);
    }
    
    console.log('');
  }

  async testProjectsQuery() {
    console.log('🌱 Testing projects query...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'query_database',
        arguments: {
          sql: 'SELECT name, type, price, available_area FROM projects LIMIT 3'
        }
      });
      
      if (response.result) {
        console.log('✅ Projects query passed');
        console.log(response.result.content[0].text);
      } else {
        console.log('❌ Projects query failed:', response.error);
      }
    } catch (error) {
      console.log('❌ Projects query error:', error.message);
    }
    
    console.log('');
  }

  async testAvailableTools() {
    console.log('🛠️ Testing available tools...');
    
    try {
      const response = await this.sendRequest('tools/list');
      
      if (response.result && response.result.tools) {
        console.log('✅ Tools list retrieved');
        console.log(`Found ${response.result.tools.length} tools:`);
        
        response.result.tools.forEach((tool, index) => {
          console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
        });
      } else {
        console.log('❌ Tools list failed:', response.error);
      }
    } catch (error) {
      console.log('❌ Tools list error:', error.message);
    }
    
    console.log('');
  }

  async runAllTests() {
    try {
      await this.startServer();
      
      console.log('🧪 Running MCP MySQL Server Tests\n');
      console.log('=' .repeat(50));
      
      await this.testAvailableTools();
      await this.testConnection();
      await this.testListTables();
      await this.testTableStats();
      await this.testDescribeTable();
      await this.testQuery();
      await this.testProjectsQuery();
      
      console.log('=' .repeat(50));
      console.log('🎉 All tests completed!');
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    } finally {
      if (this.server) {
        this.server.kill();
        console.log('🔚 MCP Server stopped');
      }
    }
  }
}

// Interactive mode
async function interactiveMode() {
  const tester = new MCPTester();
  await tester.startServer();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🎮 MCP Interactive Mode');
  console.log('Available commands:');
  console.log('  - test connection');
  console.log('  - list tables');
  console.log('  - table stats');
  console.log('  - query <SQL>');
  console.log('  - describe <table>');
  console.log('  - exit');
  console.log('');

  const handleCommand = async (input) => {
    const [command, ...args] = input.trim().split(' ');
    
    try {
      switch (command) {
        case 'test':
          if (args[0] === 'connection') {
            await tester.testConnection();
          }
          break;
          
        case 'list':
          if (args[0] === 'tables') {
            await tester.testListTables();
          }
          break;
          
        case 'table':
          if (args[0] === 'stats') {
            await tester.testTableStats();
          }
          break;
          
        case 'query':
          const sql = args.join(' ');
          if (sql) {
            const response = await tester.sendRequest('tools/call', {
              name: 'query_database',
              arguments: { sql }
            });
            console.log(response.result ? response.result.content[0].text : response.error);
          }
          break;
          
        case 'describe':
          if (args[0]) {
            const response = await tester.sendRequest('tools/call', {
              name: 'describe_table',
              arguments: { table: args[0] }
            });
            console.log(response.result ? response.result.content[0].text : response.error);
          }
          break;
          
        case 'exit':
          tester.server.kill();
          rl.close();
          return;
          
        default:
          console.log('Unknown command. Type "exit" to quit.');
      }
    } catch (error) {
      console.log('Error:', error.message);
    }
    
    rl.prompt();
  };

  rl.on('line', handleCommand);
  rl.prompt();
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--interactive') || args.includes('-i')) {
  interactiveMode();
} else {
  const tester = new MCPTester();
  tester.runAllTests();
}