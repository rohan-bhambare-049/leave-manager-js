// Only For SQL

const db = require("../config/db");

async function insertLeave({ employee_id, leave_type, from_date, to_date, reason }) {
  const result = await db.query(
    `INSERT INTO leave_requests (employee_id, leave_type, from_date, to_date, reason)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, employee_id, leave_type, from_date, to_date, status, reason, created_at`,
    [employee_id, leave_type, from_date, to_date, reason || null]
  );
  return result.rows[0];
}

// employee_id and status are both optional filters
async function findLeaves({ employee_id, status }) {
  const conditions = [];
  const params = [];

  if (employee_id) {
    params.push(employee_id);
    conditions.push(`l.employee_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`l.status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.query(
    `SELECT l.id, l.employee_id, e.name AS employee_name, l.leave_type,
            l.from_date, l.to_date, l.status, l.reason, l.created_at
     FROM leave_requests l
     JOIN employees e ON e.id = l.employee_id
     ${where}
     ORDER BY l.id DESC`,
    params
  );
  return result.rows;
}

async function findLeaveById(id) {
  const result = await db.query(
    `SELECT id, employee_id, leave_type, from_date, to_date, status, reason
     FROM leave_requests WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function updateLeaveStatus(id, status) {
  const result = await db.query(
    `UPDATE leave_requests
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, employee_id, leave_type, from_date, to_date, status, reason`,
    [status, id]
  );
  return result.rows[0] || null;
}

// Total approved leave days grouped by leave type
async function findSummaryByEmployee(employeeId) {
  const result = await db.query(
    `SELECT leave_type,
            COUNT(*)::int AS total_requests,
            SUM(to_date - from_date + 1)::int AS total_days
     FROM leave_requests
     WHERE employee_id = $1 AND status = 'approved'
     GROUP BY leave_type
     ORDER BY leave_type`,
    [employeeId]
  );
  return result.rows;
}

module.exports = {
  insertLeave,
  findLeaves,
  findLeaveById,
  updateLeaveStatus,
  findSummaryByEmployee,
};
