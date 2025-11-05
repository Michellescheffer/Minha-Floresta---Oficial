const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'u271208684_minhafloresta',
  password: 'B7Jz/vu~4s|Q',
  database: 'u271208684_minhafloresta',
  port: 3306,
  connectTimeout: 30000
};

async function testConnection() {
  let connection;
  
  try {
    console.log('🔗 TESTE DE CONEXÃO COM BANCO MYSQL');
    console.log('=' .repeat(50));
    
    // Conectar
    console.log('📡 Conectando ao servidor...');
    const startTime = Date.now();
    connection = await mysql.createConnection(dbConfig);
    const connectionTime = Date.now() - startTime;
    
    console.log(`✅ Conectado em ${connectionTime}ms`);
    
    // Testar ping
    console.log('🏥 Testando ping...');
    await connection.ping();
    console.log('✅ Ping OK');
    
    // Verificar versão
    console.log('📋 Verificando versão do MySQL...');
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 Versão: ${version[0].version}`);
    
    // Listar bancos
    console.log('🗄️ Verificando acesso ao banco...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('✅ Bancos acessíveis:');
    databases.forEach(db => {
      const dbName = Object.values(db)[0];
      console.log(`   - ${dbName}`);
    });
    
    // Listar tabelas
    console.log('📋 Verificando tabelas...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Tabelas encontradas: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('📝 Lista de tabelas:');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
      
      // Teste de consulta
      console.log('🔍 Testando consulta...');
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Usuários cadastrados: ${users[0].count}`);
      
      const [projects] = await connection.execute('SELECT COUNT(*) as count FROM projects');
      console.log(`🌱 Projetos cadastrados: ${projects[0].count}`);
      
    } else {
      console.log('⚠️ Nenhuma tabela encontrada - execute npm run setup-db');
    }
    
    console.log('');
    console.log('🎯 INFORMAÇÕES PARA PHPMYADMIN:');
    console.log('-'.repeat(40));
    console.log(`🌐 Servidor: ${dbConfig.host}`);
    console.log(`👤 Usuário: ${dbConfig.user}`);
    console.log(`🔑 Senha: ${dbConfig.password}`);
    console.log(`🗄️ Banco: ${dbConfig.database}`);
    console.log(`🔌 Porta: ${dbConfig.port}`);
    
    console.log('');
    console.log('🌍 URLS PROVÁVEIS DO PHPMYADMIN:');
    console.log('-'.repeat(40));
    console.log('1. https://sql10.freesqldatabase.com/phpmyadmin/');
    console.log('2. https://phpmyadmin.freesqldatabase.com/');
    console.log('3. Via painel: https://www.freesqldatabase.com/');
    
    console.log('');
    console.log('✅ CONEXÃO 100% FUNCIONAL!');
    console.log('🎉 Pode acessar o phpMyAdmin com as credenciais acima');
    
  } catch (error) {
    console.error('');
    console.error('❌ ERRO DE CONEXÃO:', error.message);
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Servidor MySQL inacessível');
      console.error('   - Verifique sua internet');
      console.error('   - Confirme se o servidor está online');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔐 Credenciais inválidas');
      console.error('   - Verifique usuário e senha');
      console.error('   - Confirme se a conta está ativa');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🗄️ Banco de dados não encontrado');
      console.error('   - Confirme o nome do banco');
      console.error('   - Verifique se o banco foi criado');
    } else {
      console.error('🔧 Erro desconhecido:', error.code);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexão fechada.');
    }
  }
}

// Executar teste
testConnection();