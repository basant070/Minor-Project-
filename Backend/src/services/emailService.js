const nodemailer = require("nodemailer");

const getMissingEmailVariables = () =>
  [
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASSWORD",
    "EMAIL_FROM",
    "CLIENT_URL",
  ].filter((variable) => !process.env[variable]?.trim());

const getPlaceholderEmailVariables = () => {
  const placeholderPatterns = [
    "your_",
    "example.com",
    "replace_with",
    "smtp.example",
  ];
  return ["EMAIL_HOST", "EMAIL_USER", "EMAIL_PASSWORD", "EMAIL_FROM"].filter(
    (variable) => {
      const value = process.env[variable]?.trim().toLowerCase() || "";
      return placeholderPatterns.some((pattern) => value.includes(pattern));
    },
  );
};

const getEmailConfig = () => {
  const missingVariables = getMissingEmailVariables();
  const placeholderVariables = getPlaceholderEmailVariables();
  if (missingVariables.length || placeholderVariables.length) {
    const problems = [
      missingVariables.length && `Missing: ${missingVariables.join(", ")}`,
      placeholderVariables.length &&
        `Replace placeholder values for: ${placeholderVariables.join(", ")}`,
    ].filter(Boolean);
    const error = new Error(
      `Email service configuration is incomplete. ${problems.join(". ")}. Restart the backend after updating Backend/.env.`,
    );
    error.code = "EMAIL_DELIVERY_NOT_CONFIGURED";
    throw error;
  }

  const port = Number(process.env.EMAIL_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    const error = new Error(
      "Email delivery is not configured. EMAIL_PORT must be a valid port number from 1 to 65535.",
    );
    error.code = "EMAIL_DELIVERY_NOT_CONFIGURED";
    throw error;
  }
  if (!process.env.EMAIL_HOST.trim()) {
    const error = new Error("EMAIL_HOST must not be empty.");
    error.code = "EMAIL_DELIVERY_NOT_CONFIGURED";
    throw error;
  }

  let frontendUrl;
  try {
    frontendUrl = new URL(process.env.CLIENT_URL);
  } catch {
    const error = new Error(
      "Email delivery is not configured. CLIENT_URL must be a valid frontend URL.",
    );
    error.code = "EMAIL_DELIVERY_NOT_CONFIGURED";
    throw error;
  }
  if (!["http:", "https:"].includes(frontendUrl.protocol)) {
    const error = new Error(
      "Email delivery is not configured. CLIENT_URL must use HTTP or HTTPS.",
    );
    error.code = "EMAIL_DELIVERY_NOT_CONFIGURED";
    throw error;
  }

  return {
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    from: process.env.EMAIL_FROM,
    frontendUrl: frontendUrl.origin,
  };
};

const createTransporter = (config) =>
  nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

const describeEmailError = (error) => {
  const code = String(error.code || "UNKNOWN").toUpperCase();
  const responseCode = Number(error.responseCode);

  if (["EAUTH", "AUTH"].includes(code) || [530, 534, 535].includes(responseCode)) {
    return "SMTP authentication failed. Check EMAIL_USER and EMAIL_PASSWORD; for Gmail use an App Password.";
  }
  if (["ENOTFOUND", "EAI_AGAIN"].includes(code)) {
    return "SMTP host could not be resolved. Check EMAIL_HOST and network/DNS access.";
  }
  if (["ECONNECTION", "ECONNREFUSED", "ETIMEDOUT", "ESOCKET"].includes(code)) {
    return "SMTP connection failed. Check EMAIL_HOST, EMAIL_PORT, TLS settings, and outbound network access.";
  }
  if (["EENVELOPE", "EMESSAGE"].includes(code)) {
    return "SMTP rejected the message or sender. Check EMAIL_FROM and the provider's sender verification.";
  }

  return `Email delivery failed with SMTP error ${code}${responseCode ? ` (${responseCode})` : ""}.`;
};

const logEmailFailure = (context, error) => {
  console.error(`${context}: ${describeEmailError(error)}`);
};

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const sendVerificationEmail = async ({ email, name }, token) => {
  const config = getEmailConfig();
  const transporter = createTransporter(config);
  const verificationUrl = new URL("/verify-email", config.frontendUrl);
  verificationUrl.searchParams.set("token", token);
  const safeName = escapeHtml(name);

  try {
    await transporter.sendMail({
      from: config.from,
      to: email,
      subject: "Verify your Student–Alumni Connect email",
      text: [
        `Hello ${name},`,
        "",
        "Thank you for registering with Student–Alumni Connect.",
        "Verify your email address using this link:",
        verificationUrl.toString(),
        "",
        "This link expires in 24 hours. If you did not create this account, you can ignore this email.",
      ].join("\n"),
      html: [
        `<p>Hello ${safeName},</p>`,
        "<p>Thank you for registering with Student–Alumni Connect.</p>",
        `<p><a href="${verificationUrl.toString()}">Verify my email</a></p>`,
        "<p>This link expires in 24 hours. If you did not create this account, you can ignore this email.</p>",
      ].join(""),
    });
  } catch (deliveryError) {
    logEmailFailure("Email sending failed", deliveryError);
    const error = new Error("Verification email could not be sent.");
    error.code = "EMAIL_DELIVERY_FAILED";
    throw error;
  }
};

const sendInstituteAdminWelcomeEmail = async (
  { email, name, instituteName },
  password,
) => {
  const config = getEmailConfig();
  const transporter = createTransporter(config);
  const safeName = escapeHtml(name);
  const safeInstituteName = escapeHtml(instituteName);
  const safeEmail = escapeHtml(email);
  const safePassword = escapeHtml(password);

  try {
    await transporter.sendMail({
      from: config.from,
      to: email,
      subject: `Your ${instituteName} institute admin account`,
      text: [
        `Hello ${name},`,
        "",
        `Congratulations! Your institute administrator account for ${instituteName} has been created.`,
        "",
        `Login email: ${email}`,
        `Password: ${password}`,
        "",
        "Please keep your credentials confidential, use them responsibly, and do not share your password with anyone.",
        `Log in here: ${config.frontendUrl}/login`,
      ].join("\n"),
      html: [
        `<p>Hello ${safeName},</p>`,
        `<p>Congratulations! Your institute administrator account for <strong>${safeInstituteName}</strong> has been created.</p>`,
        `<p><strong>Login email:</strong> ${safeEmail}<br>`,
        `<strong>Password:</strong> ${safePassword}</p>`,
        "<p>Please keep your credentials confidential, use your administrator access responsibly, and do not share your password with anyone.</p>",
        `<p><a href="${config.frontendUrl}/login">Log in to Student–Alumni Connect</a></p>`,
      ].join(""),
    });
  } catch (deliveryError) {
    logEmailFailure("Institute admin welcome email failed", deliveryError);
    const error = new Error("Institute admin welcome email could not be sent.");
    error.code = "EMAIL_DELIVERY_FAILED";
    throw error;
  }
};

const sendTestEmail = async () => {
  const config = getEmailConfig();
  const transporter = createTransporter(config);

  try {
    await transporter.sendMail({
      from: config.from,
      to: config.auth.user,
      subject: "Student-Alumni Connect SMTP test",
      text: "SMTP email delivery is configured successfully.",
    });
  } catch (error) {
    logEmailFailure("Email test failed", error);
    throw new Error("SMTP test email could not be sent.");
  }
};

const validateEmailConfiguration = () => getEmailConfig();

module.exports = {
  sendInstituteAdminWelcomeEmail,
  sendTestEmail,
  sendVerificationEmail,
  validateEmailConfiguration,
};
