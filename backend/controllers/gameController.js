const GameSession = require("../models/GameSession");
const User = require("../models/User");
 
const XP_REWARDS = { brain_quiz: 100, speed_math: 60, word_hunt: 50, history_trail: 80, accuracy_shot: 70 };
const GEM_REWARDS = { brain_quiz: 20, speed_math: 12, word_hunt: 10, history_trail: 16, accuracy_shot: 14 };
 
// @desc  Save game session & award XP
// @route POST /api/games/session
const saveGameSession = async (req, res) => {
  const { gameType, score, maxScore, duration, questionsAnswered, correctAnswers, subject, aiQuestionsUsed } = req.body;
 
  const ratio = maxScore > 0 ? score / maxScore : 0;
  const xpEarned = Math.round((XP_REWARDS[gameType] || 50) * ratio);
  const gemsEarned = Math.round((GEM_REWARDS[gameType] || 10) * ratio);
 
  const session = await GameSession.create({
    studentId: req.user._id,
    gameType, score, maxScore, duration, questionsAnswered, correctAnswers, subject, aiQuestionsUsed,
    xpEarned, gemsEarned,
  });
 
  // Update student XP
  const student = await User.findById(req.user._id);
  student.xp += xpEarned;
  student.gems += gemsEarned;
  student.calculateLevel();
  await student.save();
 
  res.json({ success: true, session, xpEarned, gemsEarned, newXp: student.xp, newLevel: student.level });
};
 
// @desc  Get my game sessions
// @route GET /api/games/sessions
const getMyGameSessions = async (req, res) => {
  const sessions = await GameSession.find({ studentId: req.user._id }).sort("-completedAt").limit(50);
  res.json({ success: true, sessions });
};
 
// @desc  Get game stats summary
// @route GET /api/games/stats
const getGameStats = async (req, res) => {
  const stats = await GameSession.aggregate([
    { $match: { studentId: req.user._id } },
    { $group: { _id: "$gameType", totalGames: { $sum: 1 }, totalXp: { $sum: "$xpEarned" }, highScore: { $max: "$score" }, avgScore: { $avg: "$score" } } },
  ]);
  res.json({ success: true, stats });
};
 
module.exports = { saveGameSession, getMyGameSessions, getGameStats };
