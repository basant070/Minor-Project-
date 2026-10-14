const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const PlatformSettings = require("../models/PlatformSettings");
const Department = require("../models/Department");
const Tenant = require("../models/Tenant");
const User = require("../models/User");
const {
  sendVerificationEmail,
  validateEmailConfiguration,
} = require("../services/emailService");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

const createEmailVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  return {
    token,
    tokenHash,
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
  };
};

const safeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  tenantId: user.tenantId ? user.tenantId.toString() : null,
  departmentId: user.departmentId ? user.departmentId.toString() : null,
  status: user.status,
});

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured.");
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      tenantId: user.tenantId ? user.tenantId.toString() : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );
};

const register = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ message: "Request body must be a JSON object." });
    }

    const { name, email, password, role, tenantId, departmentId } = req.body;

    if (!["student", "alumni"].includes(role)) {
      return res.status(400).json({
        message: "Public registration is only available for students and alumni.",
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !EMAIL_PATTERN.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Name, a valid email, and a password of at least 8 characters are required.",
      });
    }

    if (!mongoose.isValidObjectId(tenantId)) {
      return res.status(400).json({ message: "A valid institute is required." });
    }
    if (!mongoose.isValidObjectId(departmentId)) {
      return res.status(400).json({ message: "A valid department is required." });
    }

    const tenant = await Tenant.findOne({ _id: tenantId, status: "active" });
    if (!tenant) {
      return res.status(400).json({ message: "The selected institute is unavailable." });
    }

    const department = await Department.findOne({
      _id: departmentId,
      tenantId: tenant._id,
      status: "active",
    });
    if (!department) {
      return res.status(400).json({
        message: "The selected department is unavailable for this institute.",
      });
    }

    const settings = await PlatformSettings.findOne({ key: "global" }).select(
      "registrationsEnabled",
    );
    if (settings?.registrationsEnabled === false) {
      return res.status(403).json({ message: "New registrations are currently disabled." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.exists({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const verification = createEmailVerificationToken();
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      tenantId: tenant._id,
      departmentId: department._id,
      emailVerified: false,
      emailVerificationToken: verification.tokenHash,
      emailVerificationExpires: verification.expiresAt,
      status: role === "alumni" ? "pending" : "active",
    });

    try {
      await sendVerificationEmail(user, verification.token);
    } catch (error) {
      console.error("Verification email delivery failed:", error.message);
      const isMissingConfiguration =
        error.code === "EMAIL_DELIVERY_NOT_CONFIGURED";
      return res.status(503).json({
        message: isMissingConfiguration
          ? `Your account was created, but no verification email was sent. ${error.message}`
          : "Your account was created, but the verification email could not be sent. Check the backend SMTP settings and try resending it later.",
        code: error.code,
      });
    }

    return res.status(201).json({
      message:
        "Registration successful. We sent a verification email; please verify your address before logging in.",
      user: safeUser(user),
      verificationRequired: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({ message: "The verification link is invalid or expired." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOneAndUpdate(
      {
        emailVerificationToken: tokenHash,
        emailVerificationExpires: { $gt: new Date() },
        emailVerified: false,
        role: { $in: ["student", "alumni"] },
      },
      {
        $set: { emailVerified: true },
        $unset: {
          emailVerificationToken: "",
          emailVerificationExpires: "",
        },
      },
      { new: true },
    );

    if (!user) {
      return res.status(400).json({ message: "The verification link is invalid or expired." });
    }

    return res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    return next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ message: "Request body must be a JSON object." });
    }

    const { email } = req.body;
    if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
      return res.status(400).json({ message: "A valid email address is required." });
    }

    try {
      validateEmailConfiguration();
    } catch (error) {
      console.error("Verification email configuration error:", error.message);
      return res.status(503).json({
        message:
          "Verification email delivery is currently unavailable. Please try again later.",
        code: error.code || "EMAIL_DELIVERY_NOT_CONFIGURED",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      email: normalizedEmail,
      role: { $in: ["student", "alumni"] },
      emailVerified: false,
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (user) {
      const verification = createEmailVerificationToken();
      user.emailVerificationToken = verification.tokenHash;
      user.emailVerificationExpires = verification.expiresAt;
      await user.save();
      try {
        await sendVerificationEmail(user, verification.token);
      } catch (error) {
        console.error("Verification email delivery failed:", error.code);
        return res.status(503).json({
          message:
            "Verification email delivery is currently unavailable. Please try again later.",
          code: error.code || "EMAIL_DELIVERY_FAILED",
        });
      }
    }

    return res.status(202).json({
      message:
        "If an unverified account exists for this email, a verification email has been requested.",
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ message: "Request body must be a JSON object." });
    }

    const { email, password } = req.body;
    if (
      typeof email !== "string" ||
      !EMAIL_PATTERN.test(email.trim()) ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+password",
    );
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (
      ["student", "alumni"].includes(user.role) &&
      user.emailVerified === false
    ) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "This account has been suspended." });
    }
    if (user.status === "pending") {
      return res.status(403).json({ message: "This account is pending approval." });
    }

    return res.json({
      token: createToken(user),
      user: safeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const profile = (req, res) => {
  return res.json({ user: safeUser(req.user) });
};

module.exports = { register, login, profile, resendVerification, verifyEmail };