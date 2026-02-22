# 🎓 EduQuest — Gamified Learning Platform
 
A full-stack gamified learning platform with AI-powered features built with React, Node.js, Express, and MongoDB.
 
---
 
## 📁 Folder Structure
 
```
eduquest/
├── backend/
│   ├── config/         → Database connection
│   ├── controllers/    → Route logic (auth, AI, activities, games...)
│   ├── middleware/     → JWT auth, error handler
│   ├── models/         → MongoDB schemas
│   ├── routes/         → Express route definitions
│   ├── utils/          → Seed script
│   ├── .env            → 🔑 Your environment variables
│   ├── server.js       → App entry point
│   └── package.json
│
├── frontend/
│   ├── public/         → index.html
│   ├── src/
│   │   ├── components/ → All UI components
│   │   ├── context/    → AuthContext (user state)
│   │   ├── hooks/      → useAITutor (streaming chat)
│   │   ├── services/   → API calls (axios)
│   │   └── utils/      → Shared styles/tokens
│   ├── .env
│   └── package.json
```
 
---
 
## 🚀 Quick Start
 
### Step 1 — Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key (for AI features)
 
### Step 2 — Backend Setup
 
```bash
cd backend
npm install
```
 
Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/eduquest   # or your Atlas URI
JWT_SECRET=your_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your-key-here        # Get from console.anthropic.com
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLIENT_URL=http://localhost:3000
```
 
Seed demo data:
```bash
cd utils
node seed.js
```
 
Start backend:
```bash
cd ..
npm run dev    # uses nodemon (hot reload)
# or
npm start      # production
```
 
Backend runs on → http://localhost:5050
 
### Step 3 — Frontend Setup
 
```bash
cd frontend
npm install
npm start
```
 
Frontend runs on → http://localhost:3000
 
---
 
## 🔑 Demo Login Credentials (after seed)
 
| Role    | Email                        | Password     |
|---------|------------------------------|--------------|
| Student | arjun@student.edu            | Student@123  |
| Teacher | aarti@sunriseschool.edu      | Teacher@123  |
| School  | admin@sunriseschool.edu      | School@123   |
 
---
 
## 🤖 AI Features (requires ANTHROPIC_API_KEY)
 
| Feature                | Description                                      |
|------------------------|--------------------------------------------------|
| **AI Tutor Chat**      | Streaming chat with Claude — any subject          |
| **Activity Generator** | Teachers describe topic → AI creates full quiz   |
| **Submission Feedback**| AI grades student work with detailed analysis    |
| **Study Plan**         | Personalized weekly schedule based on weak areas |
| **Performance Insights**| AI analyzes trends and gives recommendations    |
| **AI Quiz Questions**  | Dynamic questions for Brain Quiz mini game       |
 
---
 
## 🗃️ Database Collections
 
- **users** — Students, Teachers, School admins with XP/gems/level
- **activities** — Assignments, quizzes, projects
- **submissions** — Student submissions with AI feedback
- **badges** — Achievement badges
- **gamesessions** — Mini game scores and XP
 
---
 
## 🌐 API Endpoints
 
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
 
GET    /api/activities          (role-filtered)
POST   /api/activities          (teacher)
POST   /api/activities/:id/submit   (student)
PUT    /api/activities/submissions/:id/verify  (teacher)
 
POST   /api/ai/tutor            (streaming SSE)
POST   /api/ai/generate-activity
POST   /api/ai/feedback/:id
POST   /api/ai/study-plan
GET    /api/ai/insights/:id
 
GET    /api/leaderboard
GET    /api/students
GET    /api/teachers
GET    /api/school/stats
 
POST   /api/games/session
GET    /api/leaderboard
```
 
---
 
## 📦 Tech Stack
 
**Frontend:** React 18, React Router v6, Axios, React Hot Toast  
**Backend:** Node.js, Express, JWT, Bcrypt, Multer, Mongoose  
**Database:** MongoDB  
**AI:** Anthropic Claude (claude-sonnet-4-20250514)  
**File Storage:** Cloudinary  
**Styling:** Pure CSS-in-JS (no Tailwind dependency)
