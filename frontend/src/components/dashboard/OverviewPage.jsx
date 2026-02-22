import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../shared/Layout";
import { useAuth } from "../../context/AuthContext";
import { activityAPI, leaderboardAPI, schoolAPI } from "../../services/api";
import { C } from "../../utils/styles";
 
function StatCard({ icon, val, label, color, sub }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div className="syne" style={{ fontSize: 28, fontWeight: 800 }}>{val}</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
 
export default function OverviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
 
  useEffect(() => {
    activityAPI.getAll().then(r => setActivities(r.data.activities?.slice(0, 5) || [])).catch(() => {});
    leaderboardAPI.get({ limit: 5 }).then(r => setLeaderboard(r.data.leaderboard || [])).catch(() => {});
    if (user?.role === "school") schoolAPI.getStats().then(r => setStats(r.data.stats)).catch(() => {});
  }, [user]);
 
  const xpToNext = [500, 1200, 2200, 3500, 5000, 7000, 9500, 12500][user?.level - 1] || 2200;
  const xpProgress = Math.min(((user?.xp || 0) / xpToNext) * 100, 100);
 
  return (
    <Layout title="Dashboard Overview">
      {/* XP Hero bar */}
      <div style={{ background: "linear-gradient(135deg,#1a0a2e,#0d1b3e)", border: `1px solid #8b5cf644`, borderRadius: 16, padding: 24, marginBottom: 24, display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#f59e0b,#f97316)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, flexShrink: 0 }}>
          {user?.name?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div className="syne" style={{ fontSize: 20, fontWeight: 800 }}>{user?.name} <span style={{ color: "#8b5cf6", fontSize: 14 }}>Level {user?.level}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <div style={{ flex: 1, height: 8, background: "#ffffff15", borderRadius: 4 }}>
              <div style={{ height: "100%", width: `${xpProgress}%`, background: "linear-gradient(90deg,#8b5cf6,#3b82f6)", borderRadius: 4, transition: "width .5s" }} />
            </div>
            <span style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{user?.xp?.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[["🔥", user?.streak || 0, "Streak"], ["💎", user?.gems || 0, "Gems"]].map(([ic, v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{ic}</div>
              <div className="syne" style={{ fontWeight: 800, fontSize: 18 }}>{v}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {user?.role === "school" ? <>
          <StatCard icon="👨‍🎓" val={stats?.totalStudents || "—"} label="Total Students" color={C.green} sub="↑ Active" />
          <StatCard icon="👩‍🏫" val={stats?.totalTeachers || "—"} label="Total Teachers" color={C.blue} />
          <StatCard icon="📋" val={stats?.totalActivities || "—"} label="Activities" color={C.accent} />
          <StatCard icon="⏳" val={stats?.pendingVerifications || "—"} label="Pending Verification" color={C.red} />
        </> : <>
          <StatCard icon="⭐" val={user?.xp?.toLocaleString() || 0} label="Total XP" color={C.accent} />
          <StatCard icon="🏆" val={`Lv.${user?.level || 1}`} label="Current Level" color={C.purple} />
          <StatCard icon="💎" val={user?.gems || 0} label="Gems" color={C.blue} />
          <StatCard icon="🔥" val={`${user?.streak || 0}d`} label="Current Streak" color={C.red} />
        </>}
      </div>
 
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Activities */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="syne" style={{ fontWeight: 700, fontSize: 15 }}>Recent Activities</span>
            <button onClick={() => navigate("/dashboard/activities")} style={{ fontSize: 12, color: C.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View All →</button>
          </div>
          {activities.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: C.muted }}>No activities yet</div>
          ) : activities.map(a => (
            <div key={a._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${C.border}11` }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📝</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{a.subject} · Due {new Date(a.dueDate).toLocaleDateString()}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>+{a.xpReward} XP</span>
            </div>
          ))}
        </div>
 
        {/* Leaderboard */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="syne" style={{ fontWeight: 700, fontSize: 15 }}>Top Learners</span>
            <button onClick={() => navigate("/dashboard/leaderboard")} style={{ fontSize: 12, color: C.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Full Board →</button>
          </div>
          {leaderboard.map((s, i) => (
            <div key={s._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${C.border}11` }}>
              <span className="syne" style={{ fontWeight: 800, fontSize: 16, width: 24, color: i === 0 ? C.accent : i === 1 ? C.subtle : i === 2 ? "#cd7f32" : C.muted }}>{i + 1}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${C.blue},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{s.name?.[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Level {s.level}</div>
              </div>
              <span className="syne" style={{ fontWeight: 700, color: C.accent }}>{s.xp?.toLocaleString()} XP</span>
            </div>
          ))}
          {leaderboard.length === 0 && <div style={{ padding: 32, textAlign: "center", color: C.muted }}>No data yet</div>}
        </div>
      </div>
 
      {/* Quick actions */}
      <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {user?.role === "student" && [
          ["🤖 Ask AI Tutor", "/dashboard/tutor", C.purple],
          ["📅 Get Study Plan", "/dashboard/study-plan", C.blue],
          ["🎮 Play Mini Game", "/dashboard/games", C.green],
          ["📤 Upload Work", "/dashboard/upload", C.accent],
        ].map(([label, path, color]) => (
          <button key={path} onClick={() => navigate(path)} style={{ padding: "10px 20px", background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 10, color, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
            {label}
          </button>
        ))}
        {user?.role === "teacher" && [
          ["🤖 Generate Activity", "/dashboard/ai-generate", C.purple],
          ["✅ Verify Submissions", "/dashboard/verify", C.green],
          ["✏️ Create Activity", "/dashboard/activities", C.accent],
        ].map(([label, path, color]) => (
          <button key={path} onClick={() => navigate(path)} style={{ padding: "10px 20px", background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 10, color, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
            {label}
          </button>
        ))}
      </div>
    </Layout>
  );
}
 
