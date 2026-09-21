const AhpMatrix = require("../models/AhpMatrix");
const Application = require("../models/Application");
const Job = require("../models/Job");
const { computeAHPWeights } = require("../utils/ahp");

const DEFAULT_CRITERIA = [
  { code: "EQ", name: "Educational Qualification" },
  { code: "WE", name: "Work Experience" },
  { code: "PC", name: "Professional Certification" },
  { code: "TC", name: "Technical Competence" },
  { code: "CS", name: "Communication Skills" },
  { code: "IP", name: "Interview Performance" },
];

// Returns a job's criteria, falling back to the default six for jobs created
// before this field existed (and backfills it on the job for next time).
async function getJobCriteria(job) {
  if (job.criteria && job.criteria.length > 0) return job.criteria;
  job.criteria = DEFAULT_CRITERIA;
  await job.save();
  return job.criteria;
}

// @route GET /api/ahp/:jobId/matrix (admin only)
const getMatrix = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const criteria = await getJobCriteria(job);
    const existing = await AhpMatrix.findOne({ job: job._id });
    res.json({
      criteria,
      matrix: existing ? existing.matrix : null,
      result: existing
        ? {
            weights: existing.weights,
            lambdaMax: existing.lambdaMax,
            CI: existing.CI,
            RI: existing.RI,
            CR: existing.CR,
            consistent: existing.consistent,
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch matrix", error: err.message });
  }
};

// @route POST /api/ahp/:jobId/matrix (admin only)
// body: { matrix: number[][] } - n x n Saaty-scale values, matching job.criteria order
const saveMatrix = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const criteria = await getJobCriteria(job);
    const { matrix } = req.body;
    const n = criteria.length;

    if (!Array.isArray(matrix) || matrix.length !== n || matrix.some((row) => row.length !== n)) {
      return res.status(400).json({ message: `Matrix must be ${n}x${n} to match this job's criteria` });
    }

    const result = computeAHPWeights(matrix, n);

    const saved = await AhpMatrix.findOneAndUpdate(
      { job: job._id },
      {
        job: job._id,
        criteriaCodes: criteria.map((c) => c.code),
        matrix,
        weights: result.weights,
        lambdaMax: result.lambdaMax,
        CI: result.CI,
        RI: result.RI,
        CR: result.CR,
        consistent: result.consistent,
      },
      { new: true, upsert: true }
    );

    // Recompute weighted scores for any applicants already scored on this job,
    // since the weights may have changed.
    const applications = await Application.find({ job: job._id, scores: { $exists: true, $ne: {} } });
    for (const app of applications) {
      await recomputeApplicationScore(app, criteria, result.weights);
    }

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: "Failed to save matrix", error: err.message });
  }
};

// Shared helper: computes and saves an application's weighted score + decision label
async function recomputeApplicationScore(application, criteria, weights) {
  let total = 0;
  criteria.forEach((c, i) => {
    const raw = application.scores.get(c.code) || 0;
    total += raw * (weights[i] || 0);
  });
  application.weightedScore = Math.round(total * 1000) / 1000;
  await application.save();
}

// @route PUT /api/applications/:id/scores (admin only)
// body: { scores: { EQ: 8, WE: 7, ... } }
const scoreApplicant = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate("job");
    if (!application) return res.status(404).json({ message: "Application not found" });

    const { scores } = req.body;
    if (!scores || typeof scores !== "object") {
      return res.status(400).json({ message: "Scores object is required" });
    }

    application.scores = new Map(Object.entries(scores));

    const jobCriteria = await getJobCriteria(application.job);
    const ahpMatrix = await AhpMatrix.findOne({ job: application.job._id });
    if (ahpMatrix) {
      await recomputeApplicationScore(application, jobCriteria, ahpMatrix.weights);
    } else {
      await application.save();
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: "Failed to save scores", error: err.message });
  }
};

// Assigns Recommended / Considered / Not Recommended based on rank position:
// top 40% -> Recommended, next 40% -> Considered, bottom 20% -> Not Recommended
function assignDecisions(rankedApps) {
  const total = rankedApps.length;
  const recommendedCount = Math.ceil(total * 0.4);
  const consideredCount = Math.ceil(total * 0.4);
  return rankedApps.map((app, index) => {
    let decision;
    if (index < recommendedCount) decision = "Recommended";
    else if (index < recommendedCount + consideredCount) decision = "Considered";
    else decision = "Not Recommended";
    return { ...app, decision };
  });
}

// @route GET /api/ahp/:jobId/ranking (admin only)
const getRanking = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const criteria = await getJobCriteria(job);

    const applications = await Application.find({ job: job._id, weightedScore: { $ne: null } })
      .populate("applicant", "fullName email")
      .sort({ weightedScore: -1 });

    const ranked = applications.map((a) => ({
      _id: a._id,
      applicant: a.applicant,
      scores: Object.fromEntries(a.scores),
      weightedScore: a.weightedScore,
    }));

    const withDecisions = assignDecisions(ranked);

    // Persist decision labels for reference (e.g. when downloading reports later)
    for (const item of withDecisions) {
      await Application.findByIdAndUpdate(item._id, { decision: item.decision });
    }

    res.json({ criteria, ranking: withDecisions });
  } catch (err) {
    res.status(500).json({ message: "Failed to compute ranking", error: err.message });
  }
};

// @route POST /api/ahp/:jobId/sensitivity (admin only)
// body: { adjustedWeights: number[] } - same order as job.criteria, should sum to ~1
const runSensitivity = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const criteria = await getJobCriteria(job);
    const { adjustedWeights } = req.body;
    if (!Array.isArray(adjustedWeights) || adjustedWeights.length !== criteria.length) {
      return res.status(400).json({ message: "adjustedWeights must match the number of criteria" });
    }

    const applications = await Application.find({ job: job._id, weightedScore: { $ne: null } }).populate(
      "applicant",
      "fullName"
    );

    const original = applications
      .map((a) => ({ _id: a._id, name: a.applicant?.fullName, originalScore: a.weightedScore }))
      .sort((a, b) => b.originalScore - a.originalScore);

    const adjusted = applications.map((a) => {
      let total = 0;
      criteria.forEach((c, i) => {
        const raw = a.scores.get(c.code) || 0;
        total += raw * (adjustedWeights[i] || 0);
      });
      return { _id: a._id, name: a.applicant?.fullName, adjustedScore: Math.round(total * 1000) / 1000 };
    });
    adjusted.sort((a, b) => b.adjustedScore - a.adjustedScore);

    // Merge original + adjusted rank/score for a side-by-side comparison
    const comparison = original.map((o, origIndex) => {
      const adjMatch = adjusted.find((a) => a._id.toString() === o._id.toString());
      const adjIndex = adjusted.findIndex((a) => a._id.toString() === o._id.toString());
      let rankChange = "No change";
      if (adjIndex < origIndex) rankChange = `Moved up (was ${origIndex + 1}, now ${adjIndex + 1})`;
      else if (adjIndex > origIndex) rankChange = `Moved down (was ${origIndex + 1}, now ${adjIndex + 1})`;
      return {
        name: o.name,
        originalRank: origIndex + 1,
        originalScore: o.originalScore,
        adjustedRank: adjIndex + 1,
        adjustedScore: adjMatch?.adjustedScore,
        rankChange,
      };
    });

    res.json({ criteria, comparison });
  } catch (err) {
    res.status(500).json({ message: "Failed to run sensitivity analysis", error: err.message });
  }
};

module.exports = { getMatrix, saveMatrix, scoreApplicant, getRanking, runSensitivity };
