const express = require("express");
const router = express.Router();
const { getActivities, getActivity, createActivity, updateActivity, deleteActivity, submitActivity, verifySubmission, getSubmissions } = require("../controllers/activityController");
const { protect, authorize } = require("../middleware/authMiddleware");
 
router.get("/",    protect, getActivities);
router.post("/",   protect, authorize("teacher", "admin"), createActivity);
router.get("/:id", protect, getActivity);
router.put("/:id", protect, authorize("teacher", "admin"), updateActivity);
router.delete("/:id", protect, authorize("teacher", "admin"), deleteActivity);
router.post("/:id/submit", protect, authorize("student"), submitActivity);
router.get("/:id/submissions", protect, authorize("teacher", "admin", "school"), getSubmissions);
router.put("/submissions/:id/verify", protect, authorize("teacher", "admin"), verifySubmission);
 
module.exports = router;
