// Only For SQL

const db = require("../config/db");

const PUBLIC_COLUMNS = "id, name, department, email, role, created_at";

async function insertEmployee({ name, department, email, role, passwordHash }) {
  const result = await db.query(
    `INSERT INTO employees (name, department, email, role, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${PUBLIC_COLUMNS}`,
    [name, department, email, role, passwordHash]
  );
  return result.rows[0];
}

async function findAllEmployees() {
  const result = await db.query(
    `SELECT ${PUBLIC_COLUMNS} FROM employees ORDER BY id`
  );
  return result.rows;
}

async function findEmployeeById(id) {
  const result = await db.query(
    `SELECT ${PUBLIC_COLUMNS} FROM employees WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// This one also brings the password hash, because login needs it.
async function findEmployeeByEmailWithPassword(email) {
  const result = await db.query(
    `SELECT id, name, department, email, role, password_hash
     FROM employees WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  return result.rows[0] || null;
}

module.exports = {
  insertEmployee,
  findAllEmployees,
  findEmployeeById,
  findEmployeeByEmailWithPassword,
};
