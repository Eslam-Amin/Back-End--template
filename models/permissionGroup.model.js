const mongoose = require("mongoose");

const permissionGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Permission group nameis required"],
    },
    permissions: {
      adminAdd: { type: Boolean, default: false },
      admiDelete: { type: Boolean, default: false },
      adminUpdate: { type: Boolean, default: false },
      permissionGroupAdd: { type: Boolean, default: false },
      permissionGroupDelete: { type: Boolean, default: false },
      permissionGroupUpdate: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PermissionGroup", permissionGroupSchema);
