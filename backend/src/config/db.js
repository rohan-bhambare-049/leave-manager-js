// One small place where the database connection lives.
// Locally this points to my own PostgreSQL, and on Vercel it points to Neon.
// Both are PostgreSQL, so the same queries work in both places.

require("dotenv").config();
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL is missing. Please copy .env.example to .env and fill it.");
}

// Neon needs SSL, local Postgres does not. So I keep it as a flag in .env
const useSsl = String(process.env.DATABASE_SSL).toLowerCase() === "true";

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  max: 5,
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err.message);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
