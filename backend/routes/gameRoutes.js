const express = require("express");
const router = express.Router();
const { saveGameSession, getMyGameSessions, getGameStats } = require("../controllers/gameController");
const { protect, authorize } = require("../middleware/authMiddleware");
 
router.post("/session",  protect, authorize("student"), saveGameSession);
router.get("/sessions",  protect, authorize("student"), getMyGameSessions);
router.get("/stats",     protect, authorize("student"), getGameStats);
 
module.exports = router;
