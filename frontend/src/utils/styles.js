export const C = {
  bg: "#0a0e1a",
  surface: "#111827",
  card: "#1a2235",
  border: "#1e2d45",
  accent: "#f59e0b",
  blue: "#3b82f6",
  green: "#10b981",
  purple: "#8b5cf6",
  red: "#ef4444",
  text: "#f1f5f9",
  muted: "#64748b",
  subtle: "#94a3b8",
};
 
export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${C.bg}; color: ${C.text}; min-height: 100vh; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${C.surface}; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  a { color: inherit; text-decoration: none; }
  input, textarea, button { font-family: 'DM Sans', sans-serif; }
  .syne { font-family: 'Syne', sans-serif; }
`;
 
// Shared inline style helpers
export const s = {
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  badge: (color) => ({ display: "inline-flex", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${color}22`, color }),
  btn: (bg = C.accent, color = "#000") => ({ padding: "10px 20px", background: bg, border: "none", borderRadius: 10, color, fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", transition: "opacity .2s" }),
  input: { width: "100%", padding: "11px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none" },
  flexCenter: { display: "flex", alignItems: "center", justifyContent: "center" },
  flex: { display: "flex", alignItems: "center" },
};
 
