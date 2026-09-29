import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useProStatus } from "../../contexts/ProStatusContext";
import PixButton from "../pix/PixCheckout";
import { PIX_ENABLED } from "../../lib/pix";
import { isPromoActive, PROMO_END, PROMO_END_LABEL, PROMO_PRICE_LABEL, REGULAR_PRICE_LABEL } from "../../lib/promo";

// Aparece 1x por visita: fechou → não volta nessa aba (nem com F5);
// numa nova visita/aba aparece de novo. `?promo-preview` força abrir.
const DISMISS_KEY = "rota-dev-promo-dismissed";

function dismissedThisVisit(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberDismiss() {
  // No preview não conta como "fechou" — senão quem testa o visual para de ver a promo real.
  if (new URLSearchParams(window.location.search).has("promo-preview")) return;
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // storage bloqueado — só não lembra
  }
}

function Countdown({ target }: { target: Date }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const units = [
    { value: Math.floor(diff / 86_400_000), label: "dias" },
    { value: Math.floor(diff / 3_600_000) % 24, label: "horas" },
    { value: Math.floor(diff / 60_000) % 60, label: "min" },
    { value: Math.floor(diff / 1000) % 60, label: "seg" },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "1.5rem" }}>
      {units.map(u => (
        <div key={u.label} style={{
          minWidth: "58px", padding: "8px 4px",
          background: "#161616", border: "1px solid #2a2a2a", borderRadius: "10px",
        }}>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {String(u.value).padStart(2, "0")}
          </p>
          <p style={{ fontSize: "10px", color: "#555", marginTop: "4px" }}>{u.label}</p>
        </div>
      ))}
    </div>
  );
}

type PromoPopupProps = {
  /** landing: abre quando a pessoa rola a página inicial.
   *  dashboard: abre logo ao entrar.
   *  Nos dois, nunca pra quem já é Pro ou tem boleto pendente. */
  variant: "landing" | "dashboard";
};

export default function PromoPopup({ variant }: PromoPopupProps) {
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser();
  const { isPro, loading: statusLoading, paymentPending } = useProStatus();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const preview = new URLSearchParams(window.location.search).has("promo-preview");
  // Deslogado: sempre elegível (o cache de Pro no navegador pode ser de outra conta).
  // Logado: só depois de confirmar o status, e só se não for Pro.
  const audienceOk = preview || (isLoaded && (
    !isSignedIn || (!statusLoading && !isPro && !paymentPending)
  ));
  const eligible = isPromoActive() && (preview || !dismissedThisVisit()) && audienceOk;

  useEffect(() => {
    if (!eligible) return;
    if (preview || variant === "dashboard") {
      const timer = setTimeout(() => setOpen(true), preview ? 300 : 1200);
      return () => clearTimeout(timer);
    }
    function onScroll() {
      const scrolled = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.2) setOpen(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [eligible, variant, preview]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { rememberDismiss(); setOpen(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    rememberDismiss();
    setOpen(false);
  }

  async function handleCta() {
    rememberDismiss();
    if (!user) {
      navigate("/login");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: user.id, email: user.primaryEmailAddress?.emailAddress }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Erro ao criar sessão de pagamento.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
      setLoading(false);
    }
  }

  if (!open || !eligible) return null;

  return (
    <div
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-title"
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(4px)",
        background: "rgba(0,0,0,0.7)",
        animation: "promoFade 0.25s ease-out",
      }}
    >
      <style>{`
        @keyframes promoFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes promoPop { from { opacity: 0; transform: translateY(12px) scale(0.96) } to { opacity: 1; transform: none } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          background: "#111", border: "1px solid rgba(249,115,22,0.35)",
          borderRadius: "20px", padding: "2rem 1.75rem 1.5rem",
          maxWidth: "400px", width: "100%",
          textAlign: "center",
          boxShadow: "0 0 60px rgba(249,115,22,0.15)",
          animation: "promoPop 0.3s ease-out",
        }}
      >
        {/* Fechar */}
        <button
          onClick={close}
          aria-label="Fechar"
          style={{
            position: "absolute", top: "12px", right: "12px",
            width: "30px", height: "30px", borderRadius: "8px",
            background: "transparent", border: "none",
            color: "#555", fontSize: "18px", cursor: "pointer", lineHeight: 1,
            transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ccc")}
          onMouseLeave={e => (e.currentTarget.style.color = "#555")}
        >✕</button>

        {/* Badge */}
        <span style={{
          fontSize: "11px", fontWeight: 700, color: "#f97316",
          background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)",
          borderRadius: "6px", padding: "3px 10px", letterSpacing: "0.1em",
        }}>
          PROMOÇÃO · SÓ ATÉ {PROMO_END_LABEL}
        </span>

        <div style={{ fontSize: "44px", margin: "1rem 0 0.25rem" }}>🦊</div>
        <h2 id="promo-title" style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "6px", lineHeight: 1.3 }}>
          Rota Dev Pro vitalício
        </h2>
        <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.6, marginBottom: "1.25rem" }}>
          Plano completo, agente de IA e progresso na nuvem. Pague uma vez e use pra sempre.
        </p>

        {/* Preço */}
        <div style={{ marginBottom: "1.25rem" }}>
          <p style={{ fontSize: "15px", color: "#555", textDecoration: "line-through", marginBottom: "2px" }}>
            {REGULAR_PRICE_LABEL}
          </p>
          <p style={{ fontSize: "3rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
            {PROMO_PRICE_LABEL}
          </p>
          <p style={{ fontSize: "12px", color: "#f97316", marginTop: "6px", fontWeight: 600 }}>
            uma vez · acesso para sempre
          </p>
        </div>

        {/* Contador */}
        <p style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
          Termina em
        </p>
        <Countdown target={PROMO_END} />

        {/* CTA */}
        <button
          onClick={handleCta}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 16px",
            background: "#f97316", border: "none", borderRadius: "12px",
            color: "#fff", fontSize: "15px", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "background 0.15s",
            marginBottom: "10px",
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#fb923c"; }}
          onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
        >
          {loading ? "Aguarde..." : `Quero por ${PROMO_PRICE_LABEL} →`}
        </button>
        <PixButton style={{ marginBottom: "10px" }} />
        <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>
          Cartão (crédito, débito ou virtual){PIX_ENABLED ? ", Pix" : ""} ou boleto
        </p>

        {error && (
          <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "10px" }}>{error}</p>
        )}

        <button
          onClick={() => {
            close();
            // Na landing leva pro caminho do grátis; no dashboard a pessoa já está nele.
            if (variant === "landing") navigate(user ? "/app" : "/login");
          }}
          style={{
            marginTop: "12px", background: "transparent", border: "none",
            color: "#777", fontSize: "13px", cursor: "pointer", transition: "color 0.15s",
            textDecoration: "underline", textUnderlineOffset: "3px",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ccc")}
          onMouseLeave={e => (e.currentTarget.style.color = "#777")}
        >
          {variant === "landing" ? "Prefiro começar grátis" : "Continuar no plano grátis"}
        </button>
      </div>
    </div>
  );
}
