const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Academic", "Non-Academic"],
      default: "Academic",
    },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    closingDate: { type: Date, required: true },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Recruitment criteria used for AHP-based applicant ranking on this vacancy
    criteria: {
      type: [
        {
          code: { type: String, required: true }, // e.g. "EQ"
          name: { type: String, required: true }, // e.g. "Educational Qualification"
        },
      ],
      default: [
        { code: "EQ", name: "Educational Qualification" },
        { code: "WE", name: "Work Experience" },
        { code: "PC", name: "Professional Certification" },
        { code: "TC", name: "Technical Competence" },
        { code: "CS", name: "Communication Skills" },
        { code: "IP", name: "Interview Performance" },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
