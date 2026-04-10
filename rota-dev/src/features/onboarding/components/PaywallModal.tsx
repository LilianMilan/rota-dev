import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

const BULLETS = [
  "Plano completo de 90 dias",
  "Chat com agente de IA",
  "Progresso salvo na nuvem",
  "Regenere o plano quando quiser",
];

type PaywallModalProps = {
  onContinueFree: () => void;
  blockFree?: boolean;
};

export default function PaywallModal({ onContinueFree, blockFree = false }: PaywallModalProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Erro ao criar sessão de pagamento.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
      backdropFilter: "blur(4px)",
      background: "rgba(0,0,0,0.7)",
    }}>
      <div style={{
        background: "#111", border: "1px solid #2a2a2a",
        borderRadius: "20px", padding: "2rem",
        maxWidth: "420px", width: "100%",
        textAlign: "center",
      }}>
        {/* Badge */}
        <span style={{
          fontSize: "11px", fontWeight: 700, color: "#f97316",
          background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)",
          borderRadius: "6px", padding: "3px 10px", letterSpacing: "0.1em",
        }}>
          ROTA DEV PRO
        </span>

        {/* Emoji + Título */}
        <div style={{ fontSize: "40px", margin: "1rem 0 0.5rem" }}>🦊</div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "10px", lineHeight: 1.3 }}>
          Seu plano de 90 dias<br />tá te esperando!
        </h2>
        <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          Você gerou o início. Agora desbloqueie o plano completo com agente de IA, progresso salvo e recursos reais.
        </p>

        {/* Bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem", textAlign: "left" }}>
          {BULLETS.map(b => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "#f97316", fontWeight: 700, fontSize: "14px" }}>✓</span>
              <span style={{ fontSize: "13px", color: "#ccc" }}>{b}</span>
            </div>
          ))}
        </div>

        {/* Card de preço */}
        <div style={{
          background: "#161616", border: "1px solid #2a2a2a",
          borderRadius: "14px", padding: "1rem", marginBottom: "1rem",
        }}>
          <p style={{ fontSize: "28px", fontWeight: 800, color: "#fff", marginBottom: "2px" }}>
            R$ 12,90<span style={{ fontSize: "14px", fontWeight: 400, color: "#555" }}>/mês</span>
          </p>
          <p style={{ fontSize: "11px", color: "#555" }}>cancele quando quiser</p>
        </div>

        {/* Erro de checkout */}
        {error && (
          <p style={{ fontSize: "12px", color: "#ef4444", marginBottom: "10px" }}>{error}</p>
        )}

        {/* Botão assinar */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            width: "100%", padding: "13px", background: "#f97316",
            border: "none", borderRadius: "12px", color: "#fff",
            fontSize: "14px", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "12px", transition: "opacity 0.15s",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = "1"; }}
        >
          {loading ? "Redirecionando..." : "Assinar agora →"}
        </button>

        {/* Link free */}
        <button
          onClick={blockFree ? undefined : onContinueFree}
          disabled={blockFree}
          style={{
            background: "transparent", border: "none",
            color: blockFree ? "#2a2a2a" : "#444",
            fontSize: "12px",
            cursor: blockFree ? "not-allowed" : "pointer",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => { if (!blockFree) e.currentTarget.style.color = "#888"; }}
          onMouseLeave={e => { if (!blockFree) e.currentTarget.style.color = "#444"; }}
        >
          {blockFree ? "Assine para continuar gerando planos" : "Continuar com o plano free"}
        </button>
      </div>
    </div>
  );
}
