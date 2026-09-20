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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
