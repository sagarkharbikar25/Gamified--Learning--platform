const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/users", protect, authorize("admin"), async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json({ success: true, users });
});

router.put("/users/:id/toggle", protect, authorize("admin"), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "Not found" });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user });
});

module.exports = router;