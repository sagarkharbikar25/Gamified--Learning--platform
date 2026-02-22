const User = require("../models/User");
const { generateToken } = require("../middleware/authMiddleware");
 
// @desc  Register user
// @route POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role, studentInfo, teacherInfo, schoolInfo } = req.body;
 
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: "Email already registered" });
 
  const user = await User.create({ name, email, password, role, studentInfo, teacherInfo, schoolInfo });
 
  const token = generateToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp, level: user.level, gems: user.gems, streak: user.streak },
  });
};
 
// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  const { email, password, role } = req.body;
 
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
 
  const user = await User.findOne({ email, role }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
 
  // Update streak
  user.updateStreak();
  await user.save();
 
  const token = generateToken(user._id);
  res.json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp, level: user.level, gems: user.gems, streak: user.streak, avatar: user.avatar },
  });
};
 
// @desc  Get current logged-in user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate("badges");
  res.json({ success: true, user });
};
 
// @desc  Update profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, phone, bio, studentInfo, teacherInfo } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, bio, studentInfo, teacherInfo },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
};
 
// @desc  Change password
// @route PUT /api/auth/password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: "Current password is incorrect" });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password updated successfully" });
};
 
module.exports = { register, login, getMe, updateProfile, changePassword };
