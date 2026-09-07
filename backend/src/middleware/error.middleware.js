// One place that turns errors into clean JSON responses.

const AppError = require("../utils/AppError");

function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} does not exist` });
}

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body is not valid JSON" });
  }

  console.error(err);
  return res.status(500).json({ error: "Something went wrong on the server" });
}

module.exports = { notFound, errorHandler };
