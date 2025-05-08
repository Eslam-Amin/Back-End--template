const morgan = require("morgan");
const winston = require("winston");

module.exports = (app) => {
  console.log(`Mode: ${process.env.NODE_ENV}`.blue.bold);
  if (process.env.NODE_ENV === "production") {
    winston.exceptions.handle(
      new winston.transports.File({ filename: "uncaughtExceptions.log" })
    );
    process.on("unhandledRejection", (ex) => {
      throw ex;
    });
  }
  app.use(morgan("dev"));
};
