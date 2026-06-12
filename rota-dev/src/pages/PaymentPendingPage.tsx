import { useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import { useProStatus } from "../contexts/ProStatusContext";

export default function PaymentPendingPage() {
  const { refetch } = useProStatus();
  const { signOut } = useClerk();
  const [checking, setChecking] = useState(false);

  async function handleCheck() {
    setChecking(true);
    try {
      await refetch();
    } finally {
      setChecking(false);
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
        maxWidth: "440px", width: "100%", textAlign: "center",
      }}>
        <div style={{ fontSize: "40px", marginBottom: "1rem" }}>🧾</div>

        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
          Boleto gerado!
        </h1>
        <p style={{ fontSize: "14px", color: "#888", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          Recebemos seu pedido. Agora é só pagar o boleto no seu banco ou app.
          O acesso vitalício é liberado <strong style={{ color: "#fb923c" }}>automaticamente</strong> assim
          que o pagamento compensar — normalmente em <strong style={{ color: "#ccc" }}>1 a 3 dias úteis</strong>.
        </p>

        <div style={{
          background: "#161616", border: "1px solid #2a2a2a",
          borderRadius: "14px", padding: "1rem 1.25rem", marginBottom: "1.5rem",
          textAlign: "left",
        }}>
          <p style={{ fontSize: "12px", color: "#666", lineHeight: 1.7 }}>
            💡 O boleto foi enviado para o seu e-mail. Já pagou? Pode levar alguns minutos
            para o banco confirmar. Toque em <strong style={{ color: "#ccc" }}>"Já paguei, verificar"</strong> para
            checar.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={handleCheck}
            disabled={checking}
            style={{
              width: "100%", padding: "14px", background: "#f97316",
              border: "none", borderRadius: "12px", color: "#fff",
              fontSize: "15px", fontWeight: 700,
              cursor: checking ? "not-allowed" : "pointer",
              opacity: checking ? 0.7 : 1, transition: "opacity 0.15s",
            }}
            onMouseEnter={e => { if (!checking) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            {checking ? "Verificando..." : "Já paguei, verificar"}
          </button>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            style={{
              width: "100%", padding: "12px", background: "transparent",
              border: "none", color: "#555",
              fontSize: "13px", cursor: "pointer", transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#888")}
            onMouseLeave={e => (e.currentTarget.style.color = "#555")}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
