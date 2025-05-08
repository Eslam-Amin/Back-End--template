const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const adminSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      minLength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    isSuperAdmin: Boolean,
    isBlocked: Boolean,
    token: String,
    role: {
      type: String,
      enum: ["superAdmin", "admin"],
      default: "admin",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    permissionGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PermissionGroup",
    },
  },
  { timestamps: true }
);

adminSchema.set("toJSON", { virtuals: true });

adminSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName)
    return this.firstName + " " + this.lastName;
});

adminSchema.pre(/\bfind/, async function (next) {
  this.populate({
    path: "permissionGroup",
    model: "PermissionGroup",
    select: "name permissions",
  });
  next();
});

adminSchema.methods.generateToken = async function () {
  const tokenExpDate = new Date();
  tokenExpDate.setDate(
    tokenExpDate.getDate() +
      parseInt(process.env.JWT_EXPIRATION.toString().slice(0, -1))
  );
  const token = jwt.sign(
    { userId: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION,
    }
  );
  // Save the generated token to the database
  this.token = token;
  this.updatePassowrd = false; // to skip hashing the password
  await this.save();
  return { token, tokenExpDate };
};

adminSchema.pre("save", async function (next) {
  if (
    !this.isModified() ||
    (this.googleLinked && !this.password) ||
    this.updatePassowrd === false
  )
    return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isSuperAdmin && !this.permissionGroup) {
    return next(new Error("Permission Group is required"));
  }
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
