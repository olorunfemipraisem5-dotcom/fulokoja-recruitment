const Application = require("../models/Application");
const Job = require("../models/Job");
const path = require("path");
const fs = require("fs");

// @route POST /api/applications/:jobId (applicant only)
const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== "open") {
      return res.status(400).json({ message: "This position is no longer accepting applications" });
    }

    if (!req.files || !req.files.cv || !req.files.coverLetter) {
      return res.status(400).json({ message: "Both CV and application/cover letter (PDF) are required" });
    }

    const existing = await Application.findOne({ job: job._id, applicant: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You have already applied to this position" });
    }

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      cvPath: req.files.cv[0].filename,
      coverLetterPath: req.files.coverLetter[0].filename,
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: "Failed to submit application", error: err.message });
  }
};

// @route GET /api/applications/mine (applicant only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate("job", "title department type closingDate status")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications", error: err.message });
  }
};

// @route GET /api/applications (admin only) - optionally filter by job
const getAllApplications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.jobId) filter.job = req.query.jobId;
    const applications = await Application.find(filter)
      .populate("job", "title department")
      .populate("applicant", "fullName email phone")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications", error: err.message });
  }
};

// @route PUT /api/applications/:id/status (admin only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const allowed = ["Submitted", "Under Review", "Shortlisted", "Rejected", "Accepted"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, ...(adminNote !== undefined && { adminNote }) },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
};

// @route GET /api/applications/:id/document/:type (admin only) - download cv or coverLetter
const downloadDocument = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const { type } = req.params;
    const filename = type === "cv" ? application.cvPath : application.coverLetterPath;
    if (!filename) return res.status(404).json({ message: "Document not found" });

    const filePath = path.join(__dirname, "..", "uploads", filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File no longer exists on server" });
    }
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ message: "Failed to download document", error: err.message });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  downloadDocument,
};
