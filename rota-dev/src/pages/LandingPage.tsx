import { useNavigate } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";
import foxImg from "../assets/fox.png";

const TASKS = [
  { text: "Estrutura básica de um documento HTML", tech: "HTML", techColor: "#ef4444", techBg: "rgba(239,68,68,0.1)", done: true },
  { text: "Seletores CSS e box model na prática", tech: "CSS", techColor: "#60a5fa", techBg: "rgba(96,165,250,0.1)", done: true },
  { text: "Variáveis, funções e condicionais em JS", tech: "JS", techColor: "#eab308", techBg: "rgba(234,179,8,0.1)", done: false },
  { text: "Componentes e props no React", tech: "React", techColor: "#22d3ee", techBg: "rgba(34,211,238,0.1)", done: false },
];

const COMPARE = [
  { label: "Plano gerado", free: "7 dias", pro: "Completo" },
  { label: "Regenerar plano", free: "1x", pro: "4x por mês" },
  { label: "Progresso salvo", free: "Navegador", pro: "Nuvem" },
  { label: "Chat com agente IA", free: false, pro: true },
  { label: "Acesso de qualquer device", free: false, pro: true },
  { label: "Histórico de planos", free: false, pro: true },
];

const STATS = [
  { value: "2min", label: "Para gerar seu plano" },
  { value: "100%", label: "Personalizado pra você" },
  { value: "R$0", label: "Para começar agora" },
  { value: "IA+", label: "Agente disponível 24h" },
];

const STEPS = [
  {
    num: "01",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
    title: "Responda 5 perguntas",
    desc: "Objetivo, nível, tempo disponível e motivação. Leva menos de 2 minutos.",
  },
  {
    num: "02",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: "A IA monta sua rota",
    desc: "Um plano personalizado com dias, tarefas e descrições gerado na hora.",
  },
  {
    num: "03",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Você segue o caminho",
    desc: "Marca tarefas, acompanha o progresso e tira dúvidas com o agente IA.",
  },
];

function PlanCard() {
  return (
    <div style={{ position: "relative", maxWidth: "400px", width: "100%" }}>
      {/* Badge flutuante */}
      <div style={{
        position: "absolute", top: "-16px", left: "50%", transform: "translateX(-50%)",
        background: "#1a1a1a", border: "1px solid rgba(249,115,22,0.35)",
        borderRadius: "10px", padding: "5px 14px", whiteSpace: "nowrap",
        display: "flex", alignItems: "center", gap: "6px", zIndex: 2,
      }}>
        <span style={{ fontSize: "12px" }}>✦</span>
        <span style={{ fontSize: "11px", color: "#f97316", fontWeight: 600 }}>Rota gerada!</span>
        <span style={{ fontSize: "11px", color: "#555" }}>— Pronta em 2 minutos</span>
      </div>

      {/* Card */}
      <div style={{
        background: "#161616", border: "0.5px solid rgba(255,255,255,0.1)",
        borderRadius: "16px", overflow: "hidden", marginTop: "14px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Barra macOS */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#111",
        }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
          </div>
          <span style={{ fontSize: "11px", color: "#444", fontFamily: "monospace" }}>minha-rota.dev</span>
        </div>

        {/* Conteúdo */}
        <div style={{ padding: "18px 18px 0" }}>
          <p style={{ fontSize: "10px", color: "#f97316", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
            Semana 1 — Fundamentos
          </p>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>
            HTML, CSS e lógica básica
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {TASKS.map((t, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "9px",
                background: "#1f1f1f", borderRadius: "8px", padding: "8px 10px",
              }}>
                <div style={{
                  width: "15px", height: "15px", borderRadius: "4px", flexShrink: 0,
                  border: t.done ? "none" : "1.5px solid #374151",
                  background: t.done ? "#f97316" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {t.done && <span style={{ color: "#fff", fontSize: "9px", fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: "11px", color: t.done ? "#555" : "#d1d5db", flex: 1, textDecoration: t.done ? "line-through" : "none" }}>
                  {t.text}
                </span>
                <span style={{ fontSize: "10px", fontWeight: 600, color: t.techColor, background: t.techBg, borderRadius: "4px", padding: "2px 7px", flexShrink: 0 }}>
                  {t.tech}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div style={{ padding: "14px 18px 18px" }}>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
            <span style={{ fontSize: "11px", color: "#555" }}>Progresso da semana</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#f97316" }}>50%</span>
          </div>
          <div style={{ height: "4px", background: "#1f1f1f", borderRadius: "2px" }}>
            <div style={{ height: "4px", width: "50%", background: "#f97316", borderRadius: "2px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();

  return (
    <div style={{ background: "#0c0c0c", minHeight: "100vh", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem 2rem", background: "rgba(12,12,12,0.9)",
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
              >Sair</button>
              <button
                onClick={() => navigate("/dashboard")}
                style={{ padding: "8px 18px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
              >Meu dashboard</button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{ padding: "8px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#888", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#ccc"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#888"; }}
              >Entrar</button>
              <button
                onClick={() => navigate("/login")}
                style={{ padding: "8px 18px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
              >Começar grátis</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "clamp(100px, 12vw, 140px) 2rem 40px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "3rem", flexWrap: "wrap", justifyContent: "center" }}>
          {/* Texto */}
          <div style={{ flex: "1 1 320px", maxWidth: "480px" }}>
            <div style={{ display: "inline-block", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "100px", padding: "5px 14px", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "11px", color: "#f97316", fontWeight: 500, letterSpacing: "0.03em" }}>Planner com agente de IA para dev iniciante</span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.1rem" }}>
              Descubra o{" "}
              <span style={{ color: "#f97316" }}>caminho</span>{" "}
              para virar dev.
            </h1>
            <p style={{ fontSize: "15px", color: "#666", marginBottom: "2rem", lineHeight: 1.7 }}>
              Responda algumas perguntas e o Rota Dev monta sua rota de estudos personalizada com IA em minutos.
            </p>
            {isSignedIn ? (
              <button
                onClick={() => navigate("/dashboard")}
                style={{ padding: "13px 32px", background: "#f97316", border: "none", borderRadius: "12px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
              >
                Ir para meu dashboard →
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate("/login")}
                  style={{ padding: "13px 32px", background: "#f97316", border: "none", borderRadius: "12px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
                >
                  Gerar meu plano grátis →
                </button>
                <a
                  href="#como-funciona"
                  style={{ fontSize: "13px", color: "#555", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#888")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#555")}
                >
                  Ver como funciona ↓
                </a>
              </div>
            )}
            {!isSignedIn && <p style={{ fontSize: "11px", color: "#444", marginTop: "12px" }}>Sem cartão. Grátis para começar.</p>}
          </div>

          {/* Card preview */}
          <div style={{ flex: "1 1 340px", display: "flex", justifyContent: "center" }}>
            <PlanCard />
          </div>
        </div>
      </section>

      {/* Seções de marketing — só visitantes */}
      {!isSignedIn && (
        <>
          {/* Stats bar */}
          <section style={{ padding: "32px 2rem", maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {STATS.map(s => (
                <div key={s.value} style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
                  <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f97316", marginBottom: "4px" }}>{s.value}</p>
                  <p style={{ fontSize: "11px", color: "#555" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", maxWidth: "1100px", margin: "0 auto" }} />

          {/* Como funciona */}
          <section id="como-funciona" style={{ padding: "72px 2rem", maxWidth: "1100px", margin: "0 auto" }}>
            <p style={{ fontSize: "11px", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "center", marginBottom: "8px" }}>Como funciona</p>
            <h2 style={{ fontSize: "26px", fontWeight: 700, textAlign: "center", marginBottom: "3rem" }}>Do zero ao plano em 2 minutos</h2>
            <div className="landing-steps-grid">
              {STEPS.map(s => (
                <div
                  key={s.num}
                  style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "1.75rem", position: "relative", overflow: "hidden", transition: "border-color 0.2s", cursor: "default" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
                >
                  <p style={{ position: "absolute", top: "-10px", right: "16px", fontSize: "80px", fontWeight: 900, color: "rgba(249,115,22,0.04)", lineHeight: 1, userSelect: "none" }}>{s.num}</p>
                  <div style={{ width: "36px", height: "36px", background: "rgba(249,115,22,0.08)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                    {s.icon}
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>{s.title}</h3>
                  <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", maxWidth: "700px", margin: "0 auto" }} />

          {/* Planos */}
          <section style={{ padding: "72px 2rem", maxWidth: "700px", margin: "0 auto" }}>
            <p style={{ fontSize: "11px", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "center", marginBottom: "8px" }}>Planos</p>
            <h2 style={{ fontSize: "26px", fontWeight: 700, textAlign: "center", marginBottom: "3rem" }}>Simples e sem surpresa</h2>
            <div className="landing-pricing-grid">
              {/* Free */}
              <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "2rem" }}>
                <p style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Free</p>
                <p style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>R$ 0</p>
                <p style={{ fontSize: "12px", color: "#555", marginBottom: "1.5rem" }}>pra sempre</p>
                <button
                  onClick={() => navigate("/login")}
                  style={{ width: "100%", padding: "11px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#888", fontSize: "13px", cursor: "pointer", marginBottom: "1.5rem", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(249,115,22,0.4)"; e.currentTarget.style.color = "#f97316"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#888"; }}
                >Começar grátis</button>
                <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                  {COMPARE.map(c => (
                    <div key={c.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "#666" }}>{c.label}</span>
                      <span style={{ fontSize: "12px", color: c.free === false ? "#2a2a2a" : "#777" }}>
                        {c.free === false ? "—" : c.free === true ? "✓" : c.free}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro */}
              <div style={{ background: "#141414", border: "1px solid rgba(249,115,22,0.35)", borderRadius: "14px", padding: "2rem", position: "relative" }}>
                <div style={{ position: "absolute", top: "16px", right: "16px", background: "#f97316", borderRadius: "100px", padding: "3px 10px", fontSize: "10px", fontWeight: 700, color: "#fff" }}>
                  Popular
                </div>
                <p style={{ fontSize: "11px", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Pro</p>
                <p style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>R$ 12,90</p>
                <p style={{ fontSize: "12px", color: "#555", marginBottom: "1.5rem" }}>por mês · cancele quando quiser</p>
                <button
                  onClick={() => navigate("/login")}
                  style={{ width: "100%", padding: "11px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: "1.5rem", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
                >Assinar Pro</button>
                <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
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

          {/* CTA final */}
          <section style={{ position: "relative", overflow: "hidden", padding: "100px 2rem", textAlign: "center" }}>
            {/* Anéis decorativos */}
            {[500, 750, 1000].map(size => (
              <div key={size} style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: `${size}px`, height: `${size}px`,
                borderRadius: "50%", border: "0.5px solid rgba(249,115,22,0.08)",
                pointerEvents: "none",
              }} />
            ))}
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontSize: "26px", fontWeight: 700, marginBottom: "12px" }}>Pronto para começar?</h2>
              <p style={{ fontSize: "14px", color: "#555", marginBottom: "2rem" }}>Crie seu plano grátis agora. Sem cartão.</p>
              <button
                onClick={() => navigate("/login")}
                style={{ padding: "14px 36px", background: "#f97316", border: "none", borderRadius: "12px", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
              >
                Gerar meu plano grátis →
              </button>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "2rem", textAlign: "center" }}>
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
