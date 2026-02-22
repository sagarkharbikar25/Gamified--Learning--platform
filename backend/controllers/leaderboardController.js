const User = require("../models/User");
const GameSession = require("../models/GameSession");
 
// @desc  Get leaderboard
// @route GET /api/leaderboard?type=xp|gems|streak&class=10A
const getLeaderboard = async (req, res) => {
  const { type = "xp", class: className, limit = 20 } = req.query;
 
  let filter = { role: "student", isActive: true };
  if (className) filter["studentInfo.class"] = className;
 
  const sortField = type === "gems" ? { gems: -1 } : type === "streak" ? { streak: -1 } : { xp: -1 };
 
  const students = await User.find(filter)
    .select("name xp level gems streak avatar studentInfo")
    .sort(sortField)
    .limit(parseInt(limit));
 
  const leaderboard = students.map((s, i) => ({
    rank: i + 1,
    _id: s._id,
    name: s.name,
    xp: s.xp,
    level: s.level,
    gems: s.gems,
    streak: s.streak,
    avatar: s.avatar,
    class: s.studentInfo?.class,
    section: s.studentInfo?.section,
  }));
 
  res.json({ success: true, type, leaderboard });
};
 
// @desc  Get game leaderboard
// @route GET /api/leaderboard/games
const getGameLeaderboard = async (req, res) => {
  const { gameType } = req.query;
  let match = {};
  if (gameType) match.gameType = gameType;
 
  const leaderboard = await GameSession.aggregate([
    { $match: match },
    { $group: { _id: "$studentId", totalXp: { $sum: "$xpEarned" }, totalGames: { $sum: 1 }, highScore: { $max: "$score" }, avgScore: { $avg: "$score" } } },
    { $sort: { totalXp: -1 } },
    { $limit: 20 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "student" } },
    { $unwind: "$student" },
    { $project: { totalXp: 1, totalGames: 1, highScore: 1, avgScore: { $round: ["$avgScore", 1] }, "student.name": 1, "student.level": 1, "student.avatar": 1, "student.studentInfo": 1 } },
  ]);
 
  res.json({ success: true, leaderboard: leaderboard.map((l, i) => ({ rank: i + 1, ...l })) });
};
 
module.exports = { getLeaderboard, getGameLeaderboard };
