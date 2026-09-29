import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@clerk/clerk-react";
import { useProStatus } from "../../contexts/ProStatusContext";
import { isPromoActive, PROMO_PRICE_LABEL, REGULAR_PRICE_LABEL } from "../../lib/promo";
import { PIX_ENABLED } from "../../lib/pix";

type PixCharge = { payment_id: string; value: number; payload: string; qr_image: string };

function maskCpfCnpj(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function PixModal({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const { refetch } = useProStatus();
  const [name, setName] = useState(user?.fullName ?? "");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);

  // Enquanto o QR está na tela, confere a cada 4s se o Pix caiu.
  useEffect(() => {
    if (!charge || paid || !user) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/pix-status?payment_id=${charge.payment_id}&clerk_id=${user.id}`);
        const data = await res.json() as { paid?: boolean };
        if (data.paid) {
          setPaid(true);
          refetch();
          setTimeout(() => { window.location.href = "/dashboard"; }, 1800);
        }
      } catch { /* tenta de novo no próximo ciclo */ }
    }, 4000);
    return () => clearInterval(id);
  }, [charge, paid, user, refetch]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-pix-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name,
          cpfCnpj,
        }),
      });
      const data = await res.json() as PixCharge & { error?: string };
      if (!res.ok || !data.payload) throw new Error(data.error ?? "Não consegui gerar o Pix.");
      setCharge(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!charge) return;
    try {
      await navigator.clipboard.writeText(charge.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* navegador bloqueou — o código continua visível pra copiar na mão */ }
  }

  const priceLabel = isPromoActive() ? PROMO_PRICE_LABEL : REGULAR_PRICE_LABEL;
  const input: React.CSSProperties = {
    width: "100%", padding: "12px 14px", background: "#161616",
    border: "1px solid #2a2a2a", borderRadius: "10px", color: "#fff", fontSize: "14px",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem", backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.75)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          position: "relative", background: "#111", border: "1px solid rgba(249,115,22,0.35)",
          borderRadius: "20px", padding: "1.75rem", maxWidth: "400px", width: "100%",
          maxHeight: "calc(100vh - 2rem)", overflowY: "auto", textAlign: "center",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{ position: "absolute", top: "12px", right: "12px", background: "transparent", border: "none", color: "#555", fontSize: "18px", cursor: "pointer" }}
        >✕</button>

        <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Pagar com Pix</h2>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "1.25rem" }}>
          Rota Dev Pro vitalício · <b style={{ color: "#f97316" }}>{priceLabel}</b>
        </p>

        {paid ? (
          <div style={{ padding: "1.5rem 0" }}>
            <div style={{ fontSize: "44px", marginBottom: "10px" }}>🎉</div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>Pagamento confirmado!</p>
            <p style={{ fontSize: "13px", color: "#888" }}>Liberando seu acesso Pro…</p>
          </div>
        ) : !charge ? (
          <form onSubmit={generate} style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
            <label style={{ fontSize: "12px", color: "#888" }}>
              Nome completo
              <input value={name} onChange={e => setName(e.target.value)} required style={{ ...input, marginTop: "4px" }} />
            </label>
            <label style={{ fontSize: "12px", color: "#888" }}>
              CPF ou CNPJ
              <input
                value={cpfCnpj}
                onChange={e => setCpfCnpj(maskCpfCnpj(e.target.value))}
                inputMode="numeric"
                placeholder="000.000.000-00"
                required
                style={{ ...input, marginTop: "4px" }}
              />
            </label>
            <p style={{ fontSize: "11px", color: "#555", margin: "2px 0 6px" }}>
              Exigido pelo banco pra gerar o Pix. Usado só nesta cobrança.
            </p>
            {error && <p style={{ fontSize: "12px", color: "#ef4444" }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "13px", background: "#f97316", border: "none", borderRadius: "12px",
                color: "#fff", fontSize: "14px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Gerando Pix..." : "Gerar QR Code Pix"}
            </button>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "#fff", borderRadius: "14px", padding: "12px", width: "220px", margin: "0 auto" }}>
              <img src={`data:image/png;base64,${charge.qr_image}`} alt="QR Code Pix" style={{ width: "100%", display: "block" }} />
            </div>
            <p style={{ fontSize: "12px", color: "#888" }}>Escaneie no app do banco ou copie o código:</p>
            <div style={{
              background: "#161616", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "10px",
              fontSize: "11px", color: "#aaa", wordBreak: "break-all", fontFamily: "monospace", textAlign: "left",
              maxHeight: "72px", overflowY: "auto",
            }}>{charge.payload}</div>
            <button
              onClick={copy}
              style={{ padding: "12px", background: "#f97316", border: "none", borderRadius: "12px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
            >
              {copied ? "Código copiado ✓" : "Copiar código Pix"}
            </button>
            <p style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316", animation: "pixPulse 1.2s ease-in-out infinite" }} />
              Aguardando pagamento. Pode deixar esta tela aberta.
            </p>
            <style>{"@keyframes pixPulse { 0%,100% { opacity: .3 } 50% { opacity: 1 } }"}</style>
          </div>
        )}
      </div>
    </div>
  );
}

/** Botão "Pagar com Pix" + modal. Não renderiza nada se o Pix estiver desligado. */
export default function PixButton({ style }: { style?: React.CSSProperties }) {
  const { isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  if (!PIX_ENABLED || !isSignedIn) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: "100%", padding: "12px 16px", background: "transparent",
          border: "1px solid rgba(249,115,22,0.45)", borderRadius: "12px",
          color: "#fb923c", fontSize: "13px", fontWeight: 700, cursor: "pointer",
          transition: "background 0.15s",
          ...style,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(249,115,22,0.08)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        ⚡ Pagar com Pix · libera na hora
      </button>
      {/* Portal: abre por cima de tudo mesmo quando o botão está dentro de outro modal. */}
      {open && createPortal(<PixModal onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
