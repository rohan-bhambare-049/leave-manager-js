const authService = require("../services/auth.service");
const { isValidEmail, isNonEmptyString } = require("../utils/validate");

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

function me(req, res) {
  return res.status(200).json({ user: req.user });
}

module.exports = { login, me };
