const mongoose = require("mongoose");
const Tenant = require("../models/Tenant");
const User = require("../models/User");
const { sendInstituteAdminWelcomeEmail } = require("../services/emailService");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const safeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  tenantId: user.tenantId ? user.tenantId.toString() : null,
  status: user.status,
});

const createInstitute = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ message: "Request body must be a JSON object." });
    }

    const { name, slug } = req.body;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug.trim())
    ) {
      return res.status(400).json({
        message: "A name and a valid institute slug are required.",
      });
    }

    const institute = await Tenant.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      status: "active",
    });

    return res.status(201).json({
      message: "Institute created successfully.",
      institute,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An institute with this slug already exists." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
};

const listInstitutes = async (_req, res, next) => {
  try {
    const institutes = await Tenant.find()
      .select("name slug status createdAt")
      .sort({ name: 1 });

    return res.json({ institutes });
  } catch (error) {
    return next(error);
  }
};

const listInstituteAdmins = async (_req, res, next) => {
  try {
    const admins = await User.find({ role: "institute_admin" })
      .select("name email role tenantId status createdAt")
      .populate("tenantId", "name slug")
      .sort({ name: 1 });

    return res.json({
      admins: admins.map((admin) => ({
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        createdAt: admin.createdAt,
        institute: admin.tenantId
          ? {
              id: admin.tenantId._id.toString(),
              name: admin.tenantId.name,
              slug: admin.tenantId.slug,
            }
          : null,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const createInstituteAdmin = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ message: "Request body must be a JSON object." });
    }

    const { name, email, password } = req.body;
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

    if (!mongoose.isValidObjectId(req.params.tenantId)) {
      return res.status(400).json({ message: "A valid institute ID is required." });
    }

    const institute = await Tenant.findById(req.params.tenantId);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "institute_admin",
      tenantId: institute._id,
      status: "active",
    });

    let emailSent = true;
    try {
      await sendInstituteAdminWelcomeEmail(
        {
          email: admin.email,
          name: admin.name,
          instituteName: institute.name,
        },
        password,
      );
    } catch (error) {
      emailSent = false;
      console.error("Institute admin welcome email delivery failed:", error.message);
    }

    return res.status(201).json({
      message: emailSent
        ? "Institute admin created successfully. Welcome email sent."
        : "Institute admin account was created, but the welcome email could not be sent.",
      emailSent,
      user: safeUser(admin),
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

const deleteInstituteAdmin = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.adminId)) {
      return res.status(400).json({ message: "A valid admin ID is required." });
    }

    const admin = await User.findOneAndDelete({
      _id: req.params.adminId,
      role: "institute_admin",
    }).select("name email");

    if (!admin) {
      return res.status(404).json({ message: "Institute admin not found." });
    }

    return res.json({
      message: `Institute admin ${admin.email} was deleted.`,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createInstitute,
  createInstituteAdmin,
  deleteInstituteAdmin,
  listInstituteAdmins,
  listInstitutes,
};
