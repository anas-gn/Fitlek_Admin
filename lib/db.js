import mysql from 'mysql2/promise';

const poolConfig = {
  host: process.env.DB_HOST || "51.170.143.251",
  user: process.env.DB_USER || "sirvya",
  password: process.env.DB_PASSWORD || "Sirvya@Backend2026",
  database: process.env.DB_NAME || "sirvya",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
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