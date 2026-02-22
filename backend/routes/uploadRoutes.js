const express = require("express");
const router = express.Router();
const { upload, uploadSubmissionFile, deleteFile } = require("../controllers/uploadController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/submission/:submissionId", protect, authorize("student"), upload.single("file"), uploadSubmissionFile);
router.delete("/file/:publicId", protect, deleteFile);

module.exports = router;