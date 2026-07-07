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
  connectionLimit: 3,       // reste sous la limite de 5 imposée par l'hébergeur
  maxIdle: 3,               // ferme les connexions inactives
  idleTimeout: 60000,       // 60s avant de fermer une connexion inactive
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Astuce cruciale pour le dev : on stocke le pool dans `global`
// pour qu'il survive au hot-reload de Next.js.
// Sans ça, chaque sauvegarde de fichier recrée un nouveau pool
// et empile de nouvelles connexions jusqu'à dépasser max_user_connections.
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