const Joi = require("joi");
const asyncHandler = require("express-async-handler");
const joiErrorHandler = require("./joiErrorHandler");

// Constants
const { genderList, MIN_AGE } = require("../utils/constants");

exports.changeUserPasswordValidator = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required().min(3).max(255),
    newPassword: Joi.string().required().min(3).max(255),
    confirmPassword: Joi.string()
      .required()
      .min(2)
      .max(255)
      .valid(Joi.ref("password"))
      .messages({
        "any.only": "New password and confirm password must match",
      }),
  });
  joiErrorHandler(schema, req);
  next();
});

exports.updateLoggedUserValidator = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().required().min(2).max(32),
    lastName: Joi.string().required().min(2).max(32),
    email: Joi.string().email().required().min(2).max(32),
    phone: Joi.string()
      .required()
      .pattern(/^(?:\+?20)?(?:0)?1[0-2]\d{8}$/),
  });
  joiErrorHandler(schema, req);
  next();
});

exports.deactivateLoggedUserValidator = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    confirmPassword: Joi.string().required(),
  });
  joiErrorHandler(schema, req);
  next();
});

exports.signupValidator = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required().min(2).max(32),
    phone: Joi.string()
      .required()
      .pattern(/^(?:\+?20)?(?:0)?1[0-2]\d{8}$/),
    gender: Joi.string()
      .valid(...genderList)
      .required(),
    dateOfBirth: Joi.string()
      .required()
      .isoDate()
      .max("now")
      .min(
        new Date(new Date().setFullYear(new Date().getFullYear() - MIN_AGE))
      ),
  });
  joiErrorHandler(schema, req);
  next();
});

exports.loginValidator = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  joiErrorHandler(schema, req);
  next();
});
