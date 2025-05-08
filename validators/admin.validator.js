const Joi = require("joi");
const asyncHandler = require("express-async-handler");
const joiErrorHandler = require("./joiErrorHandler");

// These Messages are used to catch Joi Invalid Inputs
// It's used to restrict string input data, and email
const invalidInputMessages = (input) => {
  let messages = {
    "string.base": `${input} must be a string`,
    "string.empty": `${input} is required`,
    "any.required": `${input} is required`,
  }
  if (input.toLowerCase() === "email")
    messages = {
      "string.email": "Email must be a valid email address",
      ...messages
    }
  return messages;

}

exports.loginValidator = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({
        tlds: { allow: false },
      })
      .required()
      .messages(invalidInputMessages("email")),
    password: Joi.string().required().messages(invalidInputMessages("password")),
  });
  joiErrorHandler(schema, req);
  next();
});

exports.adminValidator = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages(invalidInputMessages("email")),
    password: Joi.string().required().messages(invalidInputMessages("password")),
    role: Joi.string().required(),
    permissionGroup: Joi.string().required(),
  });
  joiErrorHandler(schema, req);
  next();
});
