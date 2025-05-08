const mongoose = require("mongoose");
const logger = require("../utils/logger");

mongoose.set("strictQuery", false);

module.exports = (_) => {
  mongoose.connect(process.env.MONGO_URI).then((conn) => {
    console.log(`Database Connected: ${conn.connection.host}`.green.bold);
    logger.info(`Database Connected: ${conn.connection.host}`);
  });
};
