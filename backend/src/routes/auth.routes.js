const express = require("express");
const authController = require("../controllers/auth.controller");
const { requireLogin } = require("../middleware/auth.middleware");

const router = express.Router();

// POST /auth/login
router.post("/login", authController.login);

// GET /auth/me -> tells you who is logged in
router.get("/me", requireLogin, authController.me);

module.exports = router;
