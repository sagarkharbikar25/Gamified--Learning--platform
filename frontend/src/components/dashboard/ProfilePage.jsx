import { useState } from "react";
import Layout from "../shared/Layout";
import { useAuth } from "../../context/AuthContext";
import { authAPI, aiAPI } from "../../services/api";
import toast from "react-hot-toast";
import { C } from "../../utils/styles";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", bio: user?.bio || "" });
  const [saving, setSaving] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success("Profile updated!");
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  };

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await aiAPI.getInsights(user._id);
      setInsights(res.data.insights);
    } catch { toast.error("Failed to load AI insights"); }
    finally { setInsightsLoading(false); }
  };

  const xpThresholds = [0, 500, 1200, 2200, 3500, 5000, 7000, 9500, 12500];
  const nextXp = xpThresholds[user?.level] || 12500;
  const xpProgress = Math.min(((user?.xp || 0) / nextXp) * 100, 100);

  return (
    <Layout title="My Profile">
      {/* Profile Hero */}
      <div style={{ background: `linear-gradient(135deg,${C.card},${C.surface})`, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, display: "flex", alignItems: "center", gap: 28, marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, background: `linear-gradient(135deg,${C.accent},#f97316)`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, flexShrink: 0 }}>
          {user?.name?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div className="syne" style={{ fontSize: 22, fontWeight: 800 }}>{user?.name}</div>
          <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{user?.email} · {user?.role}</div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 4 }}>
              <span>Level {user?.level} Progress</span>
              <span style={{ color: C.text }}>{user?.xp?.toLocaleString()} / {nextXp.toLocaleString()} XP</span>
            </div>
            <div style={{ height: 8, background: C.surface, borderRadius: 4 }}>
              <div style={{ height: "100%", width: `${xpProgress}%`, background: `linear-gradient(90deg,${C.purple},${C.blue})`, borderRadius: 4 }} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[["⭐", user?.xp?.toLocaleString(), "Total XP"], ["💎", user?.gems, "Gems"], ["🔥", user?.streak, "Streak"], ["🏆", `Lv.${user?.level}`, "Level"]].map(([ic, v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{ic}</div>
              <div className="syne" style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>{v}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Edit Profile */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div className="syne" style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Edit Profile</div>
          {[["Full Name", "name", "text"], ["Phone", "phone", "tel"], ["Bio", "bio", "textarea"]].map(([label, key, type]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".8px", display: "block", marginBottom: 6 }}>{label}</label>
              {type === "textarea"
                ? <textarea value={form[key]} onChange={set(key)} rows={3} style={{ width: "100%", padding: "11px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", resize: "vertical" }} />
                : <input type={type} value={form[key]} onChange={set(key)} style={{ width: "100%", padding: "11px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none" }} />
              }
            </div>
          ))}
          <button onClick={save} disabled={saving} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer", width: "100%" }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* AI Insights */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div className="syne" style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>AI Learning Insights</div>
          {!insights ? (
            <button onClick={loadInsights} disabled={insightsLoading} style={{ background: `linear-gradient(135deg,${C.purple},${C.blue})`, color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer", width: "100%" }}>
              {insightsLoading ? "Analyzing..." : "✨ Generate AI Insights"}
            </button>
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>{insights}</div>
          )}
        </div>
      </div>
    </Layout>
  );
}