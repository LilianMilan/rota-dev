import { useNavigate } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";
import foxImg from "../assets/fox.png";

const STEPS = [
  { num: "01", title: "Responda 5 perguntas", desc: "Objetivo, nível, tempo disponível e motivação. Leva menos de 2 minutos." },
  { num: "02", title: "A IA monta sua rota", desc: "Um plano personalizado com dias, tarefas e descrições gerado na hora." },
  { num: "03", title: "Você segue o caminho", desc: "Marca tarefas, acompanha o progresso e tira dúvidas com o agente IA." },
];

const COMPARE = [
  { label: "Plano gerado", free: "7 dias", pro: "Completo" },
  { label: "Regenerar plano", free: "1x", pro: "4x por mês" },
  { label: "Progresso salvo", free: "Navegador", pro: "Nuvem" },
  { label: "Chat com agente IA", free: false, pro: true },
  { label: "Acesso de qualquer device", free: false, pro: true },
  { label: "Histórico de planos", free: false, pro: true },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem 2rem", background: "rgba(15,15,15,0.9)",
        backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={foxImg} alt="RotaDev" style={{ width: "28px", height: "28px", borderRadius: "6px" }} />
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#fff" }}>
            Rota<span style={{ color: "#f97316" }}>Dev</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {isSignedIn ? (
            <>
              <button
                onClick={() => void signOut({ redirectUrl: "/" })}
                style={{ padding: "8px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#888", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#ccc"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#888"; }}
              >
                Sair
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                style={{ padding: "8px 18px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
              >
                Meu dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{ padding: "8px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#888", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#ccc"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#888"; }}
              >
                Entrar
              </button>
              <button
                onClick={() => navigate("/login")}
                style={{ padding: "8px 18px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
              >
                Começar grátis
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "clamp(110px, 14vw, 150px) clamp(1rem, 5vw, 2rem) 80px" }}>
        <div style={{ display: "inline-block", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "100px", padding: "6px 16px", marginBottom: "1.75rem" }}>
          <span style={{ fontSize: "12px", color: "#f97316", fontWeight: 500, letterSpacing: "0.02em" }}>Planner com agente de IA para dev iniciante</span>
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 800, lineHeight: 1.1, maxWidth: "680px", margin: "0 auto 1.25rem" }}>
          Descubra o{" "}
          <span style={{ color: "#f97316" }}>caminho</span>{" "}
          para virar dev.
        </h1>
        <p style={{ fontSize: "17px", color: "#666", maxWidth: "460px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          Responda algumas perguntas e o Rota Dev monta sua rota de estudos personalizada com IA em minutos.
        </p>
        {isSignedIn ? (
          <button
            onClick={() => navigate("/dashboard")}
            style={{ padding: "14px 36px", background: "#f97316", border: "none", borderRadius: "14px", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
          >
            Ir para meu dashboard →
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              style={{ padding: "14px 36px", background: "#f97316", border: "none", borderRadius: "14px", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
              onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
            >
              Gerar meu plano grátis →
            </button>
            <p style={{ fontSize: "12px", color: "#555", marginTop: "12px" }}>Sem cartão. Grátis para começar.</p>
          </>
        )}
      </section>

      {/* Marketing — só pra visitantes */}
      {!isSignedIn && (
        <>
          {/* Divisor */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", maxWidth: "900px", margin: "0 auto" }} />

          {/* Como funciona */}
          <section style={{ padding: "72px 2rem", maxWidth: "900px", margin: "0 auto" }}>
            <p style={{ fontSize: "11px", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "center", marginBottom: "10px" }}>Como funciona</p>
            <h2 style={{ fontSize: "26px", fontWeight: 700, textAlign: "center", marginBottom: "3rem", color: "#fff" }}>
              Do zero ao plano em 2 minutos
            </h2>
            <div className="landing-steps-grid">
              {STEPS.map(s => (
                <div key={s.num} style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "1.75rem" }}>
                  <p style={{ fontSize: "26px", fontWeight: 800, color: "rgba(249,115,22,0.25)", marginBottom: "1rem", lineHeight: 1 }}>{s.num}</p>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#fff" }}>{s.title}</h3>
                  <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Divisor */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", maxWidth: "700px", margin: "0 auto" }} />

          {/* Planos */}
          <section style={{ padding: "72px 2rem", maxWidth: "700px", margin: "0 auto" }}>
            <p style={{ fontSize: "11px", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "center", marginBottom: "10px" }}>Planos</p>
            <h2 style={{ fontSize: "26px", fontWeight: 700, textAlign: "center", marginBottom: "3rem", color: "#fff" }}>
              Simples e sem surpresa
            </h2>
            <div className="landing-pricing-grid">
              {/* Free */}
              <div style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "2rem" }}>
                <p style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Free</p>
                <p style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "4px", lineHeight: 1 }}>R$ 0</p>
                <p style={{ fontSize: "12px", color: "#555", marginBottom: "1.5rem" }}>pra sempre</p>
                <button
                  onClick={() => navigate("/login")}
                  style={{ width: "100%", padding: "11px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#888", fontSize: "13px", cursor: "pointer", marginBottom: "1.5rem", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(249,115,22,0.4)"; e.currentTarget.style.color = "#f97316"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#888"; }}
                >
                  Começar grátis
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {COMPARE.map(c => (
                    <div key={c.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "#666" }}>{c.label}</span>
                      <span style={{ fontSize: "12px", color: c.free === false ? "#333" : "#777" }}>
                        {c.free === false ? "—" : c.free === true ? "✓" : c.free}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro */}
              <div style={{ background: "#1a1a1a", border: "1px solid rgba(249,115,22,0.35)", borderRadius: "14px", padding: "2rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "16px", right: "16px", background: "#f97316", borderRadius: "100px", padding: "3px 10px", fontSize: "10px", fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
                  Popular
                </div>
                <p style={{ fontSize: "11px", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Pro</p>
                <p style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "4px", lineHeight: 1 }}>R$ 12,90</p>
                <p style={{ fontSize: "12px", color: "#555", marginBottom: "1.5rem" }}>por mês · cancele quando quiser</p>
                <button
                  onClick={() => navigate("/login")}
                  style={{ width: "100%", padding: "11px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: "1.5rem", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
                >
                  Assinar Pro
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {COMPARE.map(c => (
                    <div key={c.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "#888" }}>{c.label}</span>
                      <span style={{ fontSize: "12px", color: c.pro === true ? "#f97316" : "#ccc", fontWeight: c.pro === true ? 600 : 400 }}>
                        {c.pro === true ? "✓" : c.pro}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Divisor */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", maxWidth: "600px", margin: "0 auto" }} />

          {/* CTA final */}
          <section style={{ padding: "80px 2rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 700, marginBottom: "12px" }}>Pronto para começar?</h2>
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "2rem" }}>Crie seu plano grátis agora. Sem cartão.</p>
            <button
              onClick={() => navigate("/login")}
              style={{ padding: "14px 36px", background: "#f97316", border: "none", borderRadius: "14px", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
              onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
            >
              Gerar meu plano grátis →
            </button>
          </section>
        </>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#444" }}>
          © {new Date().getFullYear()} Rota Dev ·{" "}
          <a href="https://www.instagram.com/codebylilian" target="_blank" rel="noopener noreferrer" style={{ color: "#f97316", textDecoration: "none" }}>
            @codebylilian
          </a>
        </p>
      </footer>
    </div>
  );
}
