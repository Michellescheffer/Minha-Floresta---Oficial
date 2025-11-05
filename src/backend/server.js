const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { pool, executeQuery, executeTransaction, testConnection, getConnectionStatus } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration with robust connection settings
const dbConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'u271208684_minhafloresta',
  password: 'B7Jz/vu~4s|Q',
  database: 'u271208684_minhafloresta',
  port: 3306,
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  connectTimeout: 60000,
  dateStrings: true
};

// Database connection pool with enhanced resilience
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 20,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Database connection monitoring and auto-reconnection
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    if (!isConnected) {
      console.log('🟢 Database connected successfully');
      isConnected = true;
      reconnectAttempts = 0;
    }
    return true;
  } catch (error) {
    if (isConnected) {
      console.log('🔴 Database connection lost:', error.message);
      isConnected = false;
    }
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      setTimeout(testDatabaseConnection, 5000);
    } else {
      console.log('❌ Max reconnection attempts reached');
    }
    return false;
  }
}

// Enhanced database query executor with retry logic
async function executeQuery(query, params = [], retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await pool.getConnection();
      const result = await connection.execute(query, params);
      connection.release();
      return result;
    } catch (error) {
      console.log(`Query attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      
      // Test connection before retry
      await testDatabaseConnection();
    }
  }
}

// Initialize database monitoring
testDatabaseConnection();
setInterval(testDatabaseConnection, 30000); // Check every 30 seconds

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'minha_floresta_secret_key_2024';

// Middleware para autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Enhanced health check with detailed database status
app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now();
    const connection = await pool.getConnection();
    await connection.ping();
    
    // Test actual query execution
    const [result] = await connection.execute('SELECT 1 as test');
    connection.release();
    
    const responseTime = Date.now() - start;
    
    res.json({
      status: 'healthy',
      database: true,
      connected: isConnected,
      responseTime,
      poolStatus: {
        total: pool.pool._allConnections.length,
        active: pool.pool._acquiringConnections.length,
        idle: pool.pool._freeConnections.length
      },
      reconnectAttempts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    // Try to reconnect on health check failure
    testDatabaseConnection();
    
    res.status(500).json({
      status: 'unhealthy',
      database: false,
      connected: isConnected,
      reconnectAttempts,
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, cpf } = req.body;

    // Check if user already exists
    const [existingUsers] = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Insert user
    await executeQuery(
      'INSERT INTO users (id, email, name, password_hash, phone, cpf) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, name, hashedPassword, phone, cpf]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: userId,
        email,
        name,
        phone,
        cpf,
        created_at: new Date().toISOString()
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await executeQuery(
      'SELECT id, email, name, password_hash, phone, cpf, created_at FROM users WHERE email = ? AND is_active = true',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Update last login
    await executeQuery(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        cpf: user.cpf,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// User routes
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify user can only update their own profile or is admin
    if (req.user.userId !== id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Build update query dynamically
    const allowedFields = ['name', 'phone', 'cpf', 'address', 'preferences'];
    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
    }

    updateValues.push(id);

    await executeQuery(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [users] = await executeQuery(
      'SELECT id, email, name, phone, cpf, address, preferences, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json(users[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Projects routes
app.get('/api/projects', async (req, res) => {
  try {
    const [projects] = await executeQuery(
      'SELECT * FROM projects WHERE status = ? ORDER BY created_at DESC',
      ['active']
    );

    // Parse JSON fields
    const formattedProjects = projects.map(project => ({
      ...project,
      images: project.images ? JSON.parse(project.images) : [],
      coordinates: project.coordinates ? JSON.parse(project.coordinates) : null,
      certifications: project.certifications ? JSON.parse(project.certifications) : [],
      project_details: project.project_details ? JSON.parse(project.project_details) : {}
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [projects] = await pool.execute(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    const project = projects[0];
    
    // Parse JSON fields
    const formattedProject = {
      ...project,
      images: project.images ? JSON.parse(project.images) : [],
      coordinates: project.coordinates ? JSON.parse(project.coordinates) : null,
      certifications: project.certifications ? JSON.parse(project.certifications) : [],
      project_details: project.project_details ? JSON.parse(project.project_details) : {}
    };

    res.json(formattedProject);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/projects/:id/purchase', async (req, res) => {
  try {
    const { id } = req.params;
    const { area } = req.body;

    if (!area || area <= 0) {
      return res.status(400).json({ error: 'Área inválida' });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if project has enough available area
      const [projects] = await connection.execute(
        'SELECT available_area FROM projects WHERE id = ? FOR UPDATE',
        [id]
      );

      if (projects.length === 0) {
        throw new Error('Projeto não encontrado');
      }

      const project = projects[0];
      if (project.available_area < area) {
        throw new Error('Área insuficiente disponível');
      }

      // Update project area
      await connection.execute(
        'UPDATE projects SET available_area = available_area - ?, sold_area = sold_area + ? WHERE id = ?',
        [area, area, id]
      );

      await connection.commit();
      connection.release();

      res.json({ success: true });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Purchase area error:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
});

// Social Projects routes
app.get('/api/social-projects', async (req, res) => {
  try {
    const [projects] = await pool.execute(
      'SELECT * FROM social_projects WHERE status = ? ORDER BY created_at DESC',
      ['active']
    );

    // Parse JSON fields
    const formattedProjects = projects.map(project => ({
      ...project,
      images: project.images ? JSON.parse(project.images) : [],
      documents: project.documents ? JSON.parse(project.documents) : []
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Get social projects error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Transactions routes
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { project_id, amount, area_purchased, payment_method, user_data } = req.body;
    const transactionId = uuidv4();

    await pool.execute(
      'INSERT INTO transactions (id, user_id, project_id, amount, area_purchased, payment_method, transaction_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [transactionId, req.user.userId, project_id, amount, area_purchased, payment_method, JSON.stringify(user_data)]
    );

    // Get created transaction
    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );

    res.status(201).json(transactions[0]);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/users/:userId/transactions', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can only see their own transactions
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json(transactions);
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Donations routes
app.post('/api/donations', async (req, res) => {
  try {
    const { donor_name, donor_email, donor_phone, social_project_id, amount, payment_method, message, is_anonymous } = req.body;
    const donationId = uuidv4();

    await pool.execute(
      'INSERT INTO donations (id, donor_name, donor_email, donor_phone, social_project_id, amount, payment_method, message, is_anonymous) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [donationId, donor_name, donor_email, donor_phone, social_project_id, amount, payment_method, message, is_anonymous]
    );

    // Update social project donations
    await pool.execute(
      'UPDATE social_projects SET donations_received = donations_received + ? WHERE id = ?',
      [amount, social_project_id]
    );

    // Get created donation
    const [donations] = await pool.execute(
      'SELECT * FROM donations WHERE id = ?',
      [donationId]
    );

    res.status(201).json(donations[0]);
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/social-projects/:id/donations', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [donations] = await pool.execute(
      'SELECT * FROM donations WHERE social_project_id = ? AND payment_status = ? ORDER BY created_at DESC',
      [id, 'completed']
    );

    res.json(donations);
  } catch (error) {
    console.error('Get project donations error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/donations/stats', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalCount,
        COALESCE(SUM(amount), 0) as totalAmount,
        COALESCE(AVG(amount), 0) as averageAmount
      FROM donations 
      WHERE payment_status = 'completed'
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Certificates routes
app.post('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const { user_id, transaction_id, project_id, area_m2, certificate_type } = req.body;
    const certificateId = uuidv4();
    const certificateNumber = `MFC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    // Calculate environmental impact
    const co2_offset_kg = area_m2 * 22; // 22kg CO2 per m2 per year
    const trees_planted = Math.floor(area_m2 * 0.1); // 0.1 trees per m2
    
    const issueDate = new Date();
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 30); // 30 years validity

    await pool.execute(
      'INSERT INTO certificates (id, certificate_number, user_id, transaction_id, project_id, area_m2, co2_offset_kg, trees_planted, issue_date, valid_until, certificate_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [certificateId, certificateNumber, user_id, transaction_id, project_id, area_m2, co2_offset_kg, trees_planted, issueDate, validUntil, certificate_type]
    );

    // Get created certificate
    const [certificates] = await pool.execute(
      'SELECT * FROM certificates WHERE id = ?',
      [certificateId]
    );

    res.status(201).json(certificates[0]);
  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/users/:userId/certificates', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const [certificates] = await pool.execute(
      'SELECT c.*, p.name as project_name FROM certificates c JOIN projects p ON c.project_id = p.id WHERE c.user_id = ? ORDER BY c.created_at DESC',
      [userId]
    );

    res.json(certificates);
  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/certificates/:certificateNumber', async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    
    const [certificates] = await pool.execute(
      'SELECT c.*, p.name as project_name, p.location as project_location, u.name as user_name FROM certificates c JOIN projects p ON c.project_id = p.id JOIN users u ON c.user_id = u.id WHERE c.certificate_number = ?',
      [certificateNumber]
    );

    if (certificates.length === 0) {
      return res.status(404).json({ error: 'Certificado não encontrado' });
    }

    res.json(certificates[0]);
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Contact routes
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const contactId = uuidv4();

    await pool.execute(
      'INSERT INTO contact_messages (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
      [contactId, name, email, subject, message]
    );

    res.status(201).json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// System settings routes
app.get('/api/system/settings', async (req, res) => {
  try {
    const [settings] = await pool.execute('SELECT * FROM system_settings');
    
    const formattedSettings = {};
    settings.forEach(setting => {
      try {
        formattedSettings[setting.setting_key] = setting.setting_type === 'json' 
          ? JSON.parse(setting.setting_value)
          : JSON.parse(setting.setting_value);
      } catch {
        formattedSettings[setting.setting_key] = setting.setting_value;
      }
    });

    res.json(formattedSettings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/system/settings', authenticateToken, async (req, res) => {
  try {
    const { key, value } = req.body;
    
    // Determine setting type
    let settingType = 'string';
    if (typeof value === 'number') settingType = 'number';
    if (typeof value === 'boolean') settingType = 'boolean';
    if (typeof value === 'object') settingType = 'json';
    
    const settingValue = typeof value === 'object' ? JSON.stringify(value) : JSON.stringify(value);
    
    await pool.execute(
      'INSERT INTO system_settings (id, setting_key, setting_value, setting_type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), setting_type = VALUES(setting_type), updated_at = CURRENT_TIMESTAMP',
      [uuidv4(), key, settingValue, settingType]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Dashboard/Analytics routes
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get basic stats
    const [projectStats] = await pool.execute('SELECT COUNT(*) as total_projects FROM projects WHERE status = "active"');
    const [userStats] = await pool.execute('SELECT COUNT(*) as total_users FROM users WHERE is_active = true');
    const [transactionStats] = await pool.execute('SELECT COUNT(*) as total_transactions, COALESCE(SUM(amount), 0) as total_revenue FROM transactions WHERE payment_status = "completed"');
    const [certificateStats] = await pool.execute('SELECT COUNT(*) as total_certificates FROM certificates WHERE status = "active"');
    const [donationStats] = await pool.execute('SELECT COUNT(*) as total_donations, COALESCE(SUM(amount), 0) as total_donation_amount FROM donations WHERE payment_status = "completed"');

    // Recent transactions
    const [recentTransactions] = await pool.execute(`
      SELECT t.id, t.amount, t.created_at, t.payment_status, u.name as user_name, p.name as project_name 
      FROM transactions t 
      JOIN users u ON t.user_id = u.id 
      JOIN projects p ON t.project_id = p.id 
      ORDER BY t.created_at DESC 
      LIMIT 10
    `);

    res.json({
      stats: {
        totalProjects: projectStats[0].total_projects,
        totalUsers: userStats[0].total_users,
        totalTransactions: transactionStats[0].total_transactions,
        totalRevenue: parseFloat(transactionStats[0].total_revenue),
        totalCertificates: certificateStats[0].total_certificates,
        totalDonations: donationStats[0].total_donations,
        totalDonationAmount: parseFloat(donationStats[0].total_donation_amount)
      },
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🌳 Minha Floresta API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;