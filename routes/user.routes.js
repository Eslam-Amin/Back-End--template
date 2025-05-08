const express = require("express");

// User Validators
const {
  changeUserPasswordValidator,
  updateLoggedUserValidator,
  deactivateLoggedUserValidator,
} = require("../validators/user.validator");

// User Controllers
const {
  getUser,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deactivateLoggedUser,
} = require("../controllers/user.controllers");

// Constants
const { USER } = require("../utils/constants");

// Auth Middleware
const { protect, allowedTo } = require("../middlewares/auth.middleware");

// Router
const router = express.Router();

// Protect
router.use(protect, allowedTo(USER));

// Logged user routes
router.get("/getMe", protect, getUser);

router.patch(
  "/changeMyPassword",
  changeUserPasswordValidator,
  updateLoggedUserPassword
);

router.patch("/updateMe", updateLoggedUserValidator, updateLoggedUserData);

router.delete("/deleteMe", deactivateLoggedUserValidator, deactivateLoggedUser);

module.exports = router;
