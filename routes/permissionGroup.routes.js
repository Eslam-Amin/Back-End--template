const express = require("express");

// Validators
const {
  addPermissionGroupValidator,
  deletePermissionGroupValidator,
} = require("../validators/permissionGroup.validator");

// Auth middlewares
const {
  protect,
  allowedTo,
  authorization,
} = require("../middlewares/auth.middleware");

// Constants
const { SUPER_ADMIN, ADMIN } = require("../utils/constants");

// Controllers
const {
  addPermissionGroup,
  updatePermissionGroup,
  deletePermissionGroup,
  getPermissionGroups,
} = require("../controllers/permissionGroup.controller");

// Router
const router = express.Router();

// Routes
router
  .route("/getAllPermissionGroups")
  .get(protect, allowedTo(SUPER_ADMIN, ADMIN), getPermissionGroups);

router
  .route("/addPermissionGroup")
  .post(
    protect,
    allowedTo(SUPER_ADMIN, ADMIN),
    authorization("permissionGroupAdd"),
    addPermissionGroupValidator,
    addPermissionGroup
  );

router
  .route("/updatePermissionGroup/:id")
  .patch(
    protect,
    allowedTo(SUPER_ADMIN, ADMIN),
    authorization("permissionGroupUpdate"),
    addPermissionGroupValidator,
    updatePermissionGroup
  );

router
  .route("/deletePermissionGroup/:id")
  .delete(
    protect,
    allowedTo(SUPER_ADMIN, ADMIN),
    authorization("permissionGroupDelete"),
    deletePermissionGroupValidator,
    deletePermissionGroup
  );

module.exports = router;
