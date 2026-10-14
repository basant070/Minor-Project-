const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true },
);

departmentSchema.index({ tenantId: 1, code: 1 }, { unique: true });

module.exports =
  mongoose.models.Department || mongoose.model("Department", departmentSchema);
