const mongoose = require("mongoose");

const moderationReportSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },
    title: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["safety", "harassment", "spam", "fraud", "other"],
      default: "other",
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "dismissed"],
      default: "open",
      required: true,
    },
    reporterName: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.ModerationReport ||
  mongoose.model("ModerationReport", moderationReportSchema);
