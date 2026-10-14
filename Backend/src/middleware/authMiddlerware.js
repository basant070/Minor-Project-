const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  const authorization = req.get("authorization");
  const [scheme, token] = authorization ? authorization.split(" ") : [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT_SECRET is not configured."));
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !mongoose.isValidObjectId(payload.userId) ||
    !["student", "alumni", "institute_admin", "super_admin"].includes(
      payload.role,
    ) ||
    (payload.role === "super_admin"
      ? payload.tenantId !== null
      : !mongoose.isValidObjectId(payload.tenantId))
  ) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  try {
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    if (user.status !== "active") {
      return res.status(403).json({ message: "This account is not active." });
    }

    const userTenantId = user.tenantId ? user.tenantId.toString() : null;
    if (user.role !== payload.role || userTenantId !== payload.tenantId) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    req.auth = {
      userId: payload.userId,
      role: payload.role,
      tenantId: payload.tenantId,
    };
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authenticate;