const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const USER_ROLES = [
  "student",
  "alumni",
  "institute_admin",
  "super_admin",
];

const USER_STATUSES = ["active", "pending", "suspended"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
      required: function () {
        return this.role !== "super_admin";
      },
      validate: {
        validator: function (tenantId) {
          return this.role === "super_admin"
            ? tenantId === null
            : tenantId != null;
        },
        message:
          "Super admins must not have a tenant; all other roles require one.",
      },
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: function () {
        return this.role === "alumni" ? "pending" : "active";
      },
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.password;
    delete returnedObject.__v;
    return returnedObject;
  },
});

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);