const express = require("express");
const leaveController = require("../controllers/leave.controller");
const { requireLogin, requireHr } = require("../middleware/auth.middleware");

const router = express.Router();

// POST /leaves -> submit a leave request
router.post("/", leaveController.createLeave);

// GET /leaves?employee_id=&status= -> list with filters
router.get("/", leaveController.listLeaves);

// GET /leaves/summary/:employee_id -> total leaves taken by type
router.get("/summary/:employee_id", leaveController.getSummary);

// PATCH /leaves/:id/status -> only HR can approve or reject
router.patch("/:id/status", requireLogin, requireHr, leaveController.updateLeaveStatus);

module.exports = router;
