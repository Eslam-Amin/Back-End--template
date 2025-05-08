const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const User = require("../models/user.model");

const handlers = require("./handlers");
const ApiError = require("../utils/ApiError");

// @desc    Get specific user
// @route   GET /api/v1/user/:id
// @access  Public
exports.getUser = handlers.getOne(User);

// @desc    Update logged user password
// @route   PATCH /api/v1/user/updatePassword
// @access  Private
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  if (!updated) {
    return next(new ApiError(`User is not found`, 404));
  }
  res.status(200).json({
    success: true,
    msg: "Password updated successfully, please login again",
  });
});

// @desc    Update logged user data (!password, !role)
// @route   PATCH /api/v1/user/updateMe
// @access  Private
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, phone } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      firstName,
      lastName,
      phone,
    },
    { new: true }
  );
  const token = await updatedUser.generateToken();
  res.status(200).json({
    success: true,
    data: updatedUser,
    ...token,
    msg: "Account is updated successfully",
  });
});

// @desc    Delete logged user
// @route   DELETE /api/v1/user/deleteMe
// @access  Private
exports.deactivateLoggedUser = asyncHandler(async (req, res, next) => {
  const password = req.body.password;
  // Check user
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError(`User does not exist`, 404));
  }
  // Check Password
  if (!(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Incorrect password", 401));
  }
  // Deactivate User
  const deactivateUser = await User.findByIdAndUpdate(req.user._id, {
    active: false,
    deactivatedAt: Date.now(),
  });
  if (!deactivateUser) {
    return next(new ApiError("Could not deactivate your account", 400));
  }
  res.status(200).json({
    success: true,
    msg: "Your account has been deactivated successfully",
  });
});
