const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'u271208684_minhafloresta',
  password: 'B7Jz/vu~4s|Q',
  database: 'u271208684_minhafloresta',
  port: 3306,
  multipleStatements: true,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🚀 Iniciando configuração completa do banco de dados...\n');
    
    // Conectar ao banco
    console.log('🔗 Estabelecendo conexão com o banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexão estabelecida com sucesso!\n');
    
    // Testar conexão
    await connection.ping();
    console.log('🏥 Teste de conectividade: OK\n');
    
    // Ler e executar schema
    console.log('📂 Carregando schema do banco de dados...');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    console.log('🏗️ Executando criação das tabelas...');
    await connection.execute(schema);
    console.log('✅ Schema executado com sucesso!\n');
    
    // Verificar tabelas criadas
    console.log('📋 Verificando tabelas criadas:');
    const [tables] = await connection.execute('SHOW TABLES');
    
    const tableList = tables.map(table => Object.values(table)[0]);
    tableList.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });
    console.log(`\n✅ Total de ${tableList.length} tabelas criadas!\n`);
    
    // Verificar se já existem dados
    console.log('🔍 Verificando dados existentes...');
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [projectCount] = await connection.execute('SELECT COUNT(*) as count FROM projects');
    const [socialCount] = await connection.execute('SELECT COUNT(*) as count FROM social_projects');
    
    console.log(`   - Usuários: ${userCount[0].count}`);
    console.log(`   - Projetos: ${projectCount[0].count}`);
    console.log(`   - Projetos sociais: ${socialCount[0].count}\n`);
    
    // Inserir dados iniciais se necessário
    if (userCount[0].count === 0) {
      console.log('👤 Criando usuários iniciais...');
      await createInitialUsers(connection);
    }
    
    if (projectCount[0].count === 0) {
      console.log('🌳 Criando projetos de reflorestamento...');
      await createInitialProjects(connection);
    }
    
    if (socialCount[0].count === 0) {
      console.log('🤝 Criando projetos sociais...');
      await createInitialSocialProjects(connection);
    }
    
    // Verificar configurações do sistema
    console.log('⚙️ Verificando configurações do sistema...');
    const [settings] = await connection.execute('SELECT COUNT(*) as count FROM system_settings');
    console.log(`   - Configurações: ${settings[0].count}\n`);
    
    // Status final
    console.log('🎉 CONFIGURAÇÃO COMPLETA!\n');
    console.log('📊 RESUMO FINAL:');
    
    const [finalStats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM projects) as projects,
        (SELECT COUNT(*) FROM social_projects) as social_projects,
        (SELECT COUNT(*) FROM system_settings) as settings
    `);
    
    const stats = finalStats[0];
    console.log(`   👥 Usuários: ${stats.users}`);
    console.log(`   🌱 Projetos: ${stats.projects}`);
    console.log(`   🤝 Projetos sociais: ${stats.social_projects}`);
    console.log(`   ⚙️ Configurações: ${stats.settings}\n`);
    
    console.log('🔑 CREDENCIAIS DE ACESSO:');
    console.log('   📧 Usuário teste: teste@minhaflorestaconservacoes.com');
    console.log('   🔐 Senha: 123456\n');
    console.log('   👑 Admin: admin@minhaflorestaconservacoes.com');
    console.log('   🔐 Senha: admin123\n');
    
    console.log('🌍 Base de dados pronta para produção!');
    
  } catch (error) {
    console.error('❌ ERRO na configuração do banco:', error.message);
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }
    if (error.errno) {
      console.error(`   Errno: ${error.errno}`);
    }
    console.error('\n🔧 Verifique:');
    console.error('   - Conexão com a internet');
    console.error('   - Credenciais do banco de dados');
    console.error('   - Permissões do usuário do banco\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexão fechada com sucesso.');
    }
  }
}

async function createInitialUsers(connection) {
  // Usuário de teste
  const testUserId = uuidv4();
  const hashedPassword = await bcrypt.hash('123456', 12);
  
  await connection.execute(`
    INSERT INTO users (id, email, name, password_hash, phone, cpf, is_active, email_verified)
    VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)
  `, [
    testUserId,
    'teste@minhaflorestaconservacoes.com',
    'Usuário de Teste',
    hashedPassword,
    '(11) 99999-9999',
    '123.456.789-00'
  ]);
  
  // Administrador
  const adminId = uuidv4();
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  await connection.execute(`
    INSERT INTO users (id, email, name, password_hash, is_active, email_verified)
    VALUES (?, ?, ?, ?, TRUE, TRUE)
  `, [
    adminId,
    'admin@minhaflorestaconservacoes.com',
    'Administrador do Sistema',
    adminPassword
  ]);
  
  console.log('   ✅ Usuários criados com sucesso!');
}

async function createInitialProjects(connection) {
  const projects = [
    {
      id: uuidv4(),
      name: 'Amazônia Verde Plus',
      description: 'Projeto avançado de reflorestamento na Amazônia com tecnologia de monitoramento por satélite e envolvimento das comunidades locais. Foco na restauração de áreas degradadas e conservação da biodiversidade.',
      location: 'Amazonas, Brasil',
      type: 'reforestation',
      price: 25.00,
      total_area: 100000,
      available_area: 85000,
      sold_area: 15000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      ]),
      coordinates: JSON.stringify({ lat: -3.4653, lng: -62.2159 }),
      status: 'active',
      carbon_credit_per_m2: 0.022,
      trees_per_m2: 0.1
    },
    {
      id: uuidv4(),
      name: 'Mata Atlântica Renascimento',
      description: 'Restauração ecológica da Mata Atlântica com foco na conectividade de fragmentos florestais e conservação da biodiversidade. Utiliza espécies nativas e técnicas de nucleação.',
      location: 'São Paulo, Brasil',
      type: 'restoration',
      price: 30.00,
      total_area: 50000,
      available_area: 42000,
      sold_area: 8000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1574263867128-ca4c7707e1c8?w=800',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'
      ]),
      coordinates: JSON.stringify({ lat: -23.5505, lng: -46.6333 }),
      status: 'active',
      carbon_credit_per_m2: 0.025,
      trees_per_m2: 0.12
    },
    {
      id: uuidv4(),
      name: 'Cerrado Sustentável 2.0',
      description: 'Conservação e restauração do Cerrado brasileiro com sistemas agroflorestais e proteção de nascentes. Projeto integrado com comunidades rurais.',
      location: 'Goiás, Brasil',
      type: 'conservation',
      price: 20.00,
      total_area: 75000,
      available_area: 67000,
      sold_area: 8000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        'https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=800'
      ]),
      coordinates: JSON.stringify({ lat: -16.6869, lng: -49.2648 }),
      status: 'active',
      carbon_credit_per_m2: 0.020,
      trees_per_m2: 0.08
    },
    {
      id: uuidv4(),
      name: 'Projeto Mangue Azul Avançado',
      description: 'Restauração de manguezais e ecossistemas costeiros para captura de carbono azul e proteção da biodiversidade marinha. Foco em comunidades pesqueiras.',
      location: 'Bahia, Brasil',
      type: 'blue-carbon',
      price: 35.00,
      total_area: 30000,
      available_area: 28000,
      sold_area: 2000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      ]),
      coordinates: JSON.stringify({ lat: -12.9718, lng: -38.5014 }),
      status: 'active',
      carbon_credit_per_m2: 0.030,
      trees_per_m2: 0.15
    }
  ];
  
  for (const project of projects) {
    await connection.execute(`
      INSERT INTO projects (
        id, name, description, location, type, price, 
        total_area, available_area, sold_area, images, 
        coordinates, status, carbon_credit_per_m2, trees_per_m2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      project.id, project.name, project.description, project.location,
      project.type, project.price, project.total_area, project.available_area,
      project.sold_area, project.images, project.coordinates, project.status,
      project.carbon_credit_per_m2, project.trees_per_m2
    ]);
  }
  
  console.log('   ✅ Projetos de reflorestamento criados!');
}

async function createInitialSocialProjects(connection) {
  const socialProjects = [
    {
      id: uuidv4(),
      title: 'Educação Ambiental Comunitária',
      description: 'Programa abrangente de educação ambiental para comunidades rurais, focando em sustentabilidade, conservação e desenvolvimento de práticas ecológicas.',
      location: 'Interior do Brasil',
      category: 'education',
      budget: 150000.00,
      spent: 45000.00,
      donations_received: 75000.00,
      beneficiaries: 500,
      status: 'active',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800'
      ])
    },
    {
      id: uuidv4(),
      title: 'Capacitação em Agrofloresta Avançada',
      description: 'Treinamento especializado de agricultores em técnicas agroflorestais modernas e sustentáveis, com foco em produtividade e conservação.',
      location: 'Várias regiões',
      category: 'training',
      budget: 200000.00,
      spent: 80000.00,
      donations_received: 120000.00,
      beneficiaries: 300,
      status: 'active',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800'
      ])
    },
    {
      id: uuidv4(),
      title: 'Pesquisa em Biodiversidade Tropical',
      description: 'Estudos científicos avançados sobre biodiversidade em áreas de reflorestamento e restauração, contribuindo para o conhecimento científico.',
      location: 'Universidades parceiras',
      category: 'research',
      budget: 300000.00,
      spent: 150000.00,
      donations_received: 200000.00,
      beneficiaries: 50,
      status: 'active',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
      ])
    },
    {
      id: uuidv4(),
      title: 'Desenvolvimento Comunitário Sustentável',
      description: 'Apoio ao desenvolvimento sustentável de comunidades locais através de projetos integrados de geração de renda e conservação ambiental.',
      location: 'Comunidades rurais',
      category: 'community',
      budget: 250000.00,
      spent: 100000.00,
      donations_received: 180000.00,
      beneficiaries: 800,
      status: 'active',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800'
      ])
    }
  ];
  
  for (const project of socialProjects) {
    await connection.execute(`
      INSERT INTO social_projects (
        id, title, description, location, category, budget,
        spent, donations_received, beneficiaries, status, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      project.id, project.title, project.description, project.location,
      project.category, project.budget, project.spent, project.donations_received,
      project.beneficiaries, project.status, project.images
    ]);
  }
  
  console.log('   ✅ Projetos sociais criados!');
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;