const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'u271208684_minhafloresta',
  password: 'B7Jz/vu~4s|Q',
  database: 'u271208684_minhafloresta',
  port: 3306,
  connectTimeout: 30000,
  acquireTimeout: 30000,
  timeout: 30000
};

async function checkDatabase() {
  let connection;
  
  try {
    console.log('🔍 VERIFICAÇÃO COMPLETA DO BANCO DE DADOS\n');
    console.log('=' .repeat(60));
    
    // Conectar
    console.log('🔗 Testando conexão...');
    const startTime = Date.now();
    connection = await mysql.createConnection(dbConfig);
    const connectionTime = Date.now() - startTime;
    console.log(`✅ Conexão estabelecida em ${connectionTime}ms\n`);
    
    // Testar ping
    await connection.ping();
    console.log('🏥 Ping: OK\n');
    
    // Verificar versão do MySQL
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log(`🗄️ Versão MySQL: ${version[0].version}\n`);
    
    // Listar tabelas
    console.log('📋 TABELAS EXISTENTES:');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('❌ Nenhuma tabela encontrada! Execute o setup primeiro.\n');
      return;
    }
    
    console.log(`📊 Total: ${tables.length} tabelas\n`);
    
    // Verificar estrutura e dados de cada tabela
    for (let i = 0; i < tables.length; i++) {
      const tableName = Object.values(tables[i])[0];
      console.log(`${i + 1}. ${tableName}`);
      
      try {
        // Contar registros
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   📈 Registros: ${count[0].count}`);
        
        // Verificar estrutura
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`   🏗️ Colunas: ${columns.length}`);
        
        // Mostrar algumas colunas principais
        const mainColumns = columns.slice(0, 3).map(col => col.Field).join(', ');
        console.log(`   📝 Principais: ${mainColumns}${columns.length > 3 ? '...' : ''}`);
        
      } catch (error) {
        console.log(`   ❌ Erro ao verificar: ${error.message}`);
      }
      
      console.log('');
    }
    
    // Estatísticas gerais
    console.log('📊 ESTATÍSTICAS GERAIS:');
    console.log('-'.repeat(40));
    
    const stats = [
      { table: 'users', label: '👥 Usuários' },
      { table: 'projects', label: '🌱 Projetos' },
      { table: 'social_projects', label: '🤝 Projetos Sociais' },
      { table: 'transactions', label: '💳 Transações' },
      { table: 'certificates', label: '📜 Certificados' },
      { table: 'donations', label: '💝 Doações' },
      { table: 'carbon_calculations', label: '🌍 Cálculos CO₂' },
      { table: 'shopping_cart', label: '🛒 Itens no Carrinho' },
      { table: 'contact_messages', label: '📧 Mensagens' },
      { table: 'system_settings', label: '⚙️ Configurações' }
    ];
    
    for (const stat of stats) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${stat.table}`);
        console.log(`${stat.label}: ${result[0].count}`);
      } catch (error) {
        console.log(`${stat.label}: Tabela não encontrada`);
      }
    }
    
    console.log('');
    
    // Verificar configurações específicas
    console.log('⚙️ CONFIGURAÇÕES DO SISTEMA:');
    console.log('-'.repeat(40));
    
    try {
      const [settings] = await connection.execute(`
        SELECT setting_key, setting_value, setting_type 
        FROM system_settings 
        ORDER BY setting_key
      `);
      
      if (settings.length > 0) {
        settings.forEach(setting => {
          let value = setting.setting_value;
          if (setting.setting_type === 'json') {
            try {
              value = JSON.stringify(JSON.parse(value));
            } catch (e) {
              // Manter valor original se não for JSON válido
            }
          }
          console.log(`${setting.setting_key}: ${value}`);
        });
      } else {
        console.log('⚠️ Nenhuma configuração encontrada');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar configurações');
    }
    
    console.log('');
    
    // Status de projetos
    console.log('🌱 STATUS DOS PROJETOS:');
    console.log('-'.repeat(40));
    
    try {
      const [projectStats] = await connection.execute(`
        SELECT 
          type,
          status,
          COUNT(*) as count,
          SUM(total_area) as total_area,
          SUM(available_area) as available_area,
          SUM(sold_area) as sold_area
        FROM projects 
        GROUP BY type, status
      `);
      
      if (projectStats.length > 0) {
        projectStats.forEach(stat => {
          console.log(`${stat.type} (${stat.status}): ${stat.count} projetos`);
          console.log(`  - Total: ${stat.total_area}m²`);
          console.log(`  - Disponível: ${stat.available_area}m²`);
          console.log(`  - Vendido: ${stat.sold_area}m²`);
        });
      } else {
        console.log('⚠️ Nenhum projeto encontrado');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar projetos');
    }
    
    console.log('');
    
    // Teste de performance
    console.log('⚡ TESTE DE PERFORMANCE:');
    console.log('-'.repeat(40));
    
    const performanceTests = [
      { name: 'SELECT simples', query: 'SELECT 1' },
      { name: 'COUNT usuários', query: 'SELECT COUNT(*) FROM users' },
      { name: 'COUNT projetos', query: 'SELECT COUNT(*) FROM projects' },
      { name: 'JOIN complexo', query: `
        SELECT p.name, COUNT(t.id) as transactions 
        FROM projects p 
        LEFT JOIN transactions t ON p.id = t.project_id 
        GROUP BY p.id 
        LIMIT 5
      ` }
    ];
    
    for (const test of performanceTests) {
      try {
        const startTime = Date.now();
        await connection.execute(test.query);
        const duration = Date.now() - startTime;
        console.log(`${test.name}: ${duration}ms`);
      } catch (error) {
        console.log(`${test.name}: ERRO`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('🌍 Banco de dados está operacional e pronto para uso.');
    
  } catch (error) {
    console.error('\n❌ ERRO NA VERIFICAÇÃO:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Problema de conexão - verifique se o servidor está acessível');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔐 Credenciais inválidas - verifique usuário e senha');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('📂 Banco de dados não existe - execute o setup primeiro');
    }
    
    console.error('\n🔧 SOLUÇÕES POSSÍVEIS:');
    console.error('   1. Verificar conexão com a internet');
    console.error('   2. Confirmar credenciais do banco');
    console.error('   3. Executar: node backend/scripts/setup-database.js');
    console.error('   4. Verificar firewall e porta 3306');
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexão fechada.');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkDatabase();
}

module.exports = checkDatabase;