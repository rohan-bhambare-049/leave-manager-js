// Vercel looks inside the api folder and runs this file as a serverless function.
// It simply exports the same Express app.

module.exports = require("../src/app");
