const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const {
  sendTestEmail,
  validateEmailConfiguration,
} = require("../src/services/emailService");

const run = async () => {
  try {
    validateEmailConfiguration();
    await sendTestEmail();
    console.log("SMTP test email sent to the configured sender account.");
  } catch (error) {
    console.error("SMTP test failed:", error.message);
    process.exitCode = 1;
  }
};

run();
