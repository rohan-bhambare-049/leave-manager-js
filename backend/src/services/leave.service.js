// Business rules for leave requests

const leaveModel = require("../models/leave.model");
const employeeModel = require("../models/employee.model");
const AppError = require("../utils/AppError");

function countDays(from, to) {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.round(diff / oneDay) + 1;
}

async function createLeave(data) {
  const employee = await employeeModel.findEmployeeById(data.employee_id);
  if (!employee) {
    throw new AppError(404, "Employee not found");
  }

  // Small business rule: a person cannot apply for the same dates twice
  const existing = await leaveModel.findLeaves({ employee_id: data.employee_id });
  const clash = existing.find(
    (leave) =>
      leave.status !== "rejected" &&
      new Date(leave.from_date) <= new Date(data.to_date) &&
      new Date(leave.to_date) >= new Date(data.from_date)
  );
  if (clash) {
    throw new AppError(409, "This employee already has a leave request in these dates");
  }

  return leaveModel.insertLeave(data);
}

async function listLeaves(filters) {
  return leaveModel.findLeaves(filters);
}

async function changeLeaveStatus(id, status) {
  const leave = await leaveModel.findLeaveById(id);
  if (!leave) {
    throw new AppError(404, "Leave request not found");
  }
  if (leave.status !== "pending") {
    throw new AppError(409, `This leave request is already ${leave.status}`);
  }
  return leaveModel.updateLeaveStatus(id, status);
}

async function getSummary(employeeId) {
  const employee = await employeeModel.findEmployeeById(employeeId);
  if (!employee) {
    throw new AppError(404, "Employee not found");
  }

  const rows = await leaveModel.findSummaryByEmployee(employeeId);

  const byType = {};
  let totalDays = 0;
  rows.forEach((row) => {
    byType[row.leave_type] = {
      total_requests: Number(row.total_requests),
      total_days: Number(row.total_days),
    };
    totalDays += Number(row.total_days);
  });

  return {
    employee_id: employee.id,
    employee_name: employee.name,
    total_days: totalDays,
    by_type: byType,
  };
}

module.exports = { countDays, createLeave, listLeaves, changeLeaveStatus, getSummary };
