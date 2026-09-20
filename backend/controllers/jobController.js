const Job = require("../models/Job");

// @route GET /api/jobs  (public - only open jobs by default, admins can see all)
const getJobs = async (req, res) => {
  try {
    const filter = {};
    if (!req.query.all) filter.status = "open";
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs", error: err.message });
  }
};

// @route GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch job", error: err.message });
  }
};

// @route POST /api/jobs (admin only)
const createJob = async (req, res) => {
  try {
    const { title, department, type, description, requirements, closingDate } = req.body;
    if (!title || !department || !description || !requirements || !closingDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const job = await Job.create({
      title,
      department,
      type,
      description,
      requirements,
      closingDate,
      postedBy: req.user._id,
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to create job", error: err.message });
  }
};

// @route PUT /api/jobs/:id (admin only)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to update job", error: err.message });
  }
};

// @route DELETE /api/jobs/:id (admin only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete job", error: err.message });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob };
