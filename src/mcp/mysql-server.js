#!/usr/bin/env node

/**
 * MCP Server for Minha Floresta Conservações MySQL Database
 * Provides programmatic access to the MySQL database via Model Context Protocol
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const mysql = require('mysql2/promise');

// Database configuration
const DB_CONFIG = {
  host: 'sql10.freesqldatabase.com',
  user: 'u271208684_minhafloresta', 
  password: 'B7Jz/vu~4s|Q',
  database: 'u271208684_minhafloresta',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(DB_CONFIG);

// MCP Server instance
const server = new Server(
  {
    name: 'minha-floresta-mysql',
    version: '1.0.0',
    description: 'MCP server for Minha Floresta Conservações MySQL database operations'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Helper function to execute queries safely
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return {
      success: true,
      data: rows,
      rowCount: Array.isArray(rows) ? rows.length : 1
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Helper function to get table info
async function getTableInfo(tableName) {
  const result = await executeQuery('DESCRIBE ??', [tableName]);
  if (result.success) {
    return result.data.map(col => ({
      field: col.Field,
      type: col.Type,
      null: col.Null === 'YES',
      key: col.Key,
      default: col.Default,
      extra: col.Extra
    }));
  }
  return [];
}

// Register tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'query_database',
        description: 'Execute a SELECT query on the database',
        inputSchema: {
          type: 'object',
          properties: {
            sql: {
              type: 'string',
              description: 'SQL SELECT query to execute'
            },
            params: {
              type: 'array',
              description: 'Parameters for prepared statement',
              items: { type: 'string' }
            }
          },
          required: ['sql']
        }
      },
      {
        name: 'insert_record',
        description: 'Insert a new record into a table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name'
            },
            data: {
              type: 'object',
              description: 'Data to insert (key-value pairs)'
            }
          },
          required: ['table', 'data']
        }
      },
      {
        name: 'update_record',
        description: 'Update records in a table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name'
            },
            data: {
              type: 'object',
              description: 'Data to update (key-value pairs)'
            },
            where: {
              type: 'object',
              description: 'WHERE conditions (key-value pairs)'
            }
          },
          required: ['table', 'data', 'where']
        }
      },
      {
        name: 'delete_record',
        description: 'Delete records from a table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name'
            },
            where: {
              type: 'object',
              description: 'WHERE conditions (key-value pairs)'
            }
          },
          required: ['table', 'where']
        }
      },
      {
        name: 'list_tables',
        description: 'List all tables in the database',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'describe_table',
        description: 'Get detailed information about a table structure',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to describe'
            }
          },
          required: ['table']
        }
      },
      {
        name: 'get_table_stats',
        description: 'Get statistics for all tables',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'backup_table',
        description: 'Create a backup of table data',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to backup'
            }
          },
          required: ['table']
        }
      },
      {
        name: 'test_connection',
        description: 'Test database connection and get server info',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'query_database': {
        const { sql, params = [] } = args;
        
        // Security check - only allow SELECT statements
        if (!sql.trim().toLowerCase().startsWith('select')) {
          throw new Error('Only SELECT queries are allowed for security');
        }
        
        const result = await executeQuery(sql, params);
        
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Query executed successfully. ${result.rowCount} rows returned.\n\n` +
                      `Data:\n${JSON.stringify(result.data, null, 2)}`
              }
            ]
          };
        } else {
          throw new Error(`Query failed: ${result.error}`);
        }
      }

      case 'insert_record': {
        const { table, data } = args;
        
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map(() => '?').join(', ');
        
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        const result = await executeQuery(sql, values);
        
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Record inserted successfully into ${table}.\nInserted data: ${JSON.stringify(data, null, 2)}`
              }
            ]
          };
        } else {
          throw new Error(`Insert failed: ${result.error}`);
        }
      }

      case 'update_record': {
        const { table, data, where } = args;
        
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        const params = [...Object.values(data), ...Object.values(where)];
        
        const result = await executeQuery(sql, params);
        
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Records updated successfully in ${table}.\nUpdated: ${JSON.stringify(data, null, 2)}\nWhere: ${JSON.stringify(where, null, 2)}`
              }
            ]
          };
        } else {
          throw new Error(`Update failed: ${result.error}`);
        }
      }

      case 'delete_record': {
        const { table, where } = args;
        
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
        
        const result = await executeQuery(sql, Object.values(where));
        
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Records deleted successfully from ${table}.\nWhere: ${JSON.stringify(where, null, 2)}`
              }
            ]
          };
        } else {
          throw new Error(`Delete failed: ${result.error}`);
        }
      }

      case 'list_tables': {
        const result = await executeQuery('SHOW TABLES');
        
        if (result.success) {
          const tables = result.data.map(row => Object.values(row)[0]);
          return {
            content: [
              {
                type: 'text',
                text: `Database tables (${tables.length}):\n${tables.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
              }
            ]
          };
        } else {
          throw new Error(`Failed to list tables: ${result.error}`);
        }
      }

      case 'describe_table': {
        const { table } = args;
        const tableInfo = await getTableInfo(table);
        
        if (tableInfo.length > 0) {
          return {
            content: [
              {
                type: 'text',
                text: `Table structure for '${table}':\n${JSON.stringify(tableInfo, null, 2)}`
              }
            ]
          };
        } else {
          throw new Error(`Table '${table}' not found or access denied`);
        }
      }

      case 'get_table_stats': {
        const tablesResult = await executeQuery('SHOW TABLES');
        if (!tablesResult.success) {
          throw new Error('Failed to get tables list');
        }
        
        const tables = tablesResult.data.map(row => Object.values(row)[0]);
        const stats = [];
        
        for (const table of tables) {
          const countResult = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
          if (countResult.success) {
            stats.push({
              table,
              records: countResult.data[0].count
            });
          }
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Database statistics:\n${JSON.stringify(stats, null, 2)}`
            }
          ]
        };
      }

      case 'backup_table': {
        const { table } = args;
        const result = await executeQuery(`SELECT * FROM ${table}`);
        
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Backup of table '${table}' (${result.rowCount} records):\n${JSON.stringify(result.data, null, 2)}`
              }
            ]
          };
        } else {
          throw new Error(`Backup failed: ${result.error}`);
        }
      }

      case 'test_connection': {
        try {
          const versionResult = await executeQuery('SELECT VERSION() as version, NOW() as current_time');
          const statusResult = await executeQuery('SHOW STATUS LIKE "Threads_connected"');
          
          if (versionResult.success) {
            const info = {
              status: 'Connected',
              version: versionResult.data[0].version,
              current_time: versionResult.data[0].current_time,
              host: DB_CONFIG.host,
              database: DB_CONFIG.database,
              connections: statusResult.success ? statusResult.data[0].Value : 'unknown'
            };
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Database connection test successful:\n${JSON.stringify(info, null, 2)}`
                }
              ]
            };
          } else {
            throw new Error('Connection test failed');
          }
        } catch (error) {
          throw new Error(`Connection test failed: ${error.message}`);
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Test connection on startup
  try {
    await pool.getConnection();
    console.error('✅ MCP Server started successfully - MySQL connection established');
  } catch (error) {
    console.error('❌ MCP Server startup failed - MySQL connection error:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('🛑 Shutting down MCP server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('🛑 Shutting down MCP server...');
  await pool.end();
  process.exit(0);
});

// Start server
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { server, pool };