require("dotenv").config();
require("express-async-errors");
 
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
 
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
 
// ─── Route Imports ──────────────────────────────
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const activityRoutes = require("./routes/activityRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const gameRoutes = require("./routes/gameRoutes");
const adminRoutes = require("./routes/adminRoutes");
 const Anthropic = require('@anthropic-ai/sdk');  // ✅ correct
const app = express();
 
// ─── Connect Database ────────────────────────────
connectDB();
 
// ─── Security Middleware ─────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
 
// ─── Rate Limiting ───────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: "Too many requests, please try again later." },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many login attempts, please try again later." },
});
 
app.use("/api/", limiter);
app.use("/api/auth", authLimiter);
 
// ─── Body Parsing ────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
 
// ─── Logging ─────────────────────────────────────
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
 
// ─── Static Uploads (local fallback) ─────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
 
// ─── Routes ──────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/students",    studentRoutes);
app.use("/api/teachers",    teacherRoutes);
app.use("/api/school",      schoolRoutes);
app.use("/api/activities",  activityRoutes);
app.use("/api/uploads",     uploadRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/ai",          aiRoutes);
app.use("/api/games",       gameRoutes);
app.use("/api/admin",       adminRoutes);
 
// ─── Health Check ────────────────────────────────
app.get("/api/health", (req, res) => res.json({ success: true, message: "EduQuest API running 🚀", env: process.env.NODE_ENV }));
 
// ─── Error Handler ───────────────────────────────
app.use(errorHandler);
 
// ─── Start Server ────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 EduQuest Server running on http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
  console.log(`🤖 AI Features: ${process.env.ANTHROPIC_API_KEY ? "Enabled" : "Disabled (add ANTHROPIC_API_KEY)"}\n`);
});
 
