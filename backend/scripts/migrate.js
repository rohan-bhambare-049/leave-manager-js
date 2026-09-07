// Small script that runs db/schema.sql once.
// Run it with: npm run migrate

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool } = require("../src/config/db");

async function migrate() {
  const file = path.join(__dirname, "..", "db", "schema.sql");
  const sql = fs.readFileSync(file, "utf8");

  try {
    await pool.query(sql);
    console.log("Tables are ready.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
