const express = require("express");
const router = express.Router();
const { getMatrix, saveMatrix, getRanking, runSensitivity } = require("../controllers/ahpController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/:jobId/matrix", protect, adminOnly, getMatrix);
router.post("/:jobId/matrix", protect, adminOnly, saveMatrix);
router.get("/:jobId/ranking", protect, adminOnly, getRanking);
router.post("/:jobId/sensitivity", protect, adminOnly, runSensitivity);

module.exports = router;
