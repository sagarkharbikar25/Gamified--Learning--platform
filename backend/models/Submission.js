const mongoose = require("mongoose");
 
const submissionSchema = new mongoose.Schema({
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teacherId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
 
  // ─── Submission content ─────────────────────────
  text: { type: String, default: "" },
  files: [{ name: String, url: String, publicId: String, type: String, size: Number }],
 
  // ─── Status flow: pending → submitted → verified/rejected ──
  status: { type: String, enum: ["pending", "submitted", "verified", "rejected", "late"], default: "pending" },
 
  // ─── Grading ───────────────────────────────────
  score: { type: Number, default: null },
  maxScore: { type: Number },
  xpAwarded: { type: Number, default: 0 },
  gemsAwarded: { type: Number, default: 0 },
  teacherFeedback: { type: String, default: "" },
 
  // ─── AI Feedback ───────────────────────────────
  aiFeedback: { type: String, default: "" },
  aiScore: { type: Number, default: null },
  aiAnalysis: { type: Object, default: {} }, // strengths, improvements, keywords
 
  submittedAt: { type: Date },
  verifiedAt:  { type: Date },
}, { timestamps: true });
 
// Unique: one submission per student per activity
submissionSchema.index({ activityId: 1, studentId: 1 }, { unique: true });
 
module.exports = mongoose.model("Submission", submissionSchema);
