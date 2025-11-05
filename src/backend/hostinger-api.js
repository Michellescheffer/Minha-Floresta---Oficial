#!/usr/bin/env node

/**
 * API REST para Hostinger - Substitui o MCP
 * Funciona direto no servidor sem dependências complexas
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuração do MySQL (Hostinger)
const DB_CONFIG = {
  host: 'sql10.freesqldatabase.com',
  user: 'u271208684_minhafloresta',
  password: 'B7Jz/vu~4s|Q',
  database: 'u271208684_minhafloresta',
  port: 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
};

// Pool de conexões
let pool;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: [
    'https://minhafloresta.ampler.me',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas requisições, tente novamente em 15 minutos'
});
app.use('/api/', limiter);

// Inicializar pool de conexões
async function initDatabase() {
  try {
    pool = mysql.createPool(DB_CONFIG);
    console.log('✅ Pool de conexões MySQL criado');
    
    // Testar conexão
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Conexão com MySQL testada');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar MySQL:', error);
    return false;
  }
}

// Middleware para verificar conexão
async function checkConnection(req, res, next) {
  if (!pool) {
    return res.status(500).json({
      success: false,
      error: 'Conexão com banco não disponível'
    });
  }
  next();
}

// ==========================================
// ROTAS DA API
// ==========================================

// Status da API
app.get('/api/status', async (req, res) => {
  try {
    if (pool) {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      
      res.json({
        success: true,
        status: 'online',
        database: 'connected',
        timestamp: new Date().toISOString(),
        server: 'Hostinger'
      });
    } else {
      res.status(500).json({
        success: false,
        status: 'offline',
        database: 'disconnected'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Projetos de reflorestamento
app.get('/api/projects', checkConnection, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.*,
        COUNT(c.id) as total_certificates,
        SUM(c.area_m2) as total_area_sold,
        (p.total_area_m2 - COALESCE(SUM(c.area_m2), 0)) as available_area
      FROM projects p
      LEFT JOIN certificates c ON p.id = c.project_id AND c.status = 'active'
      WHERE p.status = 'active'
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar projetos'
    });
  }
});

// Projeto específico
app.get('/api/projects/:id', checkConnection, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT 
        p.*,
        COUNT(c.id) as total_certificates,
        SUM(c.area_m2) as total_area_sold,
        (p.total_area_m2 - COALESCE(SUM(c.area_m2), 0)) as available_area
      FROM projects p
      LEFT JOIN certificates c ON p.id = c.project_id AND c.status = 'active'
      WHERE p.id = ? AND p.status = 'active'
      GROUP BY p.id
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Projeto não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar projeto'
    });
  }
});

// Criar certificado (compra de m²)
app.post('/api/certificates', checkConnection, async (req, res) => {
  try {
    const {
      project_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      area_m2,
      total_price,
      payment_method
    } = req.body;
    
    // Validações
    if (!project_id || !buyer_name || !buyer_email || !area_m2 || !total_price) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando'
      });
    }
    
    // Verificar disponibilidade
    const [projectRows] = await pool.execute(`
      SELECT 
        p.total_area_m2,
        COALESCE(SUM(c.area_m2), 0) as sold_area
      FROM projects p
      LEFT JOIN certificates c ON p.id = c.project_id AND c.status = 'active'
      WHERE p.id = ? AND p.status = 'active'
      GROUP BY p.id
    `, [project_id]);
    
    if (projectRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Projeto não encontrado'
      });
    }
    
    const project = projectRows[0];
    const availableArea = project.total_area_m2 - project.sold_area;
    
    if (area_m2 > availableArea) {
      return res.status(400).json({
        success: false,
        error: `Área disponível insuficiente. Disponível: ${availableArea}m²`
      });
    }
    
    // Gerar código único do certificado
    const certificateCode = `MF${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Inserir certificado
    const [result] = await pool.execute(`
      INSERT INTO certificates (
        project_id,
        certificate_code,
        buyer_name,
        buyer_email,
        buyer_phone,
        area_m2,
        total_price,
        payment_method,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      project_id,
      certificateCode,
      buyer_name,
      buyer_email,
      buyer_phone || null,
      area_m2,
      total_price,
      payment_method || 'pending'
    ]);
    
    res.json({
      success: true,
      data: {
        id: result.insertId,
        certificate_code: certificateCode,
        area_m2,
        total_price
      },
      message: 'Certificado criado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar certificado:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar certificado'
    });
  }
});

// Buscar certificado
app.get('/api/certificates/:code', checkConnection, async (req, res) => {
  try {
    const { code } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT 
        c.*,
        p.name as project_name,
        p.location as project_location,
        p.description as project_description
      FROM certificates c
      JOIN projects p ON c.project_id = p.id
      WHERE c.certificate_code = ?
    `, [code]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Certificado não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar certificado:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar certificado'
    });
  }
});

// Calcular pegada de carbono
app.post('/api/calculate-footprint', (req, res) => {
  try {
    const {
      transport,
      energy,
      consumption,
      waste
    } = req.body;
    
    // Fórmulas simplificadas de cálculo
    const transportCO2 = (transport?.car_km || 0) * 0.12 + 
                         (transport?.plane_km || 0) * 0.25 +
                         (transport?.public_km || 0) * 0.04;
    
    const energyCO2 = (energy?.electricity_kwh || 0) * 0.5 +
                      (energy?.gas_m3 || 0) * 2.3;
    
    const consumptionCO2 = (consumption?.food_score || 0) * 0.1 +
                          (consumption?.goods_score || 0) * 0.05;
    
    const wasteCO2 = (waste?.general_kg || 0) * 0.02 +
                     (waste?.recyclable_kg || 0) * 0.01;
    
    const totalCO2 = transportCO2 + energyCO2 + consumptionCO2 + wasteCO2;
    const recommendedArea = Math.ceil(totalCO2 / 10); // 10 kg CO2 por m²
    
    res.json({
      success: true,
      data: {
        total_co2_kg_year: totalCO2,
        breakdown: {
          transport: transportCO2,
          energy: energyCO2,
          consumption: consumptionCO2,
          waste: wasteCO2
        },
        recommended_area_m2: recommendedArea,
        estimated_cost: recommendedArea * 15, // R$ 15 por m²
        trees_equivalent: Math.ceil(totalCO2 / 22) // 1 árvore = ~22kg CO2/ano
      }
    });
  } catch (error) {
    console.error('Erro no cálculo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no cálculo da pegada'
    });
  }
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================

async function startServer() {
  console.log('🚀 Iniciando API Hostinger...');
  
  // Inicializar banco
  const dbConnected = await initDatabase();
  if (!dbConnected) {
    console.error('❌ Falha na conexão com banco de dados');
    process.exit(1);
  }
  
  // Iniciar servidor
  app.listen(PORT, () => {
    console.log('✅ API Hostinger rodando!');
    console.log(`📡 Porta: ${PORT}`);
    console.log(`🌐 Status: http://localhost:${PORT}/api/status`);
    console.log(`📊 Projetos: http://localhost:${PORT}/api/projects`);
    console.log('🎯 Pronto para receber requisições!');
  });
}

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Encerrando servidor...');
  if (pool) {
    await pool.end();
    console.log('✅ Pool de conexões fechado');
  }
  process.exit(0);
});

// Iniciar
startServer().catch(error => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});

module.exports = app;