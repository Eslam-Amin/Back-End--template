const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");

// @desc    Sign Up
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  // Create a new user
  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
  });
  await verificationCodeEmail({ ...req, user }, res, next);
});

// @desc    Log In
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!password) return next(new ApiError("Password field is required", 400));
  // Check user
  let user = await User.findOne({ email });
  if (!user) return next(new ApiError("Incorrect email or password", 404));
  // Check if the password is correct
  if (!(await bcrypt.compare(password, user.password)))
    return next(new ApiError("Incorrect email or password", 404));
  // Response Msg
  let msg = `Signed in as ${user.email}`;
  // Check if user account is deactivated
  if (!user.active) {
    const targetDate = new Date(user.deactivatedAt);
    const currentDate = new Date();
    const timeDifference = currentDate - targetDate;
    const millisecondsIn15Days = 15 * 24 * 60 * 60 * 1000;
    if (timeDifference >= millisecondsIn15Days) {
      return next(new ApiError("Incorrect email or password", 404));
    } else {
      user = await User.findOneAndUpdate(
        { email },
        { $set: { active: true }, $unset: { deactivatedAt: 1 } },
        { new: true }
      );
      msg = "Welcome back! Your account has been reactivated.";
    }
  }
  // Check if account is verified
  if (user.verified !== true)
    return await verificationCodeEmail({ ...req, user }, res, next);
  /*
        In case of account is not verified ^^^:
            A verification code is sent to user's email address
            And the rest of this function is ignored vvv
    */
  // generate token
  const token = await user.generateToken();
  // Remove password from the response
  user.password = undefined;
  // response
  res.status(200).json({
    success: true,
    data: user,
    ...token,
    msg,
  });
});

// Verification Code email Fn
const verificationCodeEmail = asyncHandler(async (req, res, next) => {
  const user = req.user;
  // Random 6 digits
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const hashedVerificationCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");
  // Save hashed verification code in DB
  user.verificationCode = hashedVerificationCode;
  user.verificationCodeExp = Date.now() + 10 * 60 * 1000;
  user.updatePassowrd = false;
  await user.save();
  // Send email
  const msg = `Hi ${user.firstName} ${user.lastName},\nwe received a request to verify your Tick Money account email address.\n\n${verificationCode}\n\nEnter this code to complete the verification.\nThanks for helping us keep your account secure.\n`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Tick Money account verification code",
      message: msg,
    });
  } catch (err) {
    user.verificationCode = undefined;
    user.verificationCodeExp = undefined;
    user.updatePassowrd = false;
    await user.save();
    return next(
      new ApiError(
        "Unable to send verification code, please try again later.",
        422
      )
    );
  }
  // Response
  res.status(200).json({
    success: true,
    email: user.email,
    codeExp: user.verificationCodeExp,
    msg: "Verification code is sent to your email",
  });
});

// @desc    Account verification code
// @route   POST /api/v1/auth/verifyAccount
// @access  Public
exports.verifyAccount = asyncHandler(async (req, res, next) => {
  // Check body
  if (!req.body.verificationCode)
    return next(new ApiError("Verification code is required", 400));
  // Hash code
  const hashedCode = crypto
    .createHash("sha256")
    .update(req.body.verificationCode)
    .digest("hex");
  // Get user
  const user = await User.findOne({ email: req.body.email });
  if (!user || (!user.verificationCode && !user.verificationCodeExp)) {
    return next(new ApiError("Invalid request", 400));
  }
  // Check code expiration
  if (Date.now() >= Date.parse(user.verificationCodeExp)) {
    return next(new ApiError("Verification code is expired", 401));
  }
  // Check code
  if (user.verificationCode !== hashedCode) {
    return next(new ApiError("Invalid Verification code", 401));
  }
  // Update user => verified
  user.verified = true;
  user.verificationCode = undefined;
  user.verificationCodeExp = undefined;
  user.updatePassowrd = false;
  await user.save();
  // Generate token
  const token = await user.generateToken();
  // Response
  res.status(200).json({
    success: true,
    data: user,
    ...token,
    msg: "Account verified successfully",
  });
});
