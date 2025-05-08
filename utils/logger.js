const winston = require("winston");
require("winston-mongodb");

const logger = winston.createLogger({
  transports:
    process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({ filename: "logfile.log" }),
          new winston.transports.MongoDB({
            db: process.env.LOG_URI,
            options: { useUnifiedTopology: true },
            level: "info",
          }),
        ]
      : [new winston.transports.File({ filename: "logfile.log" })],
});

module.exports = logger;
