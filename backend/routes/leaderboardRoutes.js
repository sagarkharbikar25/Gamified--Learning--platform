const express = require("express");
const router = express.Router();
const { getLeaderboard, getGameLeaderboard } = require("../controllers/leaderboardController");
const { protect } = require("../middleware/authMiddleware");
 
router.get("/",      protect, getLeaderboard);
router.get("/games", protect, getGameLeaderboard);
 
module.exports = router;
