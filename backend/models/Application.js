const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cvPath: { type: String, required: true },
    coverLetterPath: { type: String, required: true },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Shortlisted", "Rejected", "Accepted"],
      default: "Submitted",
    },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent the same applicant from applying twice to the same job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
