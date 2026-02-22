const express = require("express");
const router = express.Router();
const { aiTutor, generateActivity, analyzeSubmission, generateQuizQuestions, generateStudyPlan, getPerformanceInsights } = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/tutor", protect, aiTutor);
router.post("/generate-activity", protect, authorize("teacher", "admin"), generateActivity);
router.post("/feedback/:submissionId", protect, analyzeSubmission);
router.post("/quiz-questions", protect, generateQuizQuestions);
router.post("/study-plan", protect, authorize("student"), generateStudyPlan);
router.get("/insights/:studentId", protect, getPerformanceInsights);

module.exports = router;