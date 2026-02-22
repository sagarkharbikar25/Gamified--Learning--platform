const mongoose = require("mongoose");
 
const gameSessionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gameType: { type: String, enum: ["brain_quiz", "speed_math", "word_hunt", "history_trail", "accuracy_shot"], required: true },
  subject: { type: String },
  score: { type: Number, required: true },
  maxScore: { type: Number },
  xpEarned: { type: Number, default: 0 },
  gemsEarned: { type: Number, default: 0 },
  duration: { type: Number }, // seconds
  questionsAnswered: { type: Number },
  correctAnswers: { type: Number },
  aiQuestionsUsed: { type: Boolean, default: false },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });
 
module.exports = mongoose.model("GameSession", gameSessionSchema);
