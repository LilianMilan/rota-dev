import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

type Message = { role: "user" | "agent"; text: string };

const INITIAL: Message[] = [
  { role: "agent", text: "Oi! Sou o agente do Rota Dev 🦊 Pode me perguntar sobre seu plano, tecnologias ou o que tiver dúvida na trilha." },
];

export default function AgenteIA() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Placeholder — futuramente chama a API real
    await new Promise(r => setTimeout(r, 1200));
    setMessages(prev => [...prev, {
      role: "agent",
      text: "Ótima pergunta! Em breve o agente estará totalmente conectado com sua trilha. Por enquanto estou em modo demonstração. 🚀",
    }]);
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 5rem)" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Agente IA</h1>
        <p style={{ fontSize: "13px", color: "#555" }}>Tire dúvidas sobre sua trilha de estudos.</p>
      </div>

      {/* Chat */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px",
        padding: "1.25rem", background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px",
        marginBottom: "12px",
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "agent" && (
              <span style={{ fontSize: "20px", marginRight: "8px", alignSelf: "flex-end" }}>🦊</span>
            )}
            <div style={{
              maxWidth: "70%",
              padding: "10px 14px",
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user" ? "#f97316" : "#1a1a1a",
              border: msg.role === "user" ? "none" : "1px solid #2a2a2a",
              color: msg.role === "user" ? "#fff" : "#ccc",
              fontSize: "13px",
              lineHeight: "1.5",
            }}>
              {msg.text}
            </div>
            {msg.role === "user" && user?.imageUrl && (
              <img src={user.imageUrl} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", marginLeft: "8px", alignSelf: "flex-end", objectFit: "cover" }} />
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🦊</span>
            <div style={{ padding: "10px 14px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "14px 14px 14px 4px" }}>
              <span style={{ color: "#555", fontSize: "13px" }}>digitando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
          placeholder="Pergunte algo sobre sua trilha..."
          style={{
            flex: 1, padding: "12px 14px", background: "#1a1a1a",
            border: "1px solid #2a2a2a", borderRadius: "12px",
            color: "#ccc", fontSize: "13px", outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: "12px 20px", background: "#f97316", border: "none",
            borderRadius: "12px", color: "#fff", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", opacity: loading || !input.trim() ? 0.5 : 1,
            transition: "opacity 0.15s",
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
