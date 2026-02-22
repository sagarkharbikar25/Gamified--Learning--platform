const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Activity = require("../models/Activity");
const Submission = require("../models/Submission");
const { protect, authorize } = require("../middleware/authMiddleware");
 
// School overview stats
router.get("/stats", protect, authorize("school", "admin"), async (req, res) => {
  const [totalStudents, totalTeachers, totalActivities, pendingVerifications] = await Promise.all([
    User.countDocuments({ role: "student", isActive: true }),
    User.countDocuments({ role: "teacher", isActive: true }),
    Activity.countDocuments({ isActive: true }),
    Submission.countDocuments({ status: "submitted" }),
  ]);
  res.json({ success: true, stats: { totalStudents, totalTeachers, totalActivities, pendingVerifications } });
});
 
module.exports = router;
