import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
 
// Pages
import AuthPage from "./components/auth/AuthPage";
import OverviewPage from "./components/dashboard/OverviewPage";
import ActivitiesPage from "./components/dashboard/ActivitiesPage";
import AITutorPage from "./components/dashboard/AITutorPage";
import AIGeneratePage from "./components/dashboard/AIGeneratePage";
import ProfilePage from "./components/dashboard/ProfilePage";
import GamesPage from "./components/games/GamesPage";
 
// Lazy-load simpler pages
import Layout from "./components/shared/Layout";
import { C } from "./utils/styles";
import { useEffect, useState } from "react";
import { studentAPI, teacherAPI, activityAPI, leaderboardAPI } from "./services/api";
import toast from "react-hot-toast";
 
// ─── Placeholder pages ───────────────────────────
function StudentsPage() {
  const [students, setStudents] = useState([]);
  useEffect(() => { studentAPI.getAll().then(r => setStudents(r.data.students || [])).catch(() => {}); }, []);
  return (
    <Layout title="Student Management">
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}><span className="syne" style={{ fontWeight: 700 }}>Students ({students.length})</span></div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: C.surface }}>{["Name", "Class", "Section", "XP", "Level"].map(h => <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".8px" }}>{h}</th>)}</tr></thead>
          <tbody>{students.map(s => (
            <tr key={s._id} style={{ borderBottom: `1px solid ${C.border}11` }}>
              <td style={{ padding: "14px 20px", fontWeight: 600 }}>{s.name}</td>
              <td style={{ padding: "14px 20px", color: C.muted }}>{s.studentInfo?.class}</td>
              <td style={{ padding: "14px 20px", color: C.muted }}>{s.studentInfo?.section}</td>
              <td style={{ padding: "14px 20px", color: C.accent, fontWeight: 700 }}>{s.xp?.toLocaleString()}</td>
              <td style={{ padding: "14px 20px" }}><span style={{ padding: "3px 10px", background: `${C.purple}22`, color: C.purple, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Lv.{s.level}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Layout>
  );
}
 
function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  useEffect(() => { teacherAPI.getAll().then(r => setTeachers(r.data.teachers || [])).catch(() => {}); }, []);
  return (
    <Layout title="Teacher Management">
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}><span className="syne" style={{ fontWeight: 700 }}>Teachers ({teachers.length})</span></div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: C.surface }}>{["Name", "Subjects", "Classes", "Employee ID"].map(h => <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".8px" }}>{h}</th>)}</tr></thead>
          <tbody>{teachers.map(t => (
            <tr key={t._id} style={{ borderBottom: `1px solid ${C.border}11` }}>
              <td style={{ padding: "14px 20px", fontWeight: 600 }}>{t.name}</td>
              <td style={{ padding: "14px 20px", color: C.muted }}>{t.teacherInfo?.subjects?.join(", ")}</td>
              <td style={{ padding: "14px 20px", color: C.muted }}>{t.teacherInfo?.classes?.join(", ")}</td>
              <td style={{ padding: "14px 20px", color: C.subtle }}>{t.teacherInfo?.employeeId || "—"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Layout>
  );
}
 
function VerifyPage() {
  const [submissions, setSubmissions] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [scores, setScores] = useState({});
  const { user } = useAuth();
 
  useEffect(() => {
    // Teachers: get pending submissions across all their activities
    if (user?.role === "teacher") {
      activityAPI.getAll().then(async r => {
        const acts = r.data.activities || [];
        const all = await Promise.all(acts.slice(0, 5).map(a => activityAPI.getSubmissions(a._id).then(sr => sr.data.submissions)));
        const pending = all.flat().filter(s => s.status === "submitted" || s.status === "late");
        setSubmissions(pending);
      }).catch(() => {});
    }
  }, [user]);
 
  const verify = async (s, status) => {
    try {
      await activityAPI.verifySubmission(s._id, { score: parseInt(scores[s._id] || 80), teacherFeedback: feedback[s._id] || "", status });
      toast.success(status === "verified" ? "✅ Verified!" : "❌ Rejected");
      setSubmissions(prev => prev.filter(sub => sub._id !== s._id));
    } catch { toast.error("Failed"); }
  };
 
  return (
    <Layout title="Verify Submissions">
      {submissions.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <div className="syne" style={{ fontWeight: 700, fontSize: 18, marginTop: 16 }}>All caught up!</div>
          <div style={{ color: C.muted, marginTop: 8 }}>No pending submissions to review</div>
        </div>
      ) : submissions.map(s => (
        <div key={s._id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{s.studentId?.name}</div>
              <div style={{ fontSize: 13, color: C.muted }}>Submitted {new Date(s.submittedAt).toLocaleDateString()}</div>
            </div>
            <span style={{ padding: "4px 10px", background: s.status === "late" ? `${C.red}22` : `${C.blue}22`, color: s.status === "late" ? C.red : C.blue, borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{s.status}</span>
          </div>
          <div style={{ padding: 14, background: C.surface, borderRadius: 10, fontSize: 14, color: C.subtle, marginBottom: 16, lineHeight: 1.6 }}>{s.text || "(File submission)"}</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input type="number" min={0} max={100} placeholder="Score (0-100)" value={scores[s._id] || ""} onChange={e => setScores(p => ({ ...p, [s._id]: e.target.value }))}
              style={{ width: 140, padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, outline: "none" }} />
            <input placeholder="Feedback (optional)" value={feedback[s._id] || ""} onChange={e => setFeedback(p => ({ ...p, [s._id]: e.target.value }))}
              style={{ flex: 1, padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, outline: "none" }} />
            <button onClick={() => verify(s, "verified")} style={{ padding: "10px 20px", background: `${C.green}22`, border: `1px solid ${C.green}44`, borderRadius: 8, color: C.green, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>✓ Verify</button>
            <button onClick={() => verify(s, "rejected")} style={{ padding: "10px 20px", background: `${C.red}22`, border: `1px solid ${C.red}44`, borderRadius: 8, color: C.red, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>✗ Reject</button>
          </div>
        </div>
      ))}
    </Layout>
  );
}
 
function LeaderboardPage() {
  const [board, setBoard] = useState([]);
  const [type, setType] = useState("xp");
  useEffect(() => { leaderboardAPI.get({ type }).then(r => setBoard(r.data.leaderboard || [])).catch(() => {}); }, [type]);
  return (
    <Layout title="Leaderboard">
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["xp", "⭐ XP"], ["gems", "💎 Gems"], ["streak", "🔥 Streak"]].map(([v, l]) => (
          <button key={v} onClick={() => setType(v)} style={{ padding: "9px 18px", background: type === v ? C.accent : C.card, border: `1px solid ${type === v ? C.accent : C.border}`, borderRadius: 10, color: type === v ? "#000" : C.text, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>{l}</button>
        ))}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        {board.map((s, i) => (
          <div key={s._id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderBottom: `1px solid ${C.border}11` }}>
            <span className="syne" style={{ fontWeight: 800, fontSize: 20, width: 32, color: i === 0 ? C.accent : i === 1 ? C.subtle : i === 2 ? "#cd7f32" : C.muted }}>{i + 1}</span>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${C.blue},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{s.name?.[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: C.muted }}>Level {s.level} · Class {s.class}</div>
            </div>
            <div className="syne" style={{ fontWeight: 700, fontSize: 20, color: C.accent }}>{type === "xp" ? `${s.xp?.toLocaleString()} XP` : type === "gems" ? `${s.gems} 💎` : `${s.streak}d 🔥`}</div>
          </div>
        ))}
        {board.length === 0 && <div style={{ padding: 40, textAlign: "center", color: C.muted }}>No data yet. Start learning to appear here!</div>}
      </div>
    </Layout>
  );
}
 
// ─── Route Guard ─────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", fontFamily: "Syne,sans-serif", fontSize: 20 }}>Loading EduQuest...</div>;
  return user ? children : <Navigate to="/login" replace />;
}
 
function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}
 
// ─── App ──────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: "#1a2235", color: "#f1f5f9", border: "1px solid #1e2d45" } }} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/dashboard/activities" element={<ProtectedRoute><ActivitiesPage /></ProtectedRoute>} />
          <Route path="/dashboard/tutor" element={<ProtectedRoute><AITutorPage /></ProtectedRoute>} />
          <Route path="/dashboard/ai-generate" element={<ProtectedRoute><AIGeneratePage /></ProtectedRoute>} />
          <Route path="/dashboard/games" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="/dashboard/teachers" element={<ProtectedRoute><TeachersPage /></ProtectedRoute>} />
          <Route path="/dashboard/verify" element={<ProtectedRoute><VerifyPage /></ProtectedRoute>} />
          <Route path="/dashboard/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
 
