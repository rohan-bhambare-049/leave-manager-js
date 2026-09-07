// Validation helpers

const LEAVE_TYPES = ["casual", "sick", "earned", "unpaid"];
const LEAVE_STATUSES = ["pending", "approved", "rejected"];
const ROLES = ["employee", "hr"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value) {
  if (!isNonEmptyString(value)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidDate(value) {
  if (!isNonEmptyString(value)) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime());
}

function isPositiveInteger(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

// Checks the body of POST /employees
function validateEmployeeInput(body = {}) {
  const errors = [];

  if (!isNonEmptyString(body.name)) {
    errors.push("name is required");
  }
  if (!isNonEmptyString(body.department)) {
    errors.push("department is required");
  }
  if (!isValidEmail(body.email)) {
    errors.push("email must be a valid email address");
  }
  if (body.role !== undefined && !ROLES.includes(body.role)) {
    errors.push("role must be either employee or hr");
  }
  if (body.password !== undefined && String(body.password).length < 6) {
    errors.push("password must have at least 6 characters");
  }

  return errors;
}

// Checks the body of POST /leaves
function validateLeaveInput(body = {}) {
  const errors = [];

  if (!isPositiveInteger(body.employee_id)) {
    errors.push("employee_id must be a positive number");
  }
  if (!LEAVE_TYPES.includes(body.leave_type)) {
    errors.push("leave_type must be one of " + LEAVE_TYPES.join(", "));
  }
  if (!isValidDate(body.from_date)) {
    errors.push("from_date must be in YYYY-MM-DD format");
  }
  if (!isValidDate(body.to_date)) {
    errors.push("to_date must be in YYYY-MM-DD format");
  }
  if (isValidDate(body.from_date) && isValidDate(body.to_date)) {
    if (new Date(body.to_date) < new Date(body.from_date)) {
      errors.push("to_date cannot be before from_date");
    }
  }

  return errors;
}

// Checks the body of PATCH /leaves/:id/status
function validateStatusInput(body = {}) {
  const errors = [];
  if (body.status !== "approved" && body.status !== "rejected") {
    errors.push("status must be either approved or rejected");
  }
  return errors;
}

module.exports = {
  LEAVE_TYPES,
  LEAVE_STATUSES,
  ROLES,
  isNonEmptyString,
  isValidEmail,
  isValidDate,
  isPositiveInteger,
  validateEmployeeInput,
  validateLeaveInput,
  validateStatusInput,
};
