/** Purpose: Configure shared request handling and connect each API route group. */
const cors = require("cors");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const instituteAdminRoutes = require("./routes/instituteAdminRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const testRoutes = require("./routes/testRoutes");
const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();

// Allow browser requests from the configured frontend and parse JSON request bodies.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);
app.use(express.json({ limit: "10kb" }));

// Group API addresses by the kind of account or information they serve.
app.use("/api/auth", authRoutes);
app.use("/api/institute-admin", instituteAdminRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/test", testRoutes);

// Keep unknown routes and unexpected errors on the same response path.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
