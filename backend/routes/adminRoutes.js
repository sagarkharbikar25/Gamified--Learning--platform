require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const Activity = require("../models/Activity");
const Badge = require("../models/Badge");
 
const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("🌱 Seeding database...");
 
  // Clear existing data
  await Promise.all([User.deleteMany({}), Activity.deleteMany({}), Badge.deleteMany({})]);
 
  // Create badges
  const badges = await Badge.insertMany([
    { name: "First Submit", description: "Submit your first activity", icon: "🏅", category: "academic", rarity: "common" },
    { name: "7-Day Streak", description: "Login 7 days in a row", icon: "🔥", category: "streak", rarity: "rare" },
    { name: "Top Scorer", description: "Score 100% on any activity", icon: "⭐", category: "academic", rarity: "epic" },
    { name: "Fast Learner", description: "Complete 5 activities in a week", icon: "🚀", category: "academic", rarity: "rare" },
    { name: "Bookworm", description: "Complete 20 activities", icon: "📚", category: "academic", rarity: "epic" },
    { name: "Game Master", description: "Win 10 mini games", icon: "🎮", category: "game", rarity: "legendary" },
  ]);
 
  // Create school account
  const school = await User.create({
    name: "Sunrise International School",
    email: "admin@sunriseschool.edu",
    password: "School@123",
    role: "school",
    schoolInfo: { schoolName: "Sunrise International School", address: "123 Education Lane", board: "CBSE" },
  });
 
  // Create teachers
  const teachers = await User.insertMany([
    { name: "Dr. Aarti Singh", email: "aarti@sunriseschool.edu", password: "Teacher@123", role: "teacher", schoolId: school._id, teacherInfo: { employeeId: "T001", subjects: ["Mathematics"], classes: ["10A", "10B"] } },
    { name: "Prof. Rajan Nair", email: "rajan@sunriseschool.edu", password: "Teacher@123", role: "teacher", schoolId: school._id, teacherInfo: { employeeId: "T002", subjects: ["Science"], classes: ["9A", "11A"] } },
    { name: "Ms. Kavya Reddy", email: "kavya@sunriseschool.edu", password: "Teacher@123", role: "teacher", schoolId: school._id, teacherInfo: { employeeId: "T003", subjects: ["English"], classes: ["9B", "10A"] } },
  ]);
 
  // Create students
  const students = await User.insertMany([
    { name: "Arjun Sharma", email: "arjun@student.edu", password: "Student@123", role: "student", schoolId: school._id, xp: 1840, level: 4, gems: 120, streak: 7, studentInfo: { rollNo: "2024-001", class: "10", section: "A" }, badges: [badges[0]._id, badges[1]._id] },
    { name: "Priya Verma", email: "priya@student.edu", password: "Student@123", role: "student", schoolId: school._id, xp: 1650, level: 3, gems: 95, studentInfo: { rollNo: "2024-002", class: "10", section: "B" } },
    { name: "Rahul Patel", email: "rahul@student.edu", password: "Student@123", role: "student", schoolId: school._id, xp: 980, level: 2, gems: 60, studentInfo: { rollNo: "2024-003", class: "9", section: "A" } },
    { name: "Sneha Iyer", email: "sneha@student.edu", password: "Student@123", role: "student", schoolId: school._id, xp: 2100, level: 5, gems: 180, streak: 12, studentInfo: { rollNo: "2024-004", class: "11", section: "A" }, badges: [badges[2]._id] },
  ]);
 
  // Create activities
  await Activity.insertMany([
    { title: "Algebra Fundamentals Quiz", description: "Test your knowledge of algebraic expressions, equations and inequalities", subject: "Mathematics", type: "quiz", dueDate: new Date(Date.now() + 7 * 86400000), maxScore: 100, xpReward: 80, gemReward: 15, teacherId: teachers[0]._id, assignedClasses: ["10A", "10B"], schoolId: school._id },
    { title: "Newton's Laws Essay", description: "Write a 500-word essay explaining all three of Newton's laws of motion with real-world examples", subject: "Science", type: "essay", dueDate: new Date(Date.now() + 5 * 86400000), maxScore: 100, xpReward: 100, gemReward: 20, teacherId: teachers[1]._id, assignedClasses: ["9A"], schoolId: school._id },
    { title: "Grammar & Punctuation Exercise", description: "Complete the grammar exercises covering tenses, punctuation, and sentence structure", subject: "English", type: "assignment", dueDate: new Date(Date.now() + 3 * 86400000), maxScore: 50, xpReward: 60, gemReward: 12, teacherId: teachers[2]._id, assignedClasses: ["10A", "9B"], schoolId: school._id },
  ]);
 
  console.log("\n✅ Seeding complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🏫 School Login:");
  console.log("   Email:    admin@sunriseschool.edu");
  console.log("   Password: School@123");
  console.log("\n👨‍🏫 Teacher Logins:");
  console.log("   Email:    aarti@sunriseschool.edu");
  console.log("   Password: Teacher@123");
  console.log("\n👨‍🎓 Student Login:");
  console.log("   Email:    arjun@student.edu");
  console.log("   Password: Student@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
 
  await mongoose.disconnect();
};
 
seed().catch(err => { console.error(err); process.exit(1); });
