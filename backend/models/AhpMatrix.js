const mongoose = require("mongoose");

const ahpMatrixSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, unique: true },
    criteriaCodes: { type: [String], required: true }, // order matches matrix rows/columns
    matrix: { type: [[Number]], required: true }, // n x n Saaty-scale pairwise comparison values
    weights: { type: [Number], default: [] }, // computed priority weights, same order as criteriaCodes
    lambdaMax: { type: Number },
    CI: { type: Number },
    RI: { type: Number },
    CR: { type: Number },
    consistent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AhpMatrix", ahpMatrixSchema);
