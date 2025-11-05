const mysql = require('mysql2/promise');

// Enhanced database configuration for maximum reliability
const dbConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'u271208684_minhafloresta',
  password: 'B7Jz/vu~4s|Q',
  database: 'u271208684_minhafloresta',
  port: 3306,
  timezone: '+00:00',
  // Connection settings for reliability
  acquireTimeout: 60000,        // 60 seconds to acquire connection
  timeout: 60000,               // 60 seconds query timeout
  reconnect: true,              // Auto-reconnect on connection loss
  connectTimeout: 60000,        // 60 seconds initial connection timeout
  // Performance settings
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
  // SSL configuration (if needed)
  ssl: false
};

// Enhanced connection pool configuration
const poolConfig = {
  ...dbConfig,
  waitForConnections: true,     // Queue requests when all connections busy
  connectionLimit: 20,          // Max concurrent connections
  maxIdle: 10,                  // Max idle connections
  idleTimeout: 60000,           // Close idle connections after 60s
  queueLimit: 0,                // No limit on queued requests
  enableKeepAlive: true,        // Keep connections alive
  keepAliveInitialDelay: 0      // Start keep-alive immediately
};

// Create connection pool
const pool = mysql.createPool(poolConfig);

// Connection monitoring
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

// Test connection function
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    if (!isConnected) {
      console.log('🟢 Database connection established');
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
      console.log(`🔄 Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
      setTimeout(testConnection, 5000);
    }
    return false;
  }
}

// Enhanced query executor with automatic retry
async function executeQuery(sql, params = [], retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📊 Executing query (attempt ${attempt}/${retries}):`, sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
      
      const connection = await pool.getConnection();
      const startTime = Date.now();
      
      let result;
      if (params.length > 0) {
        result = await connection.execute(sql, params);
      } else {
        result = await connection.query(sql);
      }
      
      const duration = Date.now() - startTime;
      connection.release();
      
      console.log(`✅ Query completed in ${duration}ms`);
      return result;
      
    } catch (error) {
      console.log(`❌ Query attempt ${attempt} failed:`, error.message);
      
      // Check if connection is still valid
      await testConnection();
      
      if (attempt === retries) {
        console.log(`🚨 Query failed after ${retries} attempts:`, sql.substring(0, 100));
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(Math.pow(2, attempt) * 1000 + Math.random() * 1000, 10000);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Transaction wrapper with retry logic
async function executeTransaction(queries) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    console.log('🔄 Starting database transaction');
    
    const results = [];
    for (const { sql, params } of queries) {
      const result = await connection.execute(sql, params || []);
      results.push(result);
    }
    
    await connection.commit();
    console.log('✅ Transaction committed successfully');
    return results;
    
  } catch (error) {
    await connection.rollback();
    console.log('🔙 Transaction rolled back due to error:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Batch operations for better performance
async function executeBatch(sql, paramBatches) {
  const connection = await pool.getConnection();
  
  try {
    console.log(`📦 Executing batch operation with ${paramBatches.length} items`);
    const results = [];
    
    for (const params of paramBatches) {
      const result = await connection.execute(sql, params);
      results.push(result);
    }
    
    console.log(`✅ Batch operation completed`);
    return results;
    
  } catch (error) {
    console.log('❌ Batch operation failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Pool health monitoring
function monitorPool() {
  setInterval(async () => {
    try {
      const poolStats = {
        total: pool.pool._allConnections.length,
        active: pool.pool._acquiringConnections.length,
        idle: pool.pool._freeConnections.length
      };
      
      console.log(`📊 Pool stats - Total: ${poolStats.total}, Active: ${poolStats.active}, Idle: ${poolStats.idle}`);
      
      // Test connection health
      await testConnection();
      
    } catch (error) {
      console.log('⚠️ Pool monitoring error:', error.message);
    }
  }, 30000); // Check every 30 seconds
}

// Initialize monitoring
testConnection();
monitorPool();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Closing database pool...');
  await pool.end();
  process.exit(0);
});

module.exports = {
  pool,
  executeQuery,
  executeTransaction,
  executeBatch,
  testConnection,
  getConnectionStatus: () => ({ isConnected, reconnectAttempts })
};