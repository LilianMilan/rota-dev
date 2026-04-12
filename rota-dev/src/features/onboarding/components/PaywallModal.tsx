import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

const BULLETS = [
  "Plano completo personalizado",
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
  const [loading, setLoading] = useState<"monthly" | "lifetime" | null>(null);
  const [error, setError] = useState("");

  async function handleCheckout(plan: "monthly" | "lifetime") {
    setError("");
    setLoading(plan);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
          plan,
        }),
      });

      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Erro ao criar sessão de pagamento.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
      setLoading(null);
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
        maxWidth: "440px", width: "100%",
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

        <div style={{ fontSize: "40px", margin: "1rem 0 0.5rem" }}>🦊</div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "10px", lineHeight: 1.3 }}>
          Seu plano completo<br />tá te esperando!
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

        {/* Opções de plano */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
          {/* Mensal */}
          <button
            onClick={() => handleCheckout("monthly")}
            disabled={loading !== null}
            style={{
              width: "100%", padding: "13px 16px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px", color: "#ccc",
              fontSize: "13px", fontWeight: 500,
              cursor: loading !== null ? "not-allowed" : "pointer",
              opacity: loading !== null ? 0.6 : 1,
              transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)"; e.currentTarget.style.color = "#fff"; } }}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#ccc"; } }}
          >
            <span>Mensal · cancele quando quiser</span>
            <span style={{ fontWeight: 700, color: "#fff" }}>
              {loading === "monthly" ? "..." : "R$ 12,90/mês"}
            </span>
          </button>

          {/* Vitalício */}
          <button
            onClick={() => handleCheckout("lifetime")}
            disabled={loading !== null}
            style={{
              width: "100%", padding: "13px 16px",
              background: "#f97316",
              border: "none",
              borderRadius: "12px", color: "#fff",
              fontSize: "13px", fontWeight: 700,
              cursor: loading !== null ? "not-allowed" : "pointer",
              opacity: loading !== null ? 0.7 : 1,
              transition: "opacity 0.15s",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = "1"; }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "10px", fontWeight: 700, background: "rgba(0,0,0,0.2)",
                borderRadius: "4px", padding: "2px 6px", letterSpacing: "0.05em",
              }}>LANÇAMENTO</span>
              Vitalício · pague uma vez
            </span>
            <span>{loading === "lifetime" ? "..." : "R$ 47,90"}</span>
          </button>
        </div>

        {error && (
          <p style={{ fontSize: "12px", color: "#ef4444", marginBottom: "10px" }}>{error}</p>
        )}

        {/* Link free */}
        <button
          onClick={blockFree ? undefined : onContinueFree}
          disabled={blockFree || loading !== null}
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
