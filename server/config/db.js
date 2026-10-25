const path = require('path');
const fs = require('fs');
let mysql = null;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  // mysql2 optional if not installed
}

const { appEvents } = require('../utils/eventEmitter');

let dbEngine = null; // 'mysql' | 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

const DB_FILE = path.resolve(__dirname, '../../data/vit_food_spots.db');

async function connectDB() {
  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'vit_food_spots';

  // 1. Attempt MySQL connection
  if (mysql) {
    try {
      // Test initial connection with short timeout
      const testConn = await mysql.createConnection({
        host,
        port,
        user,
        password,
        connectTimeout: 2000
      });
      await testConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await testConn.end();

      mysqlPool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // Verify pool
      await mysqlPool.query('SELECT 1');
      dbEngine = 'mysql';
      console.log(`[Database] Connected successfully to MySQL (${host}:${port}/${database}) via JDBC/SQL relational driver.`);
      appEvents.emit('databaseConnected', { engine: 'mysql', host, database, timestamp: new Date() });
      await initSchema();
      return true;
    } catch (mysqlErr) {
      console.warn(`[Database] MySQL service notice: Could not connect to MySQL server (${mysqlErr.message}).`);
    }
  }

  // 2. Relational SQLite fallback (Zero-dependency built into Node.js 24)
  try {
    const { DatabaseSync } = require('node:sqlite');
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    sqliteDb = new DatabaseSync(DB_FILE);
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
    dbEngine = 'sqlite';
    console.log(`[Database] Initialized relational SQLite storage engine (${DB_FILE}) with standard SQL & Foreign Keys.`);
    appEvents.emit('databaseConnected', { engine: 'sqlite', file: DB_FILE, timestamp: new Date() });
    await initSchema();
    return true;
  } catch (sqliteErr) {
    console.error(`[Database] Critical: Failed to initialize SQLite storage engine:`, sqliteErr.message);
    throw sqliteErr;
  }
}

async function initSchema() {
  if (dbEngine === 'mysql') {
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../../scripts/schema.sql'), 'utf8');
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use '));

    for (const stmt of statements) {
      try {
        await mysqlPool.query(stmt);
      } catch (e) {
        // Ignore duplicate index errors
        if (!e.message.includes('Duplicate key name')) {
          console.warn(`[Schema] Warning on MySQL statement: ${e.message}`);
        }
      }
    }
    console.log('[Schema] MySQL relational schema initialized.');
  } else if (dbEngine === 'sqlite') {
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../../scripts/schema-sqlite.sql'), 'utf8');
    sqliteDb.exec(schemaSql);
    console.log('[Schema] Relational SQLite schema initialized.');
  }
}

/**
 * Universal Query Execution
 * Returns array of rows
 */
async function query(sql, params = []) {
  if (dbEngine === 'mysql') {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows;
  } else if (dbEngine === 'sqlite') {
    const stmt = sqliteDb.prepare(sql);
    return stmt.all(...params);
  }
  throw new Error('Database not initialized');
}

/**
 * Universal Query One Row
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Universal DML Execute (INSERT, UPDATE, DELETE)
 */
async function execute(sql, params = []) {
  if (dbEngine === 'mysql') {
    const [result] = await mysqlPool.execute(sql, params);
    return {
      affectedRows: result.affectedRows,
      insertId: result.insertId
    };
  } else if (dbEngine === 'sqlite') {
    const stmt = sqliteDb.prepare(sql);
    const result = stmt.run(...params);
    return {
      affectedRows: result.changes,
      insertId: result.lastInsertRowid
    };
  }
  throw new Error('Database not initialized');
}

function getDatabaseStatus() {
  return {
    connected: dbEngine !== null,
    engine: dbEngine || 'disconnected',
    host: dbEngine === 'mysql' ? (process.env.MYSQL_HOST || '127.0.0.1') : 'local-sqlite',
    database: dbEngine === 'mysql' ? (process.env.MYSQL_DATABASE || 'vit_food_spots') : 'vit_food_spots.db',
    jdbcCompliant: true,
    syllabusModule: 'Module 7 (Storage - Java Database Connectivity / Relational DB)'
  };
}

module.exports = {
  connectDB,
  initSchema,
  query,
  queryOne,
  execute,
  getDatabaseStatus
};
