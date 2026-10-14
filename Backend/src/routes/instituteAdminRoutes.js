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

router.use(protect, authorizeRoles("institute_admin"));
router.get("/students", authorizePermission("users.manage"), listStudents);
router.get("/alumni", authorizePermission("users.manage"), listAlumni);
router.delete("/users/:userId", authorizePermission("users.manage"), removeUser);

module.exports = router;
