import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { C } from "../../utils/styles";
 
const NAV = {
  student: [
    { path: "/dashboard", icon: "🏠", label: "Overview" },
    { path: "/dashboard/subjects", icon: "📚", label: "Subjects" },
    { path: "/dashboard/activities", icon: "📋", label: "Activities" },
    { path: "/dashboard/upload", icon: "📤", label: "Upload" },
    { path: "/dashboard/verify", icon: "✅", label: "Verify Status" },
    { path: "/dashboard/tutor", icon: "🤖", label: "AI Tutor", badge: "AI" },
    { path: "/dashboard/study-plan", icon: "📅", label: "Study Plan", badge: "AI" },
    { path: "/dashboard/games", icon: "🎮", label: "Games & Rewards" },
    { path: "/dashboard/leaderboard", icon: "🏆", label: "Leaderboard" },
    { path: "/dashboard/profile", icon: "👤", label: "Profile" },
  ],
  teacher: [
    { path: "/dashboard", icon: "🏠", label: "Overview" },
    { path: "/dashboard/classes", icon: "🏫", label: "Classes" },
    { path: "/dashboard/sections", icon: "📐", label: "Sections" },
    { path: "/dashboard/allocated", icon: "📋", label: "Allocated" },
    { path: "/dashboard/activities", icon: "✏️", label: "Activities" },
    { path: "/dashboard/verify", icon: "✅", label: "Verify", badge: "!" },
    { path: "/dashboard/ai-generate", icon: "🤖", label: "AI Generate", badge: "AI" },
    { path: "/dashboard/leaderboard", icon: "🏆", label: "Leaderboard" },
    { path: "/dashboard/profile", icon: "👤", label: "Profile" },
  ],
  school: [
    { path: "/dashboard", icon: "🏠", label: "Overview" },
    { path: "/dashboard/students", icon: "👨‍🎓", label: "Students" },
    { path: "/dashboard/teachers", icon: "👩‍🏫", label: "Teachers" },
    { path: "/dashboard/leaderboard", icon: "🏆", label: "Leaderboard" },
    { path: "/dashboard/profile", icon: "👤", label: "Profile" },
  ],
};
 
const css = `
  .layout { display:flex; min-height:100vh; }
  .sidebar { width:256px; min-width:256px; background:#111827; border-right:1px solid #1e2d45; display:flex; flex-direction:column; position:fixed; top:0; left:0; bottom:0; z-index:50; overflow-y:auto; }
  .sb-logo { padding:22px 18px; border-bottom:1px solid #1e2d45; display:flex; align-items:center; gap:12px; }
  .sb-logo-icon { width:40px; height:40px; background:linear-gradient(135deg,#f59e0b,#f97316); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .nav-wrap { padding:12px 10px 4px; flex:1; }
  .nav-section-label { font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1.2px; padding:8px 10px 4px; }
  .nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:all .15s; color:#64748b; font-size:14px; font-weight:500; margin-bottom:2px; }
  .nav-item:hover { background:#1a2235; color:#f1f5f9; }
  .nav-item.active { background:#f59e0b22; color:#f59e0b; font-weight:600; }
  .nav-icon { font-size:16px; width:20px; text-align:center; }
  .nav-badge { margin-left:auto; background:#f59e0b; color:#000; font-size:9px; font-weight:700; padding:2px 7px; border-radius:20px; }
  .nav-badge.ai { background:linear-gradient(135deg,#8b5cf6,#3b82f6); color:#fff; }
  .sb-footer { padding:14px 10px; border-top:1px solid #1e2d45; }
  .user-pill { display:flex; align-items:center; gap:10px; padding:10px 12px; background:#1a2235; border-radius:12px; cursor:pointer; }
  .user-avatar { width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0; }
  .logout-btn { margin-top:6px; width:100%; padding:9px; background:#ef444422; border:1px solid #ef444433; border-radius:10px; color:#ef4444; cursor:pointer; font-size:13px; font-weight:600; transition:background .2s; }
  .logout-btn:hover { background:#ef444433; }
  .main { margin-left:256px; flex:1; min-width:0; }
  .topbar { padding:18px 28px; border-bottom:1px solid #1e2d45; display:flex; align-items:center; justify-content:space-between; background:#111827; position:sticky; top:0; z-index:40; }
  .content { padding:28px; }
`;
 
export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
 
  const nav = NAV[user?.role] || NAV.student;
 
  return (
    <>
      <style>{css}</style>
      <div className="layout">
        <div className="sidebar">
          <div className="sb-logo">
            <div className="sb-logo-icon">🎓</div>
            <div>
              <div className="syne" style={{ fontWeight: 800, fontSize: 16 }}>EduQuest</div>
              <div style={{ fontSize: 10, color: C.muted }}>Learning Platform</div>
            </div>
          </div>
 
          <div className="nav-wrap">
            <div className="nav-section-label">Menu</div>
            {nav.map(item => (
              <div key={item.path} className={`nav-item ${location.pathname === item.path ? "active" : ""}`} onClick={() => navigate(item.path)}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className={`nav-badge ${item.badge === "AI" ? "ai" : ""}`}>{item.badge}</span>}
              </div>
            ))}
          </div>
 
          <div className="sb-footer">
            <div className="user-pill" onClick={() => navigate("/dashboard/profile")}>
              <div className="user-avatar">{user?.name?.[0]}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name?.split(" ")[0]}</div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "capitalize" }}>{user?.role} · Lv.{user?.level}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={logout}>⬅ Sign Out</button>
          </div>
        </div>
 
        <div className="main">
          <div className="topbar">
            <div>
              <div className="syne" style={{ fontSize: 20, fontWeight: 800 }}>{title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Welcome back, {user?.name?.split(" ")[0]} 👋</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: "6px 14px", background: "#f59e0b22", borderRadius: 20, fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>
                ⭐ {user?.xp?.toLocaleString()} XP
              </div>
              <div style={{ padding: "6px 14px", background: "#8b5cf622", borderRadius: 20, fontSize: 13, fontWeight: 700, color: "#8b5cf6" }}>
                💎 {user?.gems} Gems
              </div>
            </div>
          </div>
          <div className="content">{children}</div>
        </div>
      </div>
    </>
  );
}
 
