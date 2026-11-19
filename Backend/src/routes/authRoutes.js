/** Purpose: Map public account actions and the signed-in profile URL to handlers. */
const express = require("express");
const {
  login,
  profile,
  register,
  resendVerification,
  verifyEmail,
} = require("../controllers/authController");
const authenticate = require("../middleware/authMiddlerware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/profile", authenticate, profile);

module.exports = router;