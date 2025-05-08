const express = require("express");

// Validators
const { loginValidator } = require("../validators/admin.validator");

// Auth Controllers
const {
  login,
  verifyAccount,
  adminForgotPassword,
  adminResetPassword,
} = require("../controllers/adminAuth.controllers");

// Constants
const { SUPER_ADMIN, ADMIN } = require("../utils/constants");

// Auth middleware
const { protect, allowedTo } = require("../middlewares/auth.middleware");

// Router
const router = express.Router();

// Auth Routes
router.route("/login").post(loginValidator, login);
router
  .route("/verifyAccount")
  .post(protect, allowedTo(SUPER_ADMIN, ADMIN), verifyAccount);

// Reset Password Routes
router.route("/forgotPassword").post(adminForgotPassword);
router
  .route("/resetPassword")
  .patch(protect, allowedTo("superAdmin", "admin"), adminResetPassword);

module.exports = router;
