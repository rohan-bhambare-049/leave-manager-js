const express = require("express");
const employeeController = require("../controllers/employee.controller");

const router = express.Router();

// POST /employees  -> create a new employee
router.post("/", employeeController.createEmployee);

// GET /employees   -> helper route, the frontend uses it to fill the dropdown
router.get("/", employeeController.listEmployees);

// GET /employees/:id
router.get("/:id", employeeController.getEmployee);

module.exports = router;
