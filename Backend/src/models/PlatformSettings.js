const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
      required: true,
    },
    maintenanceMode: { type: Boolean, default: false },
    registrationsEnabled: { type: Boolean, default: true },
    aiRecommendationsEnabled: { type: Boolean, default: false },
    mentorMatchingEnabled: { type: Boolean, default: false },
    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        student: ["directory.read", "events.read", "jobs.read"],
        alumni: ["directory.read", "events.read", "jobs.read", "mentorship.use"],
        institute_admin: [
          "users.manage",
          "departments.manage",
          "reports.review",
        ],
      },
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.PlatformSettings ||
  mongoose.model("PlatformSettings", platformSettingsSchema);
