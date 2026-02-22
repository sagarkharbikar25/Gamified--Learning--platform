const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, authorize("teacher", "school", "admin"), async (req, res) => {
  const { class: cls, section, search } = req.query;
  let filter = { role: "student", isActive: true };
  if (cls) filter["studentInfo.class"] = cls;
  if (section) filter["studentInfo.section"] = section;
  if (search) filter.name = { $regex: search, $options: "i" };
  const students = await User.find(filter).select("-password").sort("name");
  res.json({ success: true, count: students.length, students });
});

router.get("/:id", protect, async (req, res) => {
  const student = await User.findById(req.params.id).select("-password").populate("badges");
  if (!student) return res.status(404).json({ success: false, message: "Student not found" });
  res.json({ success: true, student });
});

module.exports = router;