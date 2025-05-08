const express = require("express");

// Validators
const {
  signupValidator,
  loginValidator,
} = require("../validators/user.validator");

// Auth Controllers
const {
  signup,
  login,
  verifyAccount,
} = require("../controllers/userAuth.controllers");

// Reset Password Controllers
const {
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require("../controllers/userResetPassword.controllers");

// Router
const router = express.Router();

// Auth Routes
router.route("/signup").post(signupValidator, signup);
router.route("/login").post(loginValidator, login);
router.route("/verifyAccount").post(verifyAccount);
//  Routes
router.route("/forgotPassword").post(forgotPassword);
router.route("/verifyResetCode").post(verifyResetCode);
router.route("/resetPassword").patch(resetPassword);

module.exports = router;
