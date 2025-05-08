const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const {
  USER,
  GENDER_LIST_EN,
  GENDER_LIST_AR,
} = require("../utils/constants");

const userSchema = mongoose.Schema(
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
    phone: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
    },
    gender_en: {
      type: String,
      enum: GENDER_LIST_EN,
      required: [true, "Gender is required"],
    },
    gender_ar: {
      type: String,
      enum: GENDER_LIST_AR,
      required: [true, "Gender is required"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetCodeExp: Date,
    passwordResetCodeVerified: Boolean,
    verificationCode: String,
    verificationCodeExp: Date,
    verificationCodeVerified: Boolean,
    isAdmin: Boolean,
    deactivatedAt: Date,
    verified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

userSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName)
    return this.firstName + " " + this.lastName;
});

userSchema.virtual("age").get(function () {
  const currentDate = new Date();
  const birthDate = new Date(this.dateOfBirth);
  const age = currentDate.getFullYear() - birthDate.getFullYear();
  // Adjust age if the birthday hasn't occurred yet this year
  if (
    currentDate.getMonth() < birthDate.getMonth() ||
    (currentDate.getMonth() === birthDate.getMonth() &&
      currentDate.getDate() < birthDate.getDate())
  ) {
    return age - 1;
  }
  return age;
});

userSchema.set("toJSON", { virtuals: true });

userSchema.methods.generateToken = async function () {
  const tokenExpDate = new Date(); // Get the current date
  tokenExpDate.setDate(
    tokenExpDate.getDate() +
      parseInt(process.env.JWT_EXPIRATION.toString().slice(0, -1))
  );
  const token = jwt.sign({ userId: this._id, role: USER }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  return { token, tokenExpDate };
};

userSchema.pre("save", async function (next) {
  if (
    !this.isModified() ||
    (this.googleLinked && !this.password) ||
    this.updatePassowrd === false
  )
    return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);
