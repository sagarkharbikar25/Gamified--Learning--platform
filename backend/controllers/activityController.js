const Activity = require("../models/Activity");
const Submission = require("../models/Submission");
const User = require("../models/User");
 
// @desc  Get all activities (filtered by user role)
// @route GET /api/activities
const getActivities = async (req, res) => {
  const user = req.user;
  let filter = { isActive: true };
 
  if (user.role === "student") {
    const classSection = `${user.studentInfo?.class}${user.studentInfo?.section}`;
    filter.$or = [
      { assignedClasses: classSection },
      { assignedStudents: user._id },
    ];
  } else if (user.role === "teacher") {
    filter.teacherId = user._id;
  }
 
  const activities = await Activity.find(filter)
    .populate("teacherId", "name")
    .sort("-createdAt");
 
  // If student, attach their submission status
  if (user.role === "student") {
    const submissionMap = {};
    const submissions = await Submission.find({ studentId: user._id });
    submissions.forEach(s => { submissionMap[s.activityId.toString()] = s; });
 
    const enriched = activities.map(a => ({
      ...a.toObject(),
      mySubmission: submissionMap[a._id.toString()] || null,
    }));
    return res.json({ success: true, count: enriched.length, activities: enriched });
  }
 
  res.json({ success: true, count: activities.length, activities });
};
 
// @desc  Get single activity
// @route GET /api/activities/:id
const getActivity = async (req, res) => {
  const activity = await Activity.findById(req.params.id).populate("teacherId", "name email");
  if (!activity) return res.status(404).json({ success: false, message: "Activity not found" });
  res.json({ success: true, activity });
};
 
// @desc  Create activity (teacher only)
// @route POST /api/activities
const createActivity = async (req, res) => {
  const { title, description, subject, type, dueDate, maxScore, xpReward, gemReward, assignedClasses, assignedSections, isAIGenerated, aiPrompt } = req.body;
 
  const activity = await Activity.create({
    title, description, subject, type, dueDate, maxScore, xpReward, gemReward,
    assignedClasses, assignedSections,
    teacherId: req.user._id,
    schoolId: req.user.schoolId || req.user._id,
    isAIGenerated: isAIGenerated || false,
    aiPrompt: aiPrompt || "",
  });
 
  res.status(201).json({ success: true, activity });
};
 
// @desc  Update activity
// @route PUT /api/activities/:id
const updateActivity = async (req, res) => {
  let activity = await Activity.findById(req.params.id);
  if (!activity) return res.status(404).json({ success: false, message: "Not found" });
  if (activity.teacherId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
  activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, activity });
};
 
// @desc  Delete activity
// @route DELETE /api/activities/:id
const deleteActivity = async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) return res.status(404).json({ success: false, message: "Not found" });
  await activity.deleteOne();
  res.json({ success: true, message: "Activity deleted" });
};
 
// @desc  Submit activity (student)
// @route POST /api/activities/:id/submit
const submitActivity = async (req, res) => {
  const { text } = req.body;
  const activityId = req.params.id;
  const studentId = req.user._id;
 
  const activity = await Activity.findById(activityId);
  if (!activity) return res.status(404).json({ success: false, message: "Activity not found" });
 
  let submission = await Submission.findOne({ activityId, studentId });
 
  const isLate = new Date() > new Date(activity.dueDate);
 
  if (submission) {
    submission.text = text;
    submission.status = isLate ? "late" : "submitted";
    submission.submittedAt = new Date();
  } else {
    submission = await Submission.create({
      activityId, studentId,
      teacherId: activity.teacherId,
      text,
      status: isLate ? "late" : "submitted",
      maxScore: activity.maxScore,
      submittedAt: new Date(),
    });
  }
 
  await submission.save();
  res.json({ success: true, submission });
};
 
// @desc  Verify / grade submission (teacher)
// @route PUT /api/activities/submissions/:id/verify
const verifySubmission = async (req, res) => {
  const { score, teacherFeedback, status } = req.body; // status: verified | rejected
 
  const submission = await Submission.findById(req.params.id).populate("activityId");
  if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
 
  const activity = submission.activityId;
  let xpAwarded = 0, gemsAwarded = 0;
 
  if (status === "verified") {
    const ratio = score / activity.maxScore;
    xpAwarded = Math.round(activity.xpReward * ratio);
    gemsAwarded = Math.round((activity.gemReward || 10) * ratio);
 
    // Award XP and gems to student
    const student = await User.findById(submission.studentId);
    student.xp += xpAwarded;
    student.gems += gemsAwarded;
    student.calculateLevel();
    await student.save();
  }
 
  submission.score = score;
  submission.teacherFeedback = teacherFeedback || "";
  submission.status = status;
  submission.xpAwarded = xpAwarded;
  submission.gemsAwarded = gemsAwarded;
  submission.verifiedAt = new Date();
  await submission.save();
 
  res.json({ success: true, submission, xpAwarded, gemsAwarded });
};
 
// @desc  Get submissions for a teacher
// @route GET /api/activities/:id/submissions
const getSubmissions = async (req, res) => {
  const submissions = await Submission.find({ activityId: req.params.id })
    .populate("studentId", "name studentInfo xp level");
  res.json({ success: true, count: submissions.length, submissions });
};
 
module.exports = { getActivities, getActivity, createActivity, updateActivity, deleteActivity, submitActivity, verifySubmission, getSubmissions };
