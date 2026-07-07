/**
 * Create or reset an admin account with a properly hashed password.
 *
 * The bundled fitlekdb.sql sample data ships with fake / non-bcrypt password
 * hashes for the demo admin row, so login won't work against it until you
 * run this once.
 *
 * Usage:
 *   node scripts/create-admin.js admin@fitlek.com "MyStrongPassword!" "Admin" "Fitlek"
 *
 * Reads DB connection settings from .env.local (via dotenv) or from the
 * environment (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME).
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function main() {
  const [email, password, firstName = "Admin", lastName = "Fitlek"] = process.argv.slice(2);

  if (!email || !password) {
    console.error(
      'Usage: node scripts/create-admin.js <email> <password> ["FirstName"] ["LastName"]'
    );
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "fitlekdb"
  });

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length) {
      await connection.execute(
        "UPDATE users SET passwordHash = ?, role = 'admin', isApproved = 1 WHERE email = ?",
        [passwordHash, email]
      );
      console.log(`Compte existant mis à jour en admin : ${email}`);
    } else {
      await connection.execute(
        `INSERT INTO users (firstName, lastName, email, passwordHash, role, gender, isPremium, isApproved)
         VALUES (?, ?, ?, ?, 'admin', 'Other', 0, 1)`,
        [firstName, lastName, email, passwordHash]
      );
      console.log(`Nouveau compte admin créé : ${email}`);
    }
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("Échec :", err.message);
  process.exit(1);
});
