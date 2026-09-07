// Reads the Bearer token and checks the role.

const jwt = require("jsonwebtoken");

function requireLogin(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Login token is missing" });
  }

  const token = header.replace("Bearer ", "").trim();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Login token is not valid" });
  }
}

function requireHr(req, res, next) {
  if (!req.user || req.user.role !== "hr") {
    return res.status(403).json({ error: "Only HR can do this action" });
  }
  return next();
}

module.exports = { requireLogin, requireHr };
