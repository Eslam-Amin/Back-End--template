const ApiError = require("../utils/ApiError");

function joiErrorHandler(schema, req) {
  const { error } = schema.validate(req.body);
  const lang = req.query?.lang || "en";
  if (!error) return;
  let message = error.details[0].message.replace(/"/g, "").split(" ");
  const lowerLang = lang.toLowerCase();
  if (message[0]?.endsWith(`_${lowerLang}`)) {
    const language = lowerLang === "en" ? "English" : "Arabic";
    message = `${language} ${message[0].slice(0, -3)} ${message
      .slice(1)
      .join(" ")}`;
  } else {
    message = message.join(" ").split("_").join(" ");
    message = `${message.charAt(0).toUpperCase()}${message.slice(1)}`;
  }
  throw new ApiError(message, 400);
}

module.exports = joiErrorHandler;
