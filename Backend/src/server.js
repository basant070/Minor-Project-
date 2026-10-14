const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const connectDatabase = require("./config/database");
const { validateEmailConfiguration } = require("./services/emailService");

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    validateEmailConfiguration();
  } catch (error) {
    console.warn(`Email service configuration is incomplete: ${error.message}`);
  }

  await connectDatabase();

  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start server:", error.message);
  process.exit(1);
});
