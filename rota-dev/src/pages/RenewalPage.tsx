import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

export default function RenewalPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState<"monthly" | "lifetime" | null>(null);
  const [error, setError] = useState("");

  async function handleRenew(plan: "monthly" | "lifetime") {
    if (!user) return;
    setLoading(plan);
    setError("");
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          plan,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Erro ao iniciar pagamento.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{
        background: "#111", border: "1px solid #1e1e1e",
        borderRadius: "20px", padding: "2.5rem",
        maxWidth: "420px", width: "100%", textAlign: "center",
      }}>
        <div style={{ fontSize: "40px", marginBottom: "1rem" }}>🔒</div>

        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
          Sua assinatura expirou
        </h1>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "2rem", lineHeight: 1.6 }}>
          Renove para continuar acessando seu dashboard, plano completo e agente IA.
        </p>

        <div style={{
          background: "#161616", border: "1px solid #2a2a2a",
          borderRadius: "14px", padding: "1.5rem", marginBottom: "1.5rem",
        }}>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>Assinatura mensal</p>
          <p style={{ fontSize: "32px", fontWeight: 700, color: "#fff" }}>
            R$ 12,90<span style={{ fontSize: "14px", color: "#666", fontWeight: 400 }}>/mês</span>
          </p>
          <p style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>Cancele quando quiser</p>
        </div>

        {error && (
          <p style={{ fontSize: "13px", color: "#ef4444", marginBottom: "1rem" }}>{error}</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() => handleRenew("lifetime")}
            disabled={loading !== null}
            style={{
              width: "100%", padding: "14px", background: "#f97316",
              border: "none", borderRadius: "12px", color: "#fff",
              fontSize: "15px", fontWeight: 700,
              cursor: loading !== null ? "not-allowed" : "pointer",
              opacity: loading !== null ? 0.7 : 1, transition: "opacity 0.15s",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            {loading === "lifetime" ? "Aguarde..." : "Vitalício — R$ 47,90 · Lançamento →"}
          </button>
          <button
            onClick={() => handleRenew("monthly")}
            disabled={loading !== null}
            style={{
              width: "100%", padding: "12px", background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#888",
              fontSize: "13px", fontWeight: 500,
              cursor: loading !== null ? "not-allowed" : "pointer",
              opacity: loading !== null ? 0.7 : 1, transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)"; e.currentTarget.style.color = "#ccc"; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#888"; }}
          >
            {loading === "monthly" ? "Aguarde..." : "Mensal — R$ 12,90/mês"}
          </button>
        </div>
      </div>
    </div>
  );
}
