const express = require("express");
const authorizeRoles = require("../middleware/authorizeRoles");
const protect = require("../middleware/protect");

const router = express.Router();

router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  (_req, res) => res.json({ message: "Student test route accessed successfully." }),
);
router.get(
  "/alumni",
  protect,
  authorizeRoles("alumni"),
  (_req, res) => res.json({ message: "Alumni test route accessed successfully." }),
);
router.get(
  "/institute-admin",
  protect,
  authorizeRoles("institute_admin"),
  (_req, res) =>
    res.json({ message: "Institute admin test route accessed successfully." }),
);
router.get(
  "/super-admin",
  protect,
  authorizeRoles("super_admin"),
  (_req, res) =>
    res.json({ message: "Super admin test route accessed successfully." }),
);

module.exports = router;
