const leaveService = require("../services/leave.service");
const {
  validateLeaveInput,
  validateStatusInput,
  isPositiveInteger,
  LEAVE_STATUSES,
} = require("../utils/validate");

async function createLeave(req, res, next) {
  try {
    const errors = validateLeaveInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Please check the data you sent", details: errors });
    }

    const leave = await leaveService.createLeave({
      employee_id: Number(req.body.employee_id),
      leave_type: req.body.leave_type,
      from_date: req.body.from_date,
      to_date: req.body.to_date,
      reason: req.body.reason,
    });

    return res.status(201).json(leave);
  } catch (err) {
    return next(err);
  }
}

async function listLeaves(req, res, next) {
  try {
    const { employee_id, status } = req.query;

    if (employee_id !== undefined && !isPositiveInteger(employee_id)) {
      return res.status(400).json({ error: "employee_id filter must be a positive number" });
    }
    if (status !== undefined && !LEAVE_STATUSES.includes(status)) {
      return res.status(400).json({
        error: "status filter must be one of " + LEAVE_STATUSES.join(", "),
      });
    }

    const leaves = await leaveService.listLeaves({
      employee_id: employee_id ? Number(employee_id) : undefined,
      status,
    });

    return res.status(200).json(leaves);
  } catch (err) {
    return next(err);
  }
}

async function updateLeaveStatus(req, res, next) {
  try {
    if (!isPositiveInteger(req.params.id)) {
      return res.status(400).json({ error: "Leave id must be a positive number" });
    }

    const errors = validateStatusInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Please check the data you sent", details: errors });
    }

    const leave = await leaveService.changeLeaveStatus(Number(req.params.id), req.body.status);
    return res.status(200).json(leave);
  } catch (err) {
    return next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    if (!isPositiveInteger(req.params.employee_id)) {
      return res.status(400).json({ error: "employee_id must be a positive number" });
    }

    const summary = await leaveService.getSummary(Number(req.params.employee_id));
    return res.status(200).json(summary);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createLeave, listLeaves, updateLeaveStatus, getSummary };
