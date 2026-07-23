// lib/db.js
import mysql from 'mysql2/promise';

// Configuration du pool
const poolConfig = {
  host: "blok55lz6chdyrkje20u-mysql.services.clever-cloud.com",
  user: "us2pff5iyntvd12p",
  password: "9HzSYURU36QjPKSDEyLv",
  database: "blok55lz6chdyrkje20u",
  port: "3306",
  waitForConnections: true,
  connectionLimit: 3, // le plan Clever Cloud plafonne à 5 max_user_connections, on garde de la marge
  queueLimit: 0,
};

let pool;

if (process.env.NODE_ENV === 'production') {
  pool = mysql.createPool(poolConfig);
} else {
  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool(poolConfig);
  }
  pool = global._mysqlPool;
}

export async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export default pool;