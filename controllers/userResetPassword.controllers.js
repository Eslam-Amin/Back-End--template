const asyncHandler = require("express-async-handler");
const crypto = require("crypto");

const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Check email
  if (!req.body.email) {
    return next(new ApiError("Email address is required", 400));
  }
  // Check User
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(`Invalid email address`, 404));
  }
  // Random 6 digits
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // Save hashed reset code in DB
  user.passwordResetCode = hashedResetCode;
  user.passwordResetCodeExp = Date.now() + 10 * 60 * 1000;
  user.passwordResetCodeVerified = false;
  await user.save();
  // Send email
  const msg = `Hi ${user.firstName} ${user.lastName},\nwe received a request to reset the password on your Tick Money Account.\n\n${resetCode}\n\nEnter this code to complete the reset.\nThanks for helping us keep your accoun secure.\n`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Tick Money account reset code",
      message: msg,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExp = undefined;
    user.passwordResetCodeVerified = undefined;
    await user.save();
    return next(
      new ApiError("Unable to send reset code, please try again later.", 422)
    );
  }
  // Response
  res.status(200).json({
    success: true,
    msg: "Reset code sent to email",
    email: user.email,
    codeExp: user.passwordResetCodeExp,
  });
});

// @desc    Verify reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  // Check body
  if (!req.body.resetCode) {
    return next(new ApiError("Reset code is required", 400));
  }
  if (!req.body.email) {
    return next(new ApiError("Email address is required", 400));
  }
  // Hash code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  // Get user
  const user = await User.findOne({ email: req.body.email });
  // Check user
  if (!user) {
    return next(new ApiError(`Invalid email address`, 404));
  }
  // Check code expiration
  if (Date.now() >= Date.parse(user.passwordResetCodeExp)) {
    return next(new ApiError("Reset code is expired", 401));
  }
  // Check code
  if (user.passwordResetCode !== hashedResetCode) {
    return next(new ApiError("Invalid reset code", 401));
  }
  // Update user => verified
  user.passwordResetCodeVerified = true;
  await user.save();
  // Response
  res.status(200).json({
    success: true,
    msg: "Reset code verified successfully",
    email: user.email,
  });
});

// @desc    Reset password
// @route   PATCH /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword, confirmNewPassword } = req.body;
  // Check email
  if (!email) return next(new ApiError("Email address is required", 400));
  // Check new password
  if (!newPassword) return next(new ApiError("New password is required", 400));
  // Check new password length
  if (newPassword.length < 6) throw new Error("Too short password");
  // Check confirm password
  if (!confirmNewPassword)
    return next(new ApiError("Confirm new password is required", 400));
  // Check passwords
  if (newPassword !== confirmNewPassword)
    return next(new ApiError("Passwords don't match", 400));
  // Check user
  const user = await User.findOne({ email: email });
  if (!user) return next(new ApiError(`Invalid email address`, 404));
  // Check reset code verified field
  if (!user.passwordResetCodeVerified) {
    return next(new ApiError(`Reset code is not verified`, 401));
  }
  // Update user data
  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExp = undefined;
  user.passwordResetCodeVerified = undefined;
  await user.save();
  // Response
  res.status(200).json({
    success: true,
    msg: "Password is reset successfully",
  });
});
