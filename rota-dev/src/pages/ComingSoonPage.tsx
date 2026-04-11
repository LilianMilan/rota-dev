import { useState } from "react";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // Aqui você pode integrar com uma API de email marketing
    setSent(true);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0c0c",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Anéis decorativos */}
      {[400, 700, 1000].map((size) => (
        <div key={size} style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          border: "0.5px solid rgba(249,115,22,0.06)",
          pointerEvents: "none",
        }} />
      ))}

      {/* Conteúdo */}
      <div style={{
        position: "relative",
        zIndex: 1,
        maxWidth: "480px",
        width: "100%",
        padding: "0 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "0",
      }}>
        {/* Ícone */}
        <span style={{ fontSize: "32px", marginBottom: "20px" }}>🦊</span>

        {/* Logo */}
        <p style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "20px" }}>
          Rota<span style={{ color: "#f97316" }}>Dev</span>
        </p>

        {/* Badge */}
        <span style={{
          display: "inline-block",
          padding: "4px 14px",
          background: "rgba(249,115,22,0.12)",
          border: "1px solid rgba(249,115,22,0.25)",
          borderRadius: "100px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#f97316",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "28px",
        }}>
          Em construção
        </span>

        {/* Título */}
        <h1 style={{
          fontSize: "clamp(28px, 6vw, 36px)",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          marginBottom: "16px",
        }}>
          Estamos preparando algo incrível.
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontSize: "14px",
          color: "#555",
          lineHeight: 1.7,
          marginBottom: "32px",
          maxWidth: "400px",
        }}>
          O Rota Dev está quase pronto. Em breve você poderá criar sua rota de estudos personalizada com IA.
        </p>

        {/* Divisor */}
        <div style={{
          width: "100%",
          height: "1px",
          background: "rgba(255,255,255,0.06)",
          marginBottom: "32px",
        }} />

        {/* Formulário */}
        {!sent ? (
          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Seu melhor email"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#161616",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#ccc",
                fontSize: "13px",
                outline: "none",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#f97316",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
              onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
            >
              Me avisa quando abrir →
            </button>
          </form>
        ) : (
          <div style={{
            width: "100%",
            padding: "16px",
            background: "rgba(249,115,22,0.08)",
            border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: "10px",
            fontSize: "13px",
            color: "#fb923c",
            fontWeight: 500,
          }}>
            Anotado! 🦊 Você será o primeiro a saber.
          </div>
        )}

        {/* Aviso spam */}
        <p style={{ fontSize: "11px", color: "#2e2e2e", marginTop: "14px" }}>
          Sem spam. Você será o primeiro a saber.
        </p>
      </div>
    </div>
  );
}
