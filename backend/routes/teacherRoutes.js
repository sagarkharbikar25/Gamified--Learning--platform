const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, authorize("school", "admin"), async (req, res) => {
  const teachers = await User.find({ role: "teacher", isActive: true }).select("-password").sort("name");
  res.json({ success: true, count: teachers.length, teachers });
});

router.get("/:id", protect, async (req, res) => {
  const teacher = await User.findById(req.params.id).select("-password");
  if (!teacher) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, teacher });
});

module.exports = router;