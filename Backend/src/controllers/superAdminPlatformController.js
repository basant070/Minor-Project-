const mongoose = require("mongoose");
const AdminAuditLog = require("../models/AdminAuditLog");
const Department = require("../models/Department");
const ModerationReport = require("../models/ModerationReport");
const PlatformSettings = require("../models/PlatformSettings");
const Tenant = require("../models/Tenant");
const User = require("../models/User");

const ROLES = ["student", "alumni", "institute_admin"];
const USER_STATUSES = ["active", "pending", "suspended"];
const REPORT_STATUSES = ["open", "investigating", "resolved", "dismissed"];

const invalid = (res, message) => res.status(400).json({ message });
const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const listUsers = async (req, res, next) => {
  try {
    const filter = { role: { $in: ROLES } };
    if (req.query.role && ROLES.includes(req.query.role)) {
      filter.role = req.query.role;
    }
    if (req.query.status && USER_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("name email role tenantId status createdAt")
      .populate("tenantId", "name slug")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    return res.json({
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        tenant: user.tenantId
          ? {
              id: user.tenantId._id.toString(),
              name: user.tenantId.name,
              slug: user.tenantId.slug,
            }
          : null,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return invalid(res, "A valid user ID is required.");
    }
    if (!isObject(req.body)) {
      return invalid(res, "Request body must be a JSON object.");
    }

    const user = await User.findById(req.params.userId);
    if (!user || user.role === "super_admin" || user._id.equals(req.user.userId)) {
      return res.status(404).json({ message: "Manageable user not found." });
    }

    const patch = {};
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string" || !req.body.name.trim()) {
        return invalid(res, "Name cannot be empty.");
      }
      patch.name = req.body.name.trim();
    }
    if (req.body.role !== undefined) {
      if (!ROLES.includes(req.body.role)) {
        return invalid(res, "A valid non-super-admin role is required.");
      }
      patch.role = req.body.role;
    }
    if (req.body.status !== undefined) {
      if (!USER_STATUSES.includes(req.body.status)) {
        return invalid(res, "A valid user status is required.");
      }
      patch.status = req.body.status;
    }
    if (req.body.tenantId !== undefined) {
      if (!mongoose.isValidObjectId(req.body.tenantId)) {
        return invalid(res, "A valid university ID is required.");
      }
      if (!(await Tenant.exists({ _id: req.body.tenantId }))) {
        return res.status(404).json({ message: "University not found." });
      }
      patch.tenantId = req.body.tenantId;
    }
    if (Object.keys(patch).length === 0) {
      return invalid(res, "Provide at least one supported user field to update.");
    }

    Object.assign(user, patch);
    await user.save();
    return res.json({ message: "User updated successfully." });
  } catch (error) {
    if (error.name === "ValidationError") {
      return invalid(res, error.message);
    }
    return next(error);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.tenantId)) {
      return invalid(res, "A valid university ID is required.");
    }
    if (!isObject(req.body)) {
      return invalid(res, "Request body must be a JSON object.");
    }
    const patch = {};
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string" || !req.body.name.trim()) {
        return invalid(res, "University name cannot be empty.");
      }
      patch.name = req.body.name.trim();
    }
    if (req.body.slug !== undefined) {
      if (
        typeof req.body.slug !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(req.body.slug.trim())
      ) {
        return invalid(res, "A valid university slug is required.");
      }
      patch.slug = req.body.slug.trim().toLowerCase();
    }
    if (req.body.status !== undefined) {
      if (!["active", "inactive"].includes(req.body.status)) {
        return invalid(res, "University status must be active or inactive.");
      }
      patch.status = req.body.status;
    }
    if (!Object.keys(patch).length) {
      return invalid(res, "Provide a name, slug, or status to update.");
    }

    const tenant = await Tenant.findByIdAndUpdate(
      req.params.tenantId,
      { $set: patch },
      { new: true, runValidators: true },
    );
    if (!tenant) {
      return res.status(404).json({ message: "University not found." });
    }
    return res.json({ message: "University updated successfully.", tenant });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "That university slug is already in use." });
    }
    if (error.name === "ValidationError") {
      return invalid(res, error.message);
    }
    return next(error);
  }
};

const getDashboard = async (_req, res, next) => {
  try {
    const [tenantCount, userCount, departmentCount, reportCount, roles, statuses] =
      await Promise.all([
        Tenant.countDocuments(),
        User.countDocuments({ role: { $in: ROLES } }),
        Department.countDocuments(),
        ModerationReport.countDocuments({ status: { $in: ["open", "investigating"] } }),
        User.aggregate([
          { $match: { role: { $in: ROLES } } },
          { $group: { _id: "$role", count: { $sum: 1 } } },
        ]),
        Tenant.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);
    return res.json({
      statistics: {
        universities: tenantCount,
        users: userCount,
        departments: departmentCount,
        openReports: reportCount,
        usersByRole: Object.fromEntries(roles.map(({ _id, count }) => [_id, count])),
        universitiesByStatus: Object.fromEntries(
          statuses.map(({ _id, count }) => [_id, count]),
        ),
      },
      telemetryAvailable: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
};

const listDepartments = async (_req, res, next) => {
  try {
    const departments = await Department.find()
      .populate("tenantId", "name slug")
      .sort({ "tenantId.name": 1, name: 1 })
      .lean();
    return res.json({ departments });
  } catch (error) {
    return next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    if (!isObject(req.body)) return invalid(res, "Request body must be a JSON object.");
    const { tenantId, name, code } = req.body;
    if (
      !mongoose.isValidObjectId(tenantId) ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof code !== "string" ||
      !/^[a-z0-9-]{2,16}$/i.test(code.trim())
    ) {
      return invalid(res, "University, department name, and a 2-16 character code are required.");
    }
    if (!(await Tenant.exists({ _id: tenantId }))) {
      return res.status(404).json({ message: "University not found." });
    }
    const department = await Department.create({
      tenantId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
    });
    return res.status(201).json({ department });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "That department code already exists for this university." });
    }
    if (error.name === "ValidationError") return invalid(res, error.message);
    return next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.departmentId)) {
      return invalid(res, "A valid department ID is required.");
    }
    if (!isObject(req.body)) return invalid(res, "Request body must be a JSON object.");
    const patch = {};
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string" || !req.body.name.trim()) {
        return invalid(res, "Department name cannot be empty.");
      }
      patch.name = req.body.name.trim();
    }
    if (req.body.code !== undefined) {
      if (
        typeof req.body.code !== "string" ||
        !/^[a-z0-9-]{2,16}$/i.test(req.body.code.trim())
      ) {
        return invalid(res, "Department code must be 2-16 letters, numbers, or hyphens.");
      }
      patch.code = req.body.code.trim().toUpperCase();
    }
    if (req.body.status !== undefined) {
      if (!["active", "inactive"].includes(req.body.status)) {
        return invalid(res, "Department status must be active or inactive.");
      }
      patch.status = req.body.status;
    }
    if (!Object.keys(patch).length) return invalid(res, "Provide a supported department field.");
    const department = await Department.findByIdAndUpdate(
      req.params.departmentId,
      { $set: patch },
      { new: true, runValidators: true },
    );
    if (!department) return res.status(404).json({ message: "Department not found." });
    return res.json({ department });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "That department code already exists for this university." });
    }
    if (error.name === "ValidationError") return invalid(res, error.message);
    return next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.departmentId)) {
      return invalid(res, "A valid department ID is required.");
    }
    const department = await Department.findByIdAndDelete(req.params.departmentId);
    if (!department) return res.status(404).json({ message: "Department not found." });
    return res.json({ message: "Department deleted." });
  } catch (error) {
    return next(error);
  }
};

const getSettings = async (_req, res, next) => {
  try {
    const settings = await PlatformSettings.findOneAndUpdate(
      { key: "global" },
      { $setOnInsert: { key: "global" } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
    return res.json({ settings });
  } catch (error) {
    return next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    if (!isObject(req.body)) return invalid(res, "Request body must be a JSON object.");
    const allowedBooleans = [
      "maintenanceMode",
      "registrationsEnabled",
      "aiRecommendationsEnabled",
      "mentorMatchingEnabled",
    ];
    const patch = {};
    for (const key of allowedBooleans) {
      if (req.body[key] !== undefined) {
        if (typeof req.body[key] !== "boolean") {
          return invalid(res, `${key} must be true or false.`);
        }
        patch[key] = req.body[key];
      }
    }
    if (req.body.permissions !== undefined) {
      if (!isObject(req.body.permissions)) return invalid(res, "Permissions must be an object.");
      const permissions = {};
      for (const [role, values] of Object.entries(req.body.permissions)) {
        if (!ROLES.includes(role) || !Array.isArray(values) ||
          values.some((value) => typeof value !== "string" || value.length > 80)) {
          return invalid(res, "Permissions must contain valid platform roles and permission names.");
        }
        permissions[role] = [...new Set(values)];
      }
      patch.permissions = permissions;
    }
    if (!Object.keys(patch).length) return invalid(res, "Provide at least one setting to update.");
    const settings = await PlatformSettings.findOneAndUpdate(
      { key: "global" },
      { $set: patch, $setOnInsert: { key: "global" } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return res.json({ message: "Platform settings saved.", settings });
  } catch (error) {
    return next(error);
  }
};

const getAiStatus = async (_req, res, next) => {
  try {
    const settings = await PlatformSettings.findOne({ key: "global" }).lean();
    return res.json({
      providerConfigured: Boolean(process.env.AI_PROVIDER_API_KEY),
      providerName: process.env.AI_PROVIDER_NAME || null,
      recommendationsEnabled: Boolean(settings?.aiRecommendationsEnabled),
      mentorMatchingEnabled: Boolean(settings?.mentorMatchingEnabled),
      telemetryAvailable: false,
      message: process.env.AI_PROVIDER_API_KEY
        ? "Provider credentials are configured; runtime usage telemetry is not yet collected."
        : "No AI provider is configured. Feature switches are saved, but AI services are not active.",
    });
  } catch (error) {
    return next(error);
  }
};

const listReports = async (_req, res, next) => {
  try {
    const reports = await ModerationReport.find()
      .populate("tenantId", "name slug")
      .sort({ severity: -1, createdAt: -1 })
      .limit(500)
      .lean();
    return res.json({ reports });
  } catch (error) {
    return next(error);
  }
};

const createReport = async (req, res, next) => {
  try {
    if (!isObject(req.body)) return invalid(res, "Request body must be a JSON object.");
    const { title, details, category, severity, tenantId, reporterName } = req.body;
    if (
      typeof title !== "string" || !title.trim() || title.trim().length > 160 ||
      typeof details !== "string" || !details.trim() || details.trim().length > 4000 ||
      !["safety", "harassment", "spam", "fraud", "other"].includes(category) ||
      !["low", "medium", "high", "critical"].includes(severity)
    ) {
      return invalid(res, "A title, details, valid category, and severity are required.");
    }
    if (tenantId && (!mongoose.isValidObjectId(tenantId) ||
      !(await Tenant.exists({ _id: tenantId })))) {
      return invalid(res, "Choose a valid university or leave it unassigned.");
    }
    const report = await ModerationReport.create({
      title: title.trim(),
      details: details.trim(),
      category,
      severity,
      tenantId: tenantId || null,
      reporterName: typeof reporterName === "string" ? reporterName.trim().slice(0, 120) : "",
    });
    return res.status(201).json({ report });
  } catch (error) {
    if (error.name === "ValidationError") return invalid(res, error.message);
    return next(error);
  }
};

const updateReport = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.reportId)) {
      return invalid(res, "A valid report ID is required.");
    }
    if (!isObject(req.body) || !REPORT_STATUSES.includes(req.body.status)) {
      return invalid(res, "A valid report status is required.");
    }
    const report = await ModerationReport.findByIdAndUpdate(
      req.params.reportId,
      { $set: { status: req.body.status } },
      { new: true, runValidators: true },
    );
    if (!report) return res.status(404).json({ message: "Report not found." });
    return res.json({ message: "Report status updated.", report });
  } catch (error) {
    return next(error);
  }
};

const getAnalytics = async (_req, res, next) => {
  try {
    const [tenants, userStats] = await Promise.all([
      Tenant.find().select("name slug status").sort({ name: 1 }).lean(),
      User.aggregate([
        { $match: { role: { $in: ROLES } } },
        {
          $group: {
            _id: { tenantId: "$tenantId", role: "$role", status: "$status" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);
    const byTenant = new Map();
    for (const row of userStats) {
      const key = row._id.tenantId ? row._id.tenantId.toString() : "unassigned";
      const tenantStats = byTenant.get(key) || { users: 0, activeUsers: 0, byRole: {} };
      tenantStats.users += row.count;
      if (row._id.status === "active") tenantStats.activeUsers += row.count;
      tenantStats.byRole[row._id.role] =
        (tenantStats.byRole[row._id.role] || 0) + row.count;
      byTenant.set(key, tenantStats);
    }
    return res.json({
      tenants: tenants.map((tenant) => ({
        ...tenant,
        id: tenant._id.toString(),
        ...(byTenant.get(tenant._id.toString()) || {
          users: 0,
          activeUsers: 0,
          byRole: {},
        }),
      })),
      generatedAt: new Date().toISOString(),
      telemetryAvailable: false,
      notice:
        "Usage reflects current account counts only. Application events, latency, and uptime are not instrumented yet.",
    });
  } catch (error) {
    return next(error);
  }
};

const listAuditLogs = async (_req, res, next) => {
  try {
    const logs = await AdminAuditLog.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return res.json({
      logs: logs.map((log) => ({
        id: log._id.toString(),
        actorEmail: log.actorEmail,
        method: log.method,
        path: log.path,
        statusCode: log.statusCode,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createDepartment,
  createReport,
  deleteDepartment,
  getAiStatus,
  getAnalytics,
  getDashboard,
  getSettings,
  listAuditLogs,
  listDepartments,
  listReports,
  listUsers,
  updateDepartment,
  updateReport,
  updateSettings,
  updateTenant,
  updateUser,
};
