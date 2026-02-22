import { useEffect, useState } from "react";
import Layout from "../shared/Layout";
import { useAuth } from "../../context/AuthContext";
import { activityAPI, aiAPI } from "../../services/api";
import toast from "react-hot-toast";
import { C } from "../../utils/styles";
 
const STATUS_COLOR = { pending: C.accent, submitted: C.blue, verified: C.green, rejected: C.red, late: C.red };
 
export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitText, setSubmitText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
 
  useEffect(() => {
    activityAPI.getAll().then(r => setActivities(r.data.activities || [])).finally(() => setLoading(false));
  }, []);
 
  const handleSubmit = async (activityId) => {
    try {
      const res = await activityAPI.submit(activityId, { text: submitText });
      toast.success("Submitted! ✅");
      setActivities(prev => prev.map(a => a._id === activityId ? { ...a, mySubmission: res.data.submission } : a));
      setSelected(null);
      setSubmitText("");
    } catch { toast.error("Submission failed"); }
  };
 
  const getAIFeedback = async (submissionId) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await aiAPI.analyzeSubmission(submissionId);
      setAiResult(res.data.analysis);
      toast.success("AI feedback ready! 🤖");
    } catch { toast.error("AI analysis failed"); }
    finally { setAiLoading(false); }
  };
 
  if (loading) return <Layout title="Activities"><div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading...</div></Layout>;
 
  return (
    <Layout title={user?.role === "teacher" ? "Manage Activities" : "My Activities"}>
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 20 }}>
        {/* Activity List */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="syne" style={{ fontWeight: 700, fontSize: 15 }}>Activities ({activities.length})</span>
          </div>
          {activities.length === 0 && <div style={{ padding: 40, textAlign: "center", color: C.muted }}>No activities found</div>}
          {activities.map(a => {
            const sub = a.mySubmission;
            const status = sub?.status || "pending";
            return (
              <div key={a._id} onClick={() => { setSelected(a); setAiResult(null); }}
                style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}11`, cursor: "pointer", background: selected?._id === a._id ? C.surface : "transparent", transition: "background .15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{a.subject} · Due {new Date(a.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "end", gap: 4 }}>
                    <span style={{ ...{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${STATUS_COLOR[status]}22`, color: STATUS_COLOR[status] } }}>{status}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>+{a.xpReward} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
 
        {/* Activity Detail Panel */}
        {selected && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, position: "sticky", top: 90, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div className="syne" style={{ fontWeight: 700, fontSize: 16 }}>{selected.title}</div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
 
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {[selected.subject, selected.type, `${selected.xpReward} XP`].map(t => (
                <span key={t} style={{ padding: "4px 10px", background: C.surface, borderRadius: 20, fontSize: 12, color: C.subtle }}>{t}</span>
              ))}
            </div>
 
            <div style={{ fontSize: 14, color: C.subtle, lineHeight: 1.6, marginBottom: 20 }}>{selected.description}</div>
 
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>📅 Due: {new Date(selected.dueDate).toLocaleDateString()}</div>
 
            {/* Student submit section */}
            {user?.role === "student" && !selected.mySubmission && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Your Answer</div>
                <textarea value={submitText} onChange={e => setSubmitText(e.target.value)} rows={5}
                  placeholder="Write your answer here..."
                  style={{ width: "100%", padding: "12px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", resize: "vertical", marginBottom: 12 }} />
                <button onClick={() => handleSubmit(selected._id)}
                  style={{ width: "100%", padding: "12px", background: `linear-gradient(135deg,${C.accent},#f97316)`, border: "none", borderRadius: 10, color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne',sans-serif" }}>
                  Submit Activity →
                </button>
              </div>
            )}
 
            {/* Submitted state */}
            {user?.role === "student" && selected.mySubmission && (
              <div>
                <div style={{ padding: 16, background: `${STATUS_COLOR[selected.mySubmission.status]}11`, border: `1px solid ${STATUS_COLOR[selected.mySubmission.status]}33`, borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: STATUS_COLOR[selected.mySubmission.status] }}>
                    {selected.mySubmission.status === "verified" ? "✅ Verified" : selected.mySubmission.status === "rejected" ? "❌ Rejected" : "⏳ Awaiting Review"}
                  </div>
                  {selected.mySubmission.score !== null && (
                    <div style={{ fontSize: 14, marginTop: 4 }}>Score: <strong>{selected.mySubmission.score}/{selected.mySubmission.maxScore}</strong> · +{selected.mySubmission.xpAwarded} XP</div>
                  )}
                  {selected.mySubmission.teacherFeedback && (
                    <div style={{ fontSize: 13, marginTop: 8, color: C.subtle }}>Teacher: "{selected.mySubmission.teacherFeedback}"</div>
                  )}
                </div>
 
                {/* AI Feedback button */}
                {selected.mySubmission.text && (
                  <div>
                    <button onClick={() => getAIFeedback(selected.mySubmission._id)} disabled={aiLoading}
                      style={{ width: "100%", padding: "11px", background: "#8b5cf622", border: "1px solid #8b5cf644", borderRadius: 10, color: "#8b5cf6", fontWeight: 700, cursor: aiLoading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", marginBottom: 12 }}>
                      {aiLoading ? "🤖 Analyzing..." : "🤖 Get AI Feedback"}
                    </button>
 
                    {aiResult && (
                      <div style={{ padding: 16, background: "#8b5cf611", border: "1px solid #8b5cf633", borderRadius: 12 }}>
                        <div className="syne" style={{ fontWeight: 700, color: "#8b5cf6", marginBottom: 12 }}>🤖 AI Analysis</div>
                        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                          <div style={{ textAlign: "center", flex: 1, padding: 12, background: C.card, borderRadius: 10 }}>
                            <div className="syne" style={{ fontSize: 24, fontWeight: 800, color: C.accent }}>{aiResult.overallScore}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>AI Score</div>
                          </div>
                          <div style={{ textAlign: "center", flex: 1, padding: 12, background: C.card, borderRadius: 10 }}>
                            <div className="syne" style={{ fontSize: 24, fontWeight: 800, color: C.green }}>{aiResult.grade}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>Grade</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: C.subtle, lineHeight: 1.6, marginBottom: 10 }}>{aiResult.detailedFeedback}</div>
                        {aiResult.strengths?.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 4 }}>✓ Strengths</div>
                            {aiResult.strengths.map((s, i) => <div key={i} style={{ fontSize: 12, color: C.subtle }}>• {s}</div>)}
                          </div>
                        )}
                        {aiResult.improvements?.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 4 }}>📈 Improve</div>
                            {aiResult.improvements.map((s, i) => <div key={i} style={{ fontSize: 12, color: C.subtle }}>• {s}</div>)}
                          </div>
                        )}
                        <div style={{ fontSize: 13, fontStyle: "italic", color: "#8b5cf6" }}>{aiResult.encouragement}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
 
