// Adds one HR user and one normal employee so that testing is easy.
// Run it with: npm run seed

require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("../src/config/db");

const people = [
  {
    name: "Priya Sharma",
    department: "Human Resources",
    email: "hr@company.com",
    role: "hr",
    password: "hr12345",
  },
  {
    name: "Rohan Roy",
    department: "Engineering",
    email: "rohan@company.com",
    role: "employee",
    password: "emp12345",
  },
];

async function seed() {
  try {
    for (const person of people) {
      const hash = await bcrypt.hash(person.password, 10);
      await pool.query(
        `INSERT INTO employees (name, department, email, role, password_hash)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [person.name, person.department, person.email, person.role, hash]
      );
      console.log("Added or already present:", person.email);
    }
    console.log("Seeding done. HR login is hr@company.com / hr12345");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
