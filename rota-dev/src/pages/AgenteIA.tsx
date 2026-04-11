import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

type Message = { role: "user" | "agent"; text: string };

const INITIAL: Message[] = [
  { role: "agent", text: "Oi! Sou o agente do Rota Dev 🦊 Pode me perguntar sobre seu plano, tecnologias ou o que tiver dúvida na trilha." },
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
  // Processa inline code e negrito linha por linha
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !user) return;
    const userMsg: Message = { role: "user", text: input.trim() };
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
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 5rem)" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Agente IA</h1>
        <p style={{ fontSize: "13px", color: "#555" }}>Tire dúvidas sobre sua trilha de estudos.</p>
      </div>

      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px",
        padding: "1.25rem", background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px",
        marginBottom: "12px",
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "agent" && (
              <span style={{ fontSize: "20px", marginRight: "8px", alignSelf: "flex-start", marginTop: "10px" }}>🦊</span>
            )}
            <div style={{
              maxWidth: "72%",
              padding: "10px 14px",
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user" ? "#f97316" : "#1a1a1a",
              border: msg.role === "user" ? "none" : "1px solid #2a2a2a",
              color: msg.role === "user" ? "#fff" : "#ccc",
              fontSize: "13px", lineHeight: "1.6",
            }}>
              {msg.role === "agent" ? <MessageContent text={msg.text} /> : msg.text}
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
