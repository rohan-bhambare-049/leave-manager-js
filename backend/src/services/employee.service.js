// Business rules for employees

const bcrypt = require("bcryptjs");
const employeeModel = require("../models/employee.model");
const AppError = require("../utils/AppError");

async function createEmployee(data) {
  const role = data.role || "employee";

  // A password is optional. It is only needed for the login part.
  let passwordHash = null;
  if (data.password) {
    passwordHash = await bcrypt.hash(String(data.password), 10);
  }

  try {
    return await employeeModel.insertEmployee({
      name: String(data.name).trim(),
      department: String(data.department).trim(),
      email: String(data.email).trim().toLowerCase(),
      role,
      passwordHash,
    });
  } catch (err) {
    // 23505 is the unique violation code in PostgreSQL
    if (err.code === "23505") {
      throw new AppError(409, "An employee with this email already exists");
    }
    throw err;
  }
}

async function listEmployees() {
  return employeeModel.findAllEmployees();
}

async function getEmployeeOrFail(id) {
  const employee = await employeeModel.findEmployeeById(id);
  if (!employee) {
    throw new AppError(404, "Employee not found");
  }
  return employee;
}

module.exports = { createEmployee, listEmployees, getEmployeeOrFail };
