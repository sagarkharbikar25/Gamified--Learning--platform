const mongoose = require("mongoose");
 
const activitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  type: { type: String, enum: ["assignment", "quiz", "project", "essay", "experiment"], default: "assignment" },
 
  // ─── Assignment details ─────────────────────────
  dueDate: { type: Date, required: true },
  maxScore: { type: Number, default: 100 },
  xpReward: { type: Number, default: 50 },
  gemReward: { type: Number, default: 10 },
 
  // ─── Targeting ─────────────────────────────────
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedClasses: [String],   // ["10A", "10B"]
  assignedSections: [String],  // ["A", "B"]
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // optional specific students
 
  // ─── Attachments ───────────────────────────────
  attachments: [{ name: String, url: String, type: String }],
 
  // ─── AI Generated? ─────────────────────────────
  isAIGenerated: { type: Boolean, default: false },
  aiPrompt: { type: String },
 
  isActive: { type: Boolean, default: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
 
module.exports = mongoose.model("Activity", activitySchema);
 
