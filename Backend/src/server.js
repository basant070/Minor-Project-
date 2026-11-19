/** Purpose: Load settings, connect services, and start the backend HTTP server. */
const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const connectDatabase = require("./config/database");
const { validateEmailConfiguration } = require("./services/emailService");

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  // Warn about email setup without blocking the API from starting.
  try {
    validateEmailConfiguration();
  } catch (error) {
    console.warn(`Email service configuration is incomplete: ${error.message}`);
  }

  // Start accepting requests only after the database connection attempt finishes.
  await connectDatabase();

  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start server:", error.message);
  process.exit(1);
});
