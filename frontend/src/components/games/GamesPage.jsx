import { useState } from "react";
import Layout from "../shared/Layout";
import { aiAPI, gameAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { C } from "../../utils/styles";
 
const GAMES = [
  { id: "brain_quiz", icon: "🧠", title: "Brain Quiz", desc: "AI-powered questions on any topic", xp: 100, color: C.purple },
  { id: "speed_math", icon: "⚡", title: "Speed Math", desc: "Solve math problems against the clock", xp: 60, color: C.blue },
  { id: "word_hunt", icon: "🔤", title: "Word Hunt", desc: "Find and spell hidden vocabulary", xp: 50, color: C.green },
  { id: "history_trail", icon: "🗺️", title: "History Trail", desc: "Timeline challenge — order events", xp: 80, color: C.accent },
];
 
function QuizGame({ questions, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);
 
  const q = questions[current];
 
  const pick = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correctIndex) setScore(s => s + (q.points || 10));
  };
 
  const next = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
      onFinish(score + (selected === q.correctIndex ? q.points || 10 : 0), questions.length * 10);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };
 
  if (done) return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 60 }}>🎉</div>
      <div className="syne" style={{ fontSize: 28, fontWeight: 800, marginTop: 16 }}>Quiz Complete!</div>
      <div style={{ fontSize: 18, color: C.accent, fontWeight: 700, marginTop: 8 }}>Score: {score} / {questions.length * 10}</div>
    </div>
  );
 
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: C.muted }}>Question {current + 1} of {questions.length}</span>
        <span className="syne" style={{ fontWeight: 700, color: C.accent }}>Score: {score}</span>
      </div>
      <div style={{ height: 4, background: C.surface, borderRadius: 2, marginBottom: 24 }}>
        <div style={{ height: "100%", width: `${((current) / questions.length) * 100}%`, background: `linear-gradient(90deg,${C.purple},${C.blue})`, borderRadius: 2 }} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, lineHeight: 1.5 }}>{q.question}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          let bg = C.surface; let border = C.border; let color = C.text;
          if (answered) {
            if (i === q.correctIndex) { bg = "#10b98122"; border = C.green; color = C.green; }
            else if (i === selected) { bg = "#ef444422"; border = C.red; color = C.red; }
          } else if (selected === i) { bg = C.accentSoft; border = C.accent; }
          return (
            <div key={i} onClick={() => pick(i)}
              style={{ padding: "14px 16px", borderRadius: 12, background: bg, border: `1px solid ${border}`, color, cursor: answered ? "default" : "pointer", fontSize: 14, transition: "all .15s" }}>
              <strong>{["A", "B", "C", "D"][i]}.</strong> {opt}
            </div>
          );
        })}
      </div>
      {answered && (
        <div>
          <div style={{ padding: 12, background: `${C.blue}11`, borderRadius: 10, fontSize: 13, color: C.subtle, marginBottom: 12 }}>
            💡 {q.explanation}
          </div>
          <button onClick={next} style={{ width: "100%", padding: "12px", background: `linear-gradient(135deg,${C.purple},${C.blue})`, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne',sans-serif" }}>
            {current + 1 >= questions.length ? "Finish Quiz 🎉" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}
 
export default function GamesPage() {
  const { user, updateUser } = useAuth();
  const [activeGame, setActiveGame] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [gameLoading, setGameLoading] = useState(false);
  const [subject, setSubject] = useState("Mathematics");
  const [gameResult, setGameResult] = useState(null);
 
  const startGame = async (game) => {
    if (game.id !== "brain_quiz") { toast("Coming soon! 🚀"); return; }
    setGameLoading(true);
    setGameResult(null);
    try {
      const res = await aiAPI.generateQuizQuestions({ subject, difficulty: "medium", count: 5 });
      setQuestions(res.data.questions || []);
      setActiveGame(game);
    } catch { toast.error("Failed to load game"); }
    finally { setGameLoading(false); }
  };
 
  const finishGame = async (score, maxScore) => {
    try {
      const res = await gameAPI.saveSession({ gameType: activeGame.id, score, maxScore, subject, aiQuestionsUsed: true, questionsAnswered: questions.length, correctAnswers: Math.round(score / 10) });
      setGameResult(res.data);
      updateUser({ ...user, xp: res.data.newXp, level: res.data.newLevel });
      toast.success(`+${res.data.xpEarned} XP earned! 🎉`);
    } catch {}
  };
 
  const xpToNext = [500, 1200, 2200, 3500, 5000, 7000, 9500, 12500][user?.level - 1] || 2200;
  const xpProgress = Math.min(((user?.xp || 0) / xpToNext) * 100, 100);
 
  return (
    <Layout title="Games & Rewards">
      {/* XP Card */}
      <div style={{ background: "linear-gradient(135deg,#1a0a2e,#0d1b3e)", border: `1px solid #8b5cf644`, borderRadius: 20, padding: 28, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px" }}>Current Level</div>
            <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: "#8b5cf6" }}>Level {user?.level} ✦</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: C.muted }}>XP to next level</div>
            <div className="syne" style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>{(xpToNext - (user?.xp || 0)).toLocaleString()} XP</div>
          </div>
        </div>
        <div style={{ height: 8, background: "#ffffff15", borderRadius: 4, marginBottom: 20 }}>
          <div style={{ height: "100%", width: `${xpProgress}%`, background: `linear-gradient(90deg,#8b5cf6,#3b82f6)`, borderRadius: 4, transition: "width .5s" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[["🏆", "Trophies", "4"], ["💎", "Gems", user?.gems], ["🔥", "Streak", `${user?.streak || 0}d`], ["⚡", "Multiplier", "x1"]].map(([ic, l, v]) => (
            <div key={l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 24 }}>{ic}</div>
              <div className="syne" style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>{v}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Game Area */}
      {activeGame ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div className="syne" style={{ fontWeight: 800, fontSize: 18 }}>{activeGame.icon} {activeGame.title}</div>
            <button onClick={() => { setActiveGame(null); setGameResult(null); }} style={{ padding: "8px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, cursor: "pointer", fontSize: 13 }}>
              ✕ Exit Game
            </button>
          </div>
          {gameResult ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
              <div className="syne" style={{ fontSize: 24, fontWeight: 800 }}>Game Complete!</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20 }}>
                <div style={{ padding: "16px 32px", background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 16, textAlign: "center" }}>
                  <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: C.accent }}>+{gameResult.xpEarned}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>XP Earned</div>
                </div>
                <div style={{ padding: "16px 32px", background: `${C.blue}22`, border: `1px solid ${C.blue}44`, borderRadius: 16, textAlign: "center" }}>
                  <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: C.blue }}>+{gameResult.gemsEarned}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>Gems Earned</div>
                </div>
              </div>
              <button onClick={() => { setActiveGame(null); setGameResult(null); }} style={{ marginTop: 24, padding: "12px 32px", background: `linear-gradient(135deg,${C.purple},${C.blue})`, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne',sans-serif" }}>
                Play Again →
              </button>
            </div>
          ) : (
            <QuizGame questions={questions} onFinish={finishGame} />
          )}
        </div>
      ) : (
        <>
          <div className="syne" style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>🎮 Mini Games</div>
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ fontSize: 13, color: C.muted }}>Subject for AI Quiz:</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              style={{ padding: "8px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none" }}>
              {["Mathematics", "Science", "English", "History", "Geography"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
            {GAMES.map(g => (
              <div key={g.id} onClick={() => !gameLoading && startGame(g)}
                style={{ background: C.card, border: `1px solid ${g.color}33`, borderRadius: 16, padding: 24, textAlign: "center", cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = g.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = `${g.color}33`}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{g.icon}</div>
                <div className="syne" style={{ fontWeight: 700, fontSize: 15 }}>{g.title}</div>
                <div style={{ fontSize: 12, color: C.muted, margin: "6px 0 10px" }}>{g.desc}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: g.color }}>+{g.xp} XP</div>
                {g.id === "brain_quiz" && <div style={{ fontSize: 10, color: "#8b5cf6", marginTop: 4 }}>🤖 AI Questions</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
 
