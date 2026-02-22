const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
 
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ["student", "teacher", "school", "admin"], required: true },
 
  // ─── Profile ───────────────────────────────────
  avatar: { type: String, default: "" },
  phone: { type: String, default: "" },
  bio: { type: String, default: "" },
 
  // ─── Student specific ──────────────────────────
  studentInfo: {
    rollNo: String,
    class: String,
    section: String,
    guardianName: String,
    guardianPhone: String,
  },
 
  // ─── Teacher specific ──────────────────────────
  teacherInfo: {
    employeeId: String,
    subjects: [String],
    classes: [String],
    qualification: String,
  },
 
  // ─── School specific ───────────────────────────
  schoolInfo: {
    schoolName: String,
    address: String,
    board: String, // CBSE, ICSE, State
  },
 
  // ─── Gamification ──────────────────────────────
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  gems: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
  rewards: [{ name: String, icon: String, unlockedAt: Date }],
 
  // ─── Status ────────────────────────────────────
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // links student/teacher to school account
 
}, { timestamps: true });
 
// ─── Hash password before save ─────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
 
// ─── Compare password ──────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
 
// ─── Auto level up based on XP ─────────────────
userSchema.methods.calculateLevel = function () {
  const xpThresholds = [0, 500, 1200, 2200, 3500, 5000, 7000, 9500, 12500, 16000, 20000];
  for (let i = xpThresholds.length - 1; i >= 0; i--) {
    if (this.xp >= xpThresholds[i]) { this.level = i + 1; break; }
  }
};
 
// ─── Update streak ─────────────────────────────
userSchema.methods.updateStreak = function () {
  const today = new Date();
  const last = this.lastActiveDate;
  if (!last) { this.streak = 1; }
  else {
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) this.streak += 1;
    else if (diffDays > 1) this.streak = 1;
  }
  this.lastActiveDate = today;
};
 
module.exports = mongoose.model("User", userSchema);
