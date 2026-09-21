const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  downloadDocument,
} = require("../controllers/applicationController");
const { scoreApplicant } = require("../controllers/ahpController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post(
  "/:jobId",
  protect,
  upload.fields([
    { name: "cv", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
  ]),
  applyToJob
);

router.get("/mine", protect, getMyApplications);
router.get("/", protect, adminOnly, getAllApplications);
router.put("/:id/status", protect, adminOnly, updateApplicationStatus);
router.put("/:id/scores", protect, adminOnly, scoreApplicant);
router.get("/:id/document/:type", protect, adminOnly, downloadDocument);

module.exports = router;
