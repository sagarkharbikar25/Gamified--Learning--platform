import { useState } from "react";
import Layout from "../shared/Layout";
import { aiAPI, activityAPI } from "../../services/api";
import toast from "react-hot-toast";
import { C } from "../../utils/styles";
 
export default function AIGeneratePage() {
  const [form, setForm] = useState({ subject: "Mathematics", topic: "", type: "quiz", difficulty: "medium", gradeLevel: "10", numberOfQuestions: 10 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
 
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
 
  const generate = async () => {
    if (!form.topic) return toast.error("Please enter a topic");
    setLoading(true);
    setResult(null);
    try {
      const res = await aiAPI.generateActivity(form);
      setResult(res.data.activity);
      toast.success("Activity generated! ✨");
    } catch { toast.error("Generation failed. Check your API key."); }
    finally { setLoading(false); }
  };
 
  const saveActivity = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const due = new Date(); due.setDate(due.getDate() + 7);
      await activityAPI.create({
        title: result.title, description: result.description + "\n\n" + result.instructions,
        subject: form.subject, type: form.type, dueDate: due,
        maxScore: 100, xpReward: result.xpReward || 60,
        assignedClasses: ["10A"], isAIGenerated: true, aiPrompt: form.topic,
      });
      toast.success("Activity saved and assigned! 🎉");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };
 
  return (
    <Layout title="AI Activity Generator">
      <div style={{ maxWidth: 900 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "14px 20px", background: "#8b5cf622", border: "1px solid #8b5cf644", borderRadius: 12 }}>
          <span style={{ fontSize: 24 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 700, color: "#8b5cf6" }}>AI-Powered Activity Generator</div>
            <div style={{ fontSize: 13, color: C.muted }}>Describe what you need and Claude AI will create a complete, ready-to-assign activity</div>
          </div>
        </div>
 
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {[
            { label: "Subject", key: "subject", type: "select", opts: ["Mathematics", "Science", "English", "History", "Geography", "Computer Science"] },
            { label: "Activity Type", key: "type", type: "select", opts: ["quiz", "assignment", "essay", "project", "experiment"] },
            { label: "Difficulty", key: "difficulty", type: "select", opts: ["easy", "medium", "hard"] },
            { label: "Grade Level", key: "gradeLevel", type: "select", opts: ["6", "7", "8", "9", "10", "11", "12"] },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".8px", display: "block", marginBottom: 6 }}>{f.label}</label>
              <select value={form[f.key]} onChange={set(f.key)}
                style={{ width: "100%", padding: "11px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none" }}>
                {f.opts.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </div>
          ))}
        </div>
 
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".8px", display: "block", marginBottom: 6 }}>Topic / Description</label>
          <textarea value={form.topic} onChange={set("topic")} rows={3}
            placeholder="e.g. 'Quadratic equations and their real-world applications' or 'Photosynthesis and the carbon cycle'"
            style={{ width: "100%", padding: "12px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", resize: "vertical" }} />
        </div>
 
        {form.type === "quiz" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".8px", display: "block", marginBottom: 6 }}>Number of Questions</label>
            <input type="number" min={3} max={20} value={form.numberOfQuestions} onChange={set("numberOfQuestions")}
              style={{ width: 120, padding: "11px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none" }} />
          </div>
        )}
 
        <button onClick={generate} disabled={loading}
          style={{ padding: "13px 28px", background: `linear-gradient(135deg,#8b5cf6,#3b82f6)`, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Syne',sans-serif", opacity: loading ? .7 : 1 }}>
          {loading ? "🤖 Generating with AI..." : "✨ Generate Activity"}
        </button>
 
        {result && (
          <div style={{ marginTop: 28, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
              <div>
                <div className="syne" style={{ fontSize: 20, fontWeight: 800 }}>{result.title}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>⏱ {result.estimatedDuration} · 🏆 {result.xpReward} XP</div>
              </div>
              <button onClick={saveActivity} disabled={saving}
                style={{ padding: "10px 20px", background: C.green, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                {saving ? "Saving..." : "💾 Save & Assign"}
              </button>
            </div>
 
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Description</div>
              <div style={{ fontSize: 14, color: C.subtle, lineHeight: 1.6 }}>{result.description}</div>
            </div>
 
            {result.instructions && (
              <div style={{ marginBottom: 16, padding: 16, background: C.surface, borderRadius: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>📋 Instructions</div>
                <div style={{ fontSize: 14, color: C.subtle, lineHeight: 1.6 }}>{result.instructions}</div>
              </div>
            )}
 
            {result.questions && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>❓ Questions ({result.questions.length})</div>
                {result.questions.map((q, i) => (
                  <div key={i} style={{ marginBottom: 16, padding: 16, background: C.surface, borderRadius: 10 }}>
                    <div style={{ fontWeight: 600, marginBottom: 10 }}>Q{i + 1}. {q.question}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {q.options?.map((opt, j) => (
                        <div key={j} style={{ padding: "8px 12px", borderRadius: 8, background: j === q.correctIndex ? "#10b98122" : C.card, border: `1px solid ${j === q.correctIndex ? C.green : C.border}`, fontSize: 13, color: j === q.correctIndex ? C.green : C.subtle }}>
                          {["A", "B", "C", "D"][j]}. {opt} {j === q.correctIndex && "✓"}
                        </div>
                      ))}
                    </div>
                    {q.explanation && <div style={{ marginTop: 8, fontSize: 12, color: C.muted, fontStyle: "italic" }}>💡 {q.explanation}</div>}
                  </div>
                ))}
              </div>
            )}
 
            {result.learningObjectives && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>🎯 Learning Objectives</div>
                {result.learningObjectives.map((o, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.subtle, marginBottom: 4 }}>• {o}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
 
