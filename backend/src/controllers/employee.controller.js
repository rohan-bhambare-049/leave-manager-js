// Controllers only read the request, call the service and send the response.

const employeeService = require("../services/employee.service");
const { validateEmployeeInput } = require("../utils/validate");

async function createEmployee(req, res, next) {
  try {
    const errors = validateEmployeeInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Please check the data you sent", details: errors });
    }

    const employee = await employeeService.createEmployee(req.body);
    return res.status(201).json(employee);
  } catch (err) {
    return next(err);
  }
}

async function listEmployees(req, res, next) {
  try {
    const employees = await employeeService.listEmployees();
    return res.status(200).json(employees);
  } catch (err) {
    return next(err);
  }
}

async function getEmployee(req, res, next) {
  try {
    const employee = await employeeService.getEmployeeOrFail(req.params.id);
    return res.status(200).json(employee);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createEmployee, listEmployees, getEmployee };
