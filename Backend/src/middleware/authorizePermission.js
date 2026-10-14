const PlatformSettings = require("../models/PlatformSettings");

const DEFAULT_PERMISSIONS = {
  institute_admin: ["users.manage", "departments.manage", "reports.review"],
};

const authorizePermission = (permission) => async (req, res, next) => {
  try {
    const settings = await PlatformSettings.findOne({ key: "global" }).select(
      "permissions",
    );
    const rolePermissions =
      settings?.permissions?.[req.user.role] ||
      DEFAULT_PERMISSIONS[req.user.role] ||
      [];
    if (!rolePermissions.includes(permission)) {
      return res.status(403).json({ message: "This role does not have the required permission." });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authorizePermission;
