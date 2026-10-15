import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { LIFETIME_PRICE_LABEL } from "../lib/pricing";
import PixButton from "../features/pix/PixCheckout";
import { PIX_ENABLED } from "../lib/pix";
import { apiFetch } from "../lib/api";

export default function RenewalPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRenew() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/create-checkout", { method: "POST" });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Erro ao iniciar pagamento.");
        setLoading(false);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
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
          Seu período grátis acabou
        </h1>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "2rem", lineHeight: 1.6 }}>
          Garanta o acesso vitalício para continuar com seu dashboard, plano completo e agente IA.
        </p>

        <div style={{
          background: "#161616", border: "1px solid rgba(249,115,22,0.3)",
          borderRadius: "14px", padding: "1.5rem", marginBottom: "1.5rem",
        }}>
          <p style={{ fontSize: "13px", color: "#f97316", marginBottom: "4px" }}>
            Acesso vitalício · Lançamento
          </p>
          <p style={{ fontSize: "32px", fontWeight: 700, color: "#fff" }}>
            {LIFETIME_PRICE_LABEL}<span style={{ fontSize: "14px", color: "#666", fontWeight: 400 }}> · uma vez</span>
          </p>
          <p style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>Cartão (crédito, débito ou virtual){PIX_ENABLED ? " ou Pix" : ""} · acesso para sempre</p>
        </div>

        {error && (
          <p style={{ fontSize: "13px", color: "#ef4444", marginBottom: "1rem" }}>{error}</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={handleRenew}
            disabled={loading}
            style={{
              width: "100%", padding: "14px", background: "#f97316",
              border: "none", borderRadius: "12px", color: "#fff",
              fontSize: "15px", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            {loading ? "Aguarde..." : "Garantir acesso vitalício →"}
          </button>
          <PixButton />

        </div>
      </div>
    </div>
  );
}
