const Joi = require("joi");
const PermissionGroup = require("../models/permissionGroup.model.js");
const Admin = require("../models/admin.model.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("express-async-handler");

exports.addPermissionGroupValidator = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const schema = Joi.object({
    name: Joi.string().required(),
    permissions: Joi.object().required(),
  });
  const { error } = schema.validate(data);
  if (error) return next(new ApiError(error.details[0].message, 400));
  const existingUser = await PermissionGroup.findOne({
    name: data.name,
    _id: { $ne: req.params.id },
  });
  if (existingUser) {
    return next(new ApiError("Name Already Used", 400));
  }
  next();
});

exports.deletePermissionGroupValidator = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const existingUser = await Admin.findOne({ permissionGroup: id });
    if (existingUser) {
      return next(new ApiError("This group is used from admins", 400));
    }
    next();
  }
);
