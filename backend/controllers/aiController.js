const Anthropic = require("@anthropic-ai/sdk");
const Activity = require("../models/Activity");
const Submission = require("../models/Submission");
const User = require("../models/User");
 
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 
// ─────────────────────────────────────────────────────────────
// 1. AI TUTOR CHAT
// @desc  Chat with AI tutor about any subject
// @route POST /api/ai/tutor
// ─────────────────────────────────────────────────────────────
const aiTutor = async (req, res) => {
  const { message, subject, conversationHistory = [], studentLevel } = req.body;
  const student = req.user;
 
  const systemPrompt = `You are EduBot, a friendly and encouraging AI tutor for a gamified learning platform called EduQuest. 
You are currently helping a student named ${student.name} who is at Level ${student.level} (${student.xp} XP).
${subject ? `The student wants help with: ${subject}` : "Help with any school subject."}
 
Guidelines:
- Be encouraging, positive, and patient
- Explain concepts in simple, clear language appropriate for school students
- Use examples, analogies, and step-by-step breakdowns
- When a student solves something correctly, celebrate with them 🎉
- Suggest related topics they can explore
- Keep answers concise but complete
- Use emojis sparingly to keep things fun
- If it's a math problem, show the working step by step
- Award virtual praise when students show understanding`;
 
  const messages = [
    ...conversationHistory,
    { role: "user", content: message }
  ];
 
  // Streaming response
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
 
  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });
 
    stream.on("text", (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });
 
    stream.on("finalMessage", (msg) => {
      res.write(`data: ${JSON.stringify({ done: true, usage: msg.usage })}\n\n`);
      res.end();
    });
 
    stream.on("error", (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "AI service unavailable" })}\n\n`);
    res.end();
  }
};
 
// ─────────────────────────────────────────────────────────────
// 2. AI ACTIVITY GENERATOR
// @desc  Teacher generates activity/quiz with AI
// @route POST /api/ai/generate-activity
// ─────────────────────────────────────────────────────────────
const generateActivity = async (req, res) => {
  const { subject, topic, type, difficulty, gradeLevel, numberOfQuestions } = req.body;
 
  const prompt = `Generate a ${type || "quiz"} for Grade ${gradeLevel || "10"} students on the topic: "${topic}" (Subject: ${subject}).
Difficulty: ${difficulty || "medium"}
${type === "quiz" ? `Number of questions: ${numberOfQuestions || 10}` : ""}
 
Return ONLY valid JSON in this format:
{
  "title": "Activity title",
  "description": "Brief description",
  "instructions": "Clear instructions for students",
  "estimatedDuration": "30 minutes",
  "xpReward": 50,
  ${type === "quiz" ? `"questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why this is correct"
    }
  ],` : `"tasks": ["Task 1", "Task 2"],`}
  "learningObjectives": ["Objective 1", "Objective 2"],
  "rubric": {"excellent": "...", "good": "...", "needs_improvement": "..."}
}`;
 
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });
 
  let content = response.content[0].text;
  // Clean JSON if wrapped in code blocks
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
 
  try {
    const activity = JSON.parse(content);
    res.json({ success: true, activity, raw: content });
  } catch {
    res.json({ success: true, activity: null, raw: content });
  }
};
 
// ─────────────────────────────────────────────────────────────
// 3. AI SUBMISSION FEEDBACK
// @desc  AI analyzes student submission and gives feedback
// @route POST /api/ai/feedback/:submissionId
// ─────────────────────────────────────────────────────────────
const analyzeSubmission = async (req, res) => {
  const { submissionId } = req.params;
 
  const submission = await Submission.findById(submissionId)
    .populate("activityId")
    .populate("studentId", "name level xp");
 
  if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
 
  const prompt = `You are an expert teacher grading a student submission. Analyze this submission and provide detailed, constructive feedback.
 
Activity: "${submission.activityId.title}"
Subject: ${submission.activityId.subject}
Description: ${submission.activityId.description}
Student: ${submission.studentId.name} (Level ${submission.studentId.level})
Student's Answer: "${submission.text || "No text submitted - file upload only"}"
 
Return ONLY valid JSON:
{
  "overallScore": 85,
  "grade": "B+",
  "summary": "Brief overall assessment",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "detailedFeedback": "Paragraph of detailed feedback",
  "encouragement": "Encouraging message for the student",
  "suggestedResources": ["Resource 1 topic", "Resource 2 topic"],
  "keywordsFound": ["keyword1", "keyword2"],
  "keywordsMissed": ["keyword1", "keyword2"]
}`;
 
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });
 
  let content = response.content[0].text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
 
  try {
    const analysis = JSON.parse(content);
 
    // Save AI feedback to submission
    submission.aiFeedback = analysis.detailedFeedback;
    submission.aiScore = analysis.overallScore;
    submission.aiAnalysis = analysis;
    await submission.save();
 
    res.json({ success: true, analysis });
  } catch {
    res.json({ success: true, analysis: null, raw: content });
  }
};
 
// ─────────────────────────────────────────────────────────────
// 4. AI QUIZ QUESTIONS GENERATOR (for mini games)
// @desc  Generate quiz questions for a subject/topic
// @route POST /api/ai/quiz-questions
// ─────────────────────────────────────────────────────────────
const generateQuizQuestions = async (req, res) => {
  const { subject, topic, difficulty, count = 5 } = req.body;
 
  const prompt = `Generate ${count} multiple choice quiz questions for a gamified learning game.
Subject: ${subject}
Topic: ${topic || "general"}
Difficulty: ${difficulty || "medium"}
 
Return ONLY valid JSON array:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation",
    "points": 10,
    "timeLimit": 30
  }
]`;
 
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });
 
  let content = response.content[0].text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    const questions = JSON.parse(content);
    res.json({ success: true, questions });
  } catch {
    res.json({ success: true, questions: [], raw: content });
  }
};
 
// ─────────────────────────────────────────────────────────────
// 5. AI STUDY PLAN GENERATOR
// @desc  Generate personalized study plan for student
// @route POST /api/ai/study-plan
// ─────────────────────────────────────────────────────────────
const generateStudyPlan = async (req, res) => {
  const student = req.user;
  const { weakSubjects, strongSubjects, examDate, hoursPerDay } = req.body;
 
  const prompt = `Create a personalized study plan for a student.
Student: ${student.name}, Level ${student.level}
Weak subjects: ${weakSubjects?.join(", ") || "unknown"}
Strong subjects: ${strongSubjects?.join(", ") || "unknown"}
Exam date: ${examDate || "1 month away"}
Available study hours per day: ${hoursPerDay || 3}
 
Return ONLY valid JSON:
{
  "overview": "Brief overview of the plan",
  "weeklySchedule": {
    "Monday": [{"subject": "Math", "duration": "1 hour", "topics": ["Algebra"], "activities": ["Practice problems"]}],
    "Tuesday": [...],
    "Wednesday": [...],
    "Thursday": [...],
    "Friday": [...],
    "Saturday": [...],
    "Sunday": [{"type": "rest", "activity": "Light review"}]
  },
  "priorityTopics": ["Topic 1", "Topic 2"],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "milestones": [{"week": 1, "goal": "Complete all algebra basics"}]
}`;
 
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });
 
  let content = response.content[0].text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    const plan = JSON.parse(content);
    res.json({ success: true, plan });
  } catch {
    res.json({ success: true, plan: null, raw: content });
  }
};
 
// ─────────────────────────────────────────────────────────────
// 6. AI PERFORMANCE INSIGHTS
// @desc  AI analyzes student performance trends
// @route GET /api/ai/insights/:studentId
// ─────────────────────────────────────────────────────────────
const getPerformanceInsights = async (req, res) => {
  const { studentId } = req.params;
 
  const submissions = await Submission.find({ studentId })
    .populate("activityId", "subject title xpReward")
    .sort("-createdAt")
    .limit(20);
 
  const student = await User.findById(studentId).select("name xp level streak");
 
  const performanceData = submissions.map(s => ({
    subject: s.activityId?.subject,
    score: s.score,
    status: s.status,
    xpEarned: s.xpAwarded,
  }));
 
  const prompt = `Analyze this student's learning performance and provide insights.
Student: ${student.name}, Level ${student.level}, XP: ${student.xp}, Streak: ${student.streak} days
 
Recent performance data:
${JSON.stringify(performanceData, null, 2)}
 
Return ONLY valid JSON:
{
  "overallPerformance": "Excellent/Good/Average/Needs Improvement",
  "performanceScore": 78,
  "summary": "2-3 sentence summary",
  "subjectBreakdown": {"Math": {"avg": 85, "trend": "improving"}, "Science": {"avg": 72, "trend": "declining"}},
  "topStrengths": ["Strength 1", "Strength 2"],
  "areasForImprovement": ["Area 1", "Area 2"],
  "predictedGrade": "B+",
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "motivationalMessage": "Personalized encouragement"
}`;
 
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    messages: [{ role: "user", content: prompt }],
  });
 
  let content = response.content[0].text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    const insights = JSON.parse(content);
    res.json({ success: true, insights });
  } catch {
    res.json({ success: true, insights: null, raw: content });
  }
};
 
module.exports = {
  aiTutor,
  generateActivity,
  analyzeSubmission,
  generateQuizQuestions,
  generateStudyPlan,
  getPerformanceInsights,
};
 
