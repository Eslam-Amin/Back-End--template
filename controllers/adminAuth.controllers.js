const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const Admin = require("../models/admin.model");
const ApiError = require("../utils/ApiError");

const sendEmail = require("../utils/sendEmail");
const generateHTML = require("../utils/generateHTML");

// @desc    Log In
// @route   POST /api/v1/admin/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!password) return next(new ApiError("Password field is required", 400));
  // Check admin
  let admin = await Admin.findOne({ email });
  if (!admin) return next(new ApiError("Incorrect email or password", 404));
  // Check if the password is correct
  if (!(await bcrypt.compare(password, admin.password)))
    return next(new ApiError("Incorrect email or password", 404));
  // Check if the admin is blocked
  if (admin.isBlocked)
    return next(
      new ApiError(
        "Your account has been blocked. Please contact the support team",
        401
      )
    );
  // Response Msg
  let msg = `Signed in as ${admin.email}`;
  // Check if account is verified
  if (admin.verified !== true)
    return exports.verificationCodeEmail({ ...req, user: admin }, res, next);
  /*
    In case of account is not verified ^^^:
      A verification code is sent to admin's email address
      And the rest of this function is ignored vvv
  */
  // generate token
  const tokenData = await admin.generateToken();
  // Save the token
  admin.updatePassowrd = false;
  admin.token = tokenData.token;
  admin.tokenExpDate = tokenData.tokenExpDate;
  const saved = await admin.save();
  if (!saved)
    return next(new ApiError("Something went wrong, please try again"));
  // Remove data from the response
  admin.__v = undefined;
  admin.password = undefined;
  // response
  res.status(200).json({
    success: true,
    data: admin,
    msg,
  });
});

// Verification Code email Fn
exports.verificationCodeEmail = asyncHandler(async (req, res, next) => {
  let admin = req.user;
  const tokenData = await admin.generateToken();
  // Send email
  const btnLink =
    process.env.FRONTEND_URL + `/admin/verification/${tokenData.token}`;
  const belowLink = process.env.FRONTEND_URL + `/admin/login`;
  const html = generateHTML({
    emailTitle: "Verify Your Admin Account",
    emailSubTitle: "Tap the button below to verify your email address.",
    btnText: "Verify Account",
    btnLink: btnLink,
    belowLink: belowLink,
    footerNote:
      "You received this email because you were added as an admin on our website. If you did not initiate this action, please ignore this email.",
  });
  try {
    await sendEmail({
      email: admin.email,
      subject: `${process.env.APP_NAME} admin account verification`,
      html: html,
    });
  } catch (err) {
    return next(
      new ApiError(
        "Unable to send verification email, please try again later.",
        422
      )
    );
  }
  // Response
  res.status(200).json({
    success: true,
    msg: "Verification email is sent to your email address",
  });
});

// @desc    Account verification code
// @route   POST /api/v1/admin/auth/verifyAccount
// @access  Public
exports.verifyAccount = asyncHandler(async (req, res, next) => {
  const admin = req.user;
  // Check if admin is already verified
  if (admin.verified)
    return next(new ApiError("This account is already verified", 400));
  // Input validation
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword)
    return next(
      new ApiError("Password and confirm password are required", 400)
    );
  if (password !== confirmPassword)
    return next(new ApiError("Passwords don't match", 400));
  // Update admin document only if not already verified
  admin.password = password;
  admin.verified = true;
  await admin.save();
  // Response
  res.status(200).json({
    success: true,
    msg: "Account is verified successfully",
  });
});

// @desc    Forgot admin account password
// @route   POST /api/v1/admin/auth/forgotPassword
// @access  Public
exports.adminForgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  // Check email
  if (!email) return next(new ApiError("Email address is required", 400));
  // Check account
  const admin = await Admin.findOne({ email });
  if (!admin) return next(new ApiError("Invalid email address", 404));
  // Generate token
  const tokenData = await admin.generateToken();
  // Send email
  const btnLink =
    process.env.FRONTEND_URL + `/admin/resetPassword/${tokenData.token}`;
  const belowLink = process.env.FRONTEND_URL + `/admin/login`;
  const html = generateHTML({
    emailTitle: "Reset your admin account password",
    emailSubTitle: "Tap the button below to reset your account password.",
    btnText: "Reset Password",
    btnLink: btnLink,
    belowLink: belowLink,
    footerNote:
      "You are receiving this email because a request to reset the password for your admin account has been initiated. If you did not initiate this action, please disregard this message.",
  });
  try {
    await sendEmail({
      email: admin.email,
      subject: `${process.env.APP_NAME} reset admin account password`,
      html: html,
    });
  } catch (err) {
    return next(
      new ApiError(
        "Unable to send reset password email, please try again later.",
        422
      )
    );
  }
  // Response
  res.status(200).json({
    success: true,
    msg: "An email is sent to your email address to reset your password",
  });
});

// @desc    Forgot admin account password
// @route   PATCH /api/v1/admin/auth/resetPassword
// @access  Private
exports.adminResetPassword = asyncHandler(async (req, res, next) => {
  const admin = req.user;
  // Input validation
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword)
    return next(
      new ApiError("Password and confirm password are required", 400)
    );
  if (password !== confirmPassword)
    return next(new ApiError("Passwords don't match", 400));
  // Update admin password and changed at time
  admin.password = password;
  admin.passwordChangedAt = new Date();
  admin.token = undefined;
  await admin.save();
  // Response
  res.status(200).json({
    success: true,
    msg: "Password is reset successfully, please login again...",
  });
});
