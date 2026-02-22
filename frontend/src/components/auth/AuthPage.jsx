import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { C } from "../../utils/styles";
 
const css = `
  .auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
  .auth-bg { position:absolute; inset:0; background: radial-gradient(ellipse at 20% 50%, #f59e0b15, transparent 60%), radial-gradient(ellipse at 80% 20%, #3b82f615, transparent 50%), radial-gradient(ellipse at 60% 80%, #8b5cf615, transparent 50%); }
  .auth-grid { position:absolute; inset:0; background-image: linear-gradient(#1e2d4544 1px, transparent 1px), linear-gradient(90deg, #1e2d4544 1px, transparent 1px); background-size:40px 40px; }
  .auth-card { position:relative; z-index:10; background:#1a2235; border:1px solid #1e2d45; border-radius:20px; padding:44px; width:460px; max-width:95vw; }
  .auth-logo { display:flex; align-items:center; gap:12px; margin-bottom:28px; }
  .auth-logo-icon { width:48px; height:48px; background:linear-gradient(135deg,#f59e0b,#f97316); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:24px; }
  .role-tabs { display:flex; gap:6px; margin-bottom:24px; background:#111827; padding:4px; border-radius:12px; }
  .role-tab { flex:1; padding:10px; border:none; border-radius:9px; cursor:pointer; font-size:13px; font-weight:600; transition:all .2s; background:transparent; color:#64748b; }
  .role-tab.active { background:#f59e0b; color:#000; }
  .form-group { margin-bottom:16px; }
  .form-label { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.8px; margin-bottom:6px; display:block; }
  .form-input { width:100%; padding:12px 14px; background:#111827; border:1px solid #1e2d45; border-radius:10px; color:#f1f5f9; font-size:14px; outline:none; transition:border-color .2s; }
  .form-input:focus { border-color:#f59e0b; }
  .btn-auth { width:100%; padding:14px; background:linear-gradient(135deg,#f59e0b,#f97316); border:none; border-radius:12px; color:#000; font-family:'Syne',sans-serif; font-size:16px; font-weight:700; cursor:pointer; margin-top:8px; }
  .btn-auth:hover { opacity:.9; }
  .auth-switch { text-align:center; margin-top:18px; font-size:13px; color:#64748b; }
  .auth-switch span { color:#f59e0b; cursor:pointer; font-weight:600; }
  .demo-box { margin-top:16px; padding:12px 16px; background:#111827; border:1px solid #1e2d45; border-radius:10px; font-size:12px; color:#64748b; }
  .demo-box strong { color:#f1f5f9; display:block; margin-bottom:4px; }
`;
 
export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login, register } = useAuth();
  const navigate = useNavigate();
 
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
 
  const handleSubmit = async () => {
    if (!form.email || !form.password) return toast.error("Email and password required");
    if (mode === "register" && !form.name) return toast.error("Name is required");
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password, role);
      else await register({ ...form, role });
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <>
      <style>{css}</style>
      <div className="auth-wrap">
        <div className="auth-bg" />
        <div className="auth-grid" />
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">🎓</div>
            <div>
              <div className="syne" style={{ fontSize: 26, fontWeight: 800 }}>EduQuest</div>
              <div style={{ fontSize: 13, color: C.muted }}>Gamified Learning Platform</div>
            </div>
          </div>
 
          <div className="role-tabs">
            {["student", "teacher", "school"].map(r => (
              <button key={r} className={`role-tab ${role === r ? "active" : ""}`} onClick={() => setRole(r)}>
                {r === "student" ? "👨‍🎓" : r === "teacher" ? "👩‍🏫" : "🏫"} {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
 
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Your full name" value={form.name} onChange={set("name")} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@school.edu" value={form.email} onChange={set("email")} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
 
          <button className="btn-auth" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
 
          <div className="auth-switch">
            {mode === "login"
              ? <>Don't have an account? <span onClick={() => setMode("register")}>Register</span></>
              : <>Already have an account? <span onClick={() => setMode("login")}>Sign In</span></>}
          </div>
 
          <div className="demo-box">
            <strong>🧪 Demo Credentials (after running seed):</strong>
            Student: arjun@student.edu / Student@123<br />
            Teacher: aarti@sunriseschool.edu / Teacher@123<br />
            School: admin@sunriseschool.edu / School@123
          </div>
        </div>
      </div>
    </>
  );
}
 
