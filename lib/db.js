// lib/db.js
import mysql from 'mysql2/promise';

// Use environment variables instead of hardcoded values
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3308'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'fitlekdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// Export a query function that uses the pool
export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Optionally export the pool itself if you need it elsewhere
export { pool };