const express = require("express");
const logger = require("./utils/logger");
require("dotenv").config();
require("colors");

// Express app
const app = express();

// Port Number
const PORT = process.env.PORT || 8000;

// Startup
require("./startup/logging")(app);
require("./startup/app")(app);
require("./startup/db")();

// Server
const server = app.listen(PORT, (_) => {
  console.log(`Running on port ${PORT}`.blue.bold);
  logger.info(
    `Server (${process.env.NODE_ENV}) started on Port ${PORT} at ${new Date()}`
  );
});

module.exports = server;
