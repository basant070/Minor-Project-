/** Purpose: Map institute-admin account-listing and removal URLs to protected handlers. */
const express = require("express");
const {
  listAlumni,
  listStudents,
  removeUser,
} = require("../controllers/instituteAdminController");
const authorizeRoles = require("../middleware/authorizeRoles");
const authorizePermission = require("../middleware/authorizePermission");
const protect = require("../middleware/protect");

const router = express.Router();

// All institute-admin routes require both a valid account and the admin role.
router.use(protect, authorizeRoles("institute_admin"));
router.get("/students", authorizePermission("users.manage"), listStudents);
router.get("/alumni", authorizePermission("users.manage"), listAlumni);
router.delete("/users/:userId", authorizePermission("users.manage"), removeUser);

module.exports = router;
