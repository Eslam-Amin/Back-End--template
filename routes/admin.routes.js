const express = require("express");

// Validators
const { adminValidator } = require("../validators/admin.validator");

// Auth middlewares
const {
  protect,
  allowedTo,
  authorization,
} = require("../middlewares/auth.middleware");

// Constants
const { SUPER_ADMIN, ADMIN } = require("../utils/constants");

// Controllers
const { addAdmin, getAllAdmins } = require("../controllers/admin.controller");

// Router
const router = express.Router();

// Routes
router
  .route("/getAllAdmins")
  .get(protect, allowedTo(SUPER_ADMIN, ADMIN), getAllAdmins);

router
  .route("/addAdmin")
  .post(
    protect,
    allowedTo(SUPER_ADMIN, ADMIN),
    authorization("adminAdd"),
    adminValidator,
    addAdmin
  );

router
  .route("/updateAdmin/:id")
  .patch(
    protect,
    allowedTo(SUPER_ADMIN, ADMIN),
    authorization("adminAdd"),
    adminValidator,
    addAdmin
  );

router
  .route("/deleteAdmin/:id")
  .delete(
    protect,
    allowedTo(SUPER_ADMIN, ADMIN),
    authorization("adminAdd"),
    adminValidator,
    addAdmin
  );

module.exports = router;
