const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'u271208684_minhafloresta',
  password: 'B7Jz/vu~4s|Q',
  database: 'u271208684_minhafloresta',
  port: 3306
};

async function seedDatabase() {
  let connection;
  
  try {
    console.log('🔗 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('👤 Criando usuários de teste...');
    
    // Criar usuário de teste
    const testUserId = uuidv4();
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    await connection.execute(`
      INSERT INTO users (id, email, name, password_hash, phone, cpf, is_active, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `, [
      testUserId,
      'teste@minhaflorestaconservacoes.com',
      'Usuário de Teste',
      hashedPassword,
      '(11) 99999-9999',
      '123.456.789-00'
    ]);
    
    // Criar admin
    const adminId = uuidv4();
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await connection.execute(`
      INSERT INTO users (id, email, name, password_hash, is_active, email_verified)
      VALUES (?, ?, ?, ?, TRUE, TRUE)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `, [
      adminId,
      'admin@minhaflorestaconservacoes.com',
      'Administrador',
      adminPassword
    ]);
    
    console.log('🌳 Verificando projetos existentes...');
    const [existingProjects] = await connection.execute('SELECT COUNT(*) as count FROM projects');
    
    if (existingProjects[0].count === 0) {
      console.log('🌱 Inserindo projetos de exemplo...');
      
      const projects = [
        {
          id: uuidv4(),
          name: 'Amazônia Verde Plus',
          description: 'Projeto avançado de reflorestamento na Amazônia com tecnologia de monitoramento por satélite e envolvimento das comunidades locais.',
          location: 'Amazonas, Brasil',
          type: 'reforestation',
          price: 25.00,
          total_area: 100000,
          available_area: 85000,
          sold_area: 15000,
          images: JSON.stringify(['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800']),
          coordinates: JSON.stringify({ lat: -3.4653, lng: -62.2159 }),
          status: 'active',
          carbon_credit_per_m2: 0.022,
          trees_per_m2: 0.1
        },
        {
          id: uuidv4(),
          name: 'Mata Atlântica Renascimento',
          description: 'Restauração ecológica da Mata Atlântica com foco na conectividade de fragmentos florestais e conservação da biodiversidade.',
          location: 'São Paulo, Brasil',
          type: 'restoration',
          price: 30.00,
          total_area: 50000,
          available_area: 42000,
          sold_area: 8000,
          images: JSON.stringify(['https://images.unsplash.com/photo-1574263867128-ca4c7707e1c8?w=800']),
          coordinates: JSON.stringify({ lat: -23.5505, lng: -46.6333 }),
          status: 'active',
          carbon_credit_per_m2: 0.025,
          trees_per_m2: 0.12
        },
        {
          id: uuidv4(),
          name: 'Cerrado Sustentável 2.0',
          description: 'Conservação e restauração do Cerrado brasileiro com sistemas agroflorestais e proteção de nascentes.',
          location: 'Goiás, Brasil',
          type: 'conservation',
          price: 20.00,
          total_area: 75000,
          available_area: 67000,
          sold_area: 8000,
          images: JSON.stringify(['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']),
          coordinates: JSON.stringify({ lat: -16.6869, lng: -49.2648 }),
          status: 'active',
          carbon_credit_per_m2: 0.020,
          trees_per_m2: 0.08
        },
        {
          id: uuidv4(),
          name: 'Projeto Mangue Azul Avançado',
          description: 'Restauração de manguezais e ecossistemas costeiros para captura de carbono azul e proteção da biodiversidade marinha.',
          location: 'Bahia, Brasil',
          type: 'blue-carbon',
          price: 35.00,
          total_area: 30000,
          available_area: 28000,
          sold_area: 2000,
          images: JSON.stringify(['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800']),
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
    }
    
    console.log('🤝 Verificando projetos sociais...');
    const [existingSocial] = await connection.execute('SELECT COUNT(*) as count FROM social_projects');
    
    if (existingSocial[0].count === 0) {
      console.log('💚 Inserindo projetos sociais...');
      
      const socialProjects = [
        {
          id: uuidv4(),
          title: 'Educação Ambiental Comunitária',
          description: 'Programa abrangente de educação ambiental para comunidades rurais, focando em sustentabilidade e conservação.',
          location: 'Interior do Brasil',
          category: 'education',
          budget: 150000.00,
          spent: 45000.00,
          donations_received: 75000.00,
          beneficiaries: 500,
          status: 'active',
          images: JSON.stringify(['https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800'])
        },
        {
          id: uuidv4(),
          title: 'Capacitação em Agrofloresta Avançada',
          description: 'Treinamento especializado de agricultores em técnicas agroflorestais modernas e sustentáveis.',
          location: 'Várias regiões',
          category: 'training',
          budget: 200000.00,
          spent: 80000.00,
          donations_received: 120000.00,
          beneficiaries: 300,
          status: 'active',
          images: JSON.stringify(['https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800'])
        },
        {
          id: uuidv4(),
          title: 'Pesquisa em Biodiversidade Tropical',
          description: 'Estudos científicos avançados sobre biodiversidade em áreas de reflorestamento e restauração.',
          location: 'Universidades parceiras',
          category: 'research',
          budget: 300000.00,
          spent: 150000.00,
          donations_received: 200000.00,
          beneficiaries: 50,
          status: 'active',
          images: JSON.stringify(['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'])
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
    }
    
    console.log('✅ Dados de teste inseridos com sucesso!');
    console.log('');
    console.log('🔑 Credenciais de teste:');
    console.log('   Email: teste@minhaflorestaconservacoes.com');
    console.log('   Senha: 123456');
    console.log('');
    console.log('🔒 Credenciais de admin:');
    console.log('   Email: admin@minhaflorestaconservacoes.com');
    console.log('   Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;