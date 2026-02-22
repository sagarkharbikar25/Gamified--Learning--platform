import { useState, useRef, useEffect } from "react";
import { useAITutor } from "../../hooks/useAITutor";
import Layout from "../shared/Layout";
import { C } from "../../utils/styles";
 
const SUBJECTS = ["Mathematics", "Science", "English", "History", "Geography", "Computer Science"];
 
const css = `
  .chat-wrap { display:flex; flex-direction:column; height:calc(100vh - 160px); }
  .chat-messages { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px; background:#111827; border:1px solid #1e2d45; border-radius:16px 16px 0 0; }
  .msg { display:flex; gap:12px; }
  .msg.user { flex-direction:row-reverse; }
  .msg-avatar { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .msg-bubble { max-width:70%; padding:14px 18px; border-radius:16px; font-size:14px; line-height:1.6; white-space:pre-wrap; }
  .msg.assistant .msg-bubble { background:#1a2235; border:1px solid #1e2d45; }
  .msg.user .msg-bubble { background:linear-gradient(135deg,#f59e0b,#f97316); color:#000; font-weight:500; }
  .chat-input-area { background:#1a2235; border:1px solid #1e2d45; border-top:none; border-radius:0 0 16px 16px; padding:16px; display:flex; gap:12px; }
  .chat-input { flex:1; padding:12px 16px; background:#111827; border:1px solid #1e2d45; border-radius:10px; color:#f1f5f9; font-size:14px; outline:none; resize:none; }
  .chat-input:focus { border-color:#f59e0b; }
  .send-btn { padding:12px 20px; background:linear-gradient(135deg,#f59e0b,#f97316); border:none; border-radius:10px; color:#000; font-weight:700; cursor:pointer; font-size:20px; }
  .send-btn:disabled { opacity:.5; cursor:not-allowed; }
  .cursor { display:inline-block; width:2px; height:14px; background:#f59e0b; animation:blink 1s infinite; vertical-align:middle; margin-left:2px; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
`;
 
export default function AITutorPage() {
  const { messages, isStreaming, sendMessage, clearChat } = useAITutor();
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("");
  const bottomRef = useRef(null);
 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
 
  const send = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim(), subject);
    setInput("");
  };
 
  return (
    <Layout title="AI Tutor — EduBot">
      <style>{css}</style>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ padding: "8px 16px", background: "#8b5cf622", border: "1px solid #8b5cf644", borderRadius: 10, fontSize: 13, color: "#8b5cf6", fontWeight: 600 }}>
          🤖 Powered by Claude AI
        </div>
        <select value={subject} onChange={e => setSubject(e.target.value)}
          style={{ padding: "8px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none" }}>
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={clearChat} style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, cursor: "pointer", fontSize: 13 }}>
          Clear Chat
        </button>
      </div>
 
      <div className="chat-wrap">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.role}`}>
              <div className="msg-avatar" style={{ background: msg.role === "assistant" ? "linear-gradient(135deg,#8b5cf6,#3b82f6)" : "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                {msg.role === "assistant" ? "🤖" : "👤"}
              </div>
              <div className="msg-bubble">
                {msg.content}
                {msg.streaming && <span className="cursor" />}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
 
        <div className="chat-input-area">
          <textarea className="chat-input" rows={2} placeholder="Ask me anything... e.g. 'Explain quadratic equations' or 'Help me with photosynthesis'"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
          <button className="send-btn" onClick={send} disabled={!input.trim() || isStreaming}>
            {isStreaming ? "⏳" : "➤"}
          </button>
        </div>
      </div>
 
      <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Explain Pythagoras theorem", "Help me with essay writing", "What causes photosynthesis?", "Solve: 2x² + 5x - 3 = 0", "Explain World War II causes"].map(q => (
          <button key={q} onClick={() => { setInput(q); }} style={{ padding: "7px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, color: C.subtle, cursor: "pointer", fontSize: 12 }}>
            {q}
          </button>
        ))}
      </div>
    </Layout>
  );
}
 
