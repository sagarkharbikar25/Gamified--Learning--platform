import { useState, useCallback, useRef } from "react";
 
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
 
export const useAITutor = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm EduBot 🤖 your AI learning companion. Ask me anything about your subjects and I'll help you understand!" }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);
 
  const sendMessage = useCallback(async (userMessage, subject = "") => {
    const userMsg = { role: "user", content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
 
    // Add empty assistant message that we'll fill in
    const assistantMsgId = Date.now();
    setMessages(prev => [...prev, { role: "assistant", content: "", id: assistantMsgId, streaming: true }]);
 
    const token = localStorage.getItem("eduquest_token");
    const conversationHistory = messages.filter(m => m.role === "user" || (m.role === "assistant" && m.content))
      .map(m => ({ role: m.role, content: m.content }));
 
    try {
      abortRef.current = new AbortController();
      const response = await fetch(`${API_URL}/ai/tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userMessage, subject, conversationHistory }),
        signal: abortRef.current.signal,
      });
 
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
 
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
 
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
 
        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace("data: ", ""));
            if (data.text) {
              fullText += data.text;
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: fullText } : m
              ));
            }
            if (data.done) {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, streaming: false } : m
              ));
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId ? { ...m, content: "Sorry, I'm having trouble connecting. Please try again! 😅", streaming: false } : m
        ));
      }
    } finally {
      setIsStreaming(false);
    }
  }, [messages]);
 
  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat cleared! What would you like to learn about? 📚" }]);
  };
 
  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };
 
  return { messages, isStreaming, sendMessage, clearChat, stopStreaming };
};
 
