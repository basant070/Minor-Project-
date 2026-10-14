const express = require("express");
const {
  createInstitute,
  createInstituteAdmin,
  deleteInstituteAdmin,
  listInstituteAdmins,
  listInstitutes,
} = require("../controllers/superAdminController");
const {
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
} = require("../controllers/superAdminPlatformController");
const AdminAuditLog = require("../models/AdminAuditLog");
const User = require("../models/User");
const authorizeRoles = require("../middleware/authorizeRoles");
const protect = require("../middleware/protect");

const router = express.Router();

const recordAdminActivity = (req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }

  const sendJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return sendJson(body);
    }

    return User.findById(req.user.userId)
      .select("email")
      .then((actor) => {
        if (!actor) {
          throw new Error("Super admin account disappeared during audit logging.");
        }
        return AdminAuditLog.create({
          actorId: actor._id,
          actorEmail: actor.email,
          method: req.method,
          path: req.originalUrl.split("?")[0],
          statusCode: res.statusCode,
        });
      })
      .then(
        () => sendJson(body),
        (error) => {
        console.error("Could not write super admin audit log:", error);
        return sendJson(body);
        },
      );
  };
  return next();
};

router.use(protect, authorizeRoles("super_admin"), recordAdminActivity);
router.get("/dashboard", getDashboard);
router.post("/institutes", createInstitute);
router.get("/institutes", listInstitutes);
router.patch("/institutes/:tenantId", updateTenant);
router.get("/admins", listInstituteAdmins);
router.post("/institutes/:tenantId/admins", createInstituteAdmin);
router.delete("/admins/:adminId", deleteInstituteAdmin);
router.get("/users", listUsers);
router.patch("/users/:userId", updateUser);
router.get("/departments", listDepartments);
router.post("/departments", createDepartment);
router.patch("/departments/:departmentId", updateDepartment);
router.delete("/departments/:departmentId", deleteDepartment);
router.get("/settings", getSettings);
router.patch("/settings", updateSettings);
router.get("/ai/status", getAiStatus);
router.get("/reports", listReports);
router.post("/reports", createReport);
router.patch("/reports/:reportId", updateReport);
router.get("/analytics", getAnalytics);
router.get("/audit-logs", listAuditLogs);

module.exports = router;
