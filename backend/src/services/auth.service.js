// For the bonus JWT part

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const employeeModel = require("../models/employee.model");
const AppError = require("../utils/AppError");

async function login(email, password) {
  const employee = await employeeModel.findEmployeeByEmailWithPassword(email);

  if (!employee || !employee.password_hash) {
    throw new AppError(401, "Email or password is wrong");
  }

  const ok = await bcrypt.compare(String(password), employee.password_hash);
  if (!ok) {
    throw new AppError(401, "Email or password is wrong");
  }

  const token = jwt.sign(
    { id: employee.id, email: employee.email, role: employee.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  return {
    token,
    user: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
    },
  };
}

module.exports = { login };
