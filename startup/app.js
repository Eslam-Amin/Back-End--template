const path = require("path");
const cors = require("cors");
const multer = require("multer");
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");

// User Routes
const userAuthRoutes = require("../routes/userAuth.routes");
const userRoutes = require("../routes/user.routes");
const constantRoutes = require("../routes/constant.routes");

// Admin Routes
const adminRoutes = require("../routes/admin.routes");
const adminAuthRoutes = require("../routes/adminAuth.routes");
const permissionGroupRoutes = require("../routes/permissionGroup.routes");

const ApiError = require("../utils/ApiError");
const globalError = require("../middlewares/error.middleware");

module.exports = (app) => {
  // Middlewares
  app.use(cors());
  app.options("*", cors());
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  // Use multer for handling form-data
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });
  app.use(upload.any());
  app.use(express.json({ limit: "25kb" }));
  app.use(express.static(path.join(__dirname, "uploads")));
  // User Routes
  app.use("/api/v1/auth", userAuthRoutes);
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/constants", constantRoutes);
  // Admin Routes
  app.use("/api/v1/admin/auth", adminAuthRoutes);
  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1/permissionGroup", permissionGroupRoutes);
  // Not Found Route
  app.all("*", (req, res, next) => {
    next(new ApiError(`This Route (${req.originalUrl}) is not found`, 400));
  });
  // Global Error Handler
  app.use(globalError);
};
