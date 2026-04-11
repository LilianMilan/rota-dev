import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

type Message = { role: "user" | "agent"; text: string };

const INITIAL: Message[] = [
  { role: "agent", text: "Oi! Sou o agente do Rota Dev 🔥 Pode me perguntar sobre seu plano, tecnologias ou o que tiver dúvida na trilha." },
];

const SUGGESTIONS = [
  "O que é uma variável?",
  "Diferença entre HTML e CSS",
  "Por onde começo no React?",
  "Quanto tempo leva pra virar dev?",
  "Me explica o Dia 2",
];

// Renderiza markdown básico: blocos de código, inline code, negrito
function MessageContent({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<InlineText key={last} text={text.slice(last, match.index)} />);
    }
    parts.push(
      <pre key={match.index} style={{
        background: "#0d0d0d", border: "1px solid #2a2a2a",
        borderRadius: "8px", padding: "12px 14px",
        margin: "8px 0", overflowX: "auto",
        fontSize: "12px", lineHeight: 1.6,
        color: "#e2e8f0", fontFamily: "monospace",
        whiteSpace: "pre",
      }}>
        {match[1] && (
          <span style={{ display: "block", fontSize: "10px", color: "#555", marginBottom: "6px", textTransform: "uppercase" }}>
            {match[1]}
          </span>
        )}
        <code>{match[2].trim()}</code>
      </pre>
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(<InlineText key={last} text={text.slice(last)} />);
  }

  return <>{parts}</>;
}

function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {renderInline(line)}
        </span>
      ))}
    </>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) result.push(text.slice(last, match.index));
    const val = match[0];
    if (val.startsWith("`")) {
      result.push(
        <code key={match.index} style={{
          background: "#1e1e1e", border: "1px solid #333",
          borderRadius: "4px", padding: "1px 6px",
          fontSize: "12px", color: "#f97316", fontFamily: "monospace",
        }}>
          {val.slice(1, -1)}
        </code>
      );
    } else {
      result.push(<strong key={match.index} style={{ color: "#fff" }}>{val.slice(2, -2)}</strong>);
    }
    last = match.index + val.length;
  }
  if (last < text.length) result.push(text.slice(last));
  return result;
}

export default function AgenteIA() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "U";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || !user) return;
    const userMsg: Message = { role: "user", text: msg };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user.id,
          messages: updatedMessages
            .filter(m => m.role !== "agent" || updatedMessages.indexOf(m) > 0)
            .map(m => ({ role: m.role === "agent" ? "assistant" : "user", content: m.text })),
        }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      setMessages(prev => [...prev, {
        role: "agent",
        text: data.reply ?? "Não consegui responder agora. Tenta de novo.",
      }]);
    } catch {
      setMessages(prev => [...prev, { role: "agent", text: "Erro de conexão. Tenta de novo." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 72px)" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", flexShrink: 0 }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Agente IA</h1>
        <p style={{ fontSize: "13px", color: "#555" }}>Tire dúvidas sobre sua trilha de estudos.</p>
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "20px",
        paddingRight: "4px",
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              gap: "10px",
              alignItems: "flex-start",
            }}
          >
            {/* Avatar */}
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              flexShrink: 0,
              background: msg.role === "agent" ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: msg.role === "agent" ? "15px" : "11px",
              fontWeight: 700,
              color: "#f97316",
            }}>
              {msg.role === "agent" ? "🔥" : initials}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: "72%",
              padding: "12px 16px",
              borderRadius: "12px",
              background: msg.role === "agent" ? "#161616" : "rgba(249,115,22,0.08)",
              border: `1px solid ${msg.role === "agent" ? "rgba(255,255,255,0.07)" : "rgba(249,115,22,0.2)"}`,
              color: msg.role === "agent" ? "#d1d5db" : "#fde8d4",
              fontSize: "13px",
              lineHeight: "1.6",
            }}>
              {msg.role === "agent" ? <MessageContent text={msg.text} /> : msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "flex-start" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
              background: "rgba(249,115,22,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px",
            }}>🔥</div>
            <div style={{
              padding: "12px 16px", borderRadius: "12px",
              background: "#161616", border: "1px solid rgba(255,255,255,0.07)",
              color: "#555", fontSize: "13px",
            }}>
              digitando...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Sugestões */}
      <div style={{ marginBottom: "14px", flexShrink: 0 }}>
        <p style={{
          fontSize: "11px", color: "#3a3a3a", textTransform: "uppercase",
          letterSpacing: "0.1em", fontWeight: 700, marginBottom: "8px",
        }}>Sugestões</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {SUGGESTIONS.map((s) => (
            <SuggestionPill key={s} label={s} onClick={() => sendMessage(s)} disabled={loading} />
          ))}
        </div>
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
          placeholder="Pergunte algo sobre sua trilha..."
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "#161616",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "#ccc",
            fontSize: "13px",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            padding: "12px 20px",
            background: "#f97316",
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.5 : 1,
            transition: "background 0.15s, opacity 0.15s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.background = "#fb923c"; }}
          onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
        >
          Enviar →
        </button>
      </div>
    </div>
  );
}

function SuggestionPill({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "6px 14px",
        background: hovered ? "rgba(249,115,22,0.06)" : "#161616",
        border: `1px solid ${hovered ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "100px",
        color: hovered ? "#f97316" : "#555",
        fontSize: "12px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
