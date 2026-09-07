// For Express Only

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const employeeRoutes = require("./routes/employee.routes");
const leaveRoutes = require("./routes/leave.routes");
const authRoutes = require("./routes/auth.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

// A simple health route, useful after deploying on Vercel
app.get("/", (req, res) => {
  res.json({ message: "Online Free Leave Manager API is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/leaves", leaveRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
