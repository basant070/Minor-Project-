const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const PlatformSettings = require("../models/PlatformSettings");
const Tenant = require("../models/Tenant");
const User = require("../models/User");

const protect = (req, res, next) => {
  const authorization = req.get("authorization");
  const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT_SECRET is not configured."));
  }

  try {
    req.user = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired." });
    }
    return res.status(401).json({ message: "Invalid token." });
  }

  const payload = req.user;
  if (
    !mongoose.isValidObjectId(payload.userId) ||
    !["student", "alumni", "institute_admin", "super_admin"].includes(
      payload.role,
    ) ||
    (payload.role === "super_admin"
      ? payload.tenantId !== null
      : !mongoose.isValidObjectId(payload.tenantId))
  ) {
    return res.status(401).json({ message: "Invalid token." });
  }

  User.findById(payload.userId)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Account no longer exists." });
      }
      if (user.status !== "active") {
        return res.status(403).json({ message: "This account is not active." });
      }

      const tenantId = user.tenantId ? user.tenantId.toString() : null;
      if (user.role !== payload.role || tenantId !== payload.tenantId) {
        return res.status(401).json({ message: "Invalid token." });
      }

      if (tenantId) {
        return Promise.all([
          Tenant.exists({ _id: tenantId, status: "active" }),
          user.role === "super_admin"
            ? Promise.resolve(null)
            : PlatformSettings.findOne({ key: "global" }).select("maintenanceMode"),
        ])
          .then(([tenant, settings]) => {
            if (!tenant) return res.status(403).json({ message: "This university is inactive." });
            if (settings?.maintenanceMode) {
              return res.status(503).json({ message: "The platform is in maintenance mode." });
            }
            return next();
          })
          .catch(next);
      }

      if (user.role !== "super_admin") {
        return PlatformSettings.findOne({ key: "global" })
          .select("maintenanceMode")
          .then((settings) => {
            if (settings?.maintenanceMode) {
              return res.status(503).json({ message: "The platform is in maintenance mode." });
            }
            return next();
          })
          .catch(next);
      }

      return next();
    })
    .catch(next);
};

module.exports = protect;
