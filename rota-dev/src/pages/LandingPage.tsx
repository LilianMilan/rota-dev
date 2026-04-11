import { useNavigate } from "react-router-dom";
import foxImg from "../assets/fox.png";

const STEPS = [
  { num: "01", title: "Responde 5 perguntas", desc: "Objetivo, nível, tempo disponível e motivação. Leva menos de 2 minutos." },
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

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem 2rem", background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(12px)", borderBottom: "1px solid #111",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={foxImg} alt="Rota Dev" style={{ width: "28px", height: "28px", borderRadius: "6px" }} />
          <span style={{ fontWeight: 700, fontSize: "15px" }}>
            Rota<span style={{ color: "#f97316" }}>Dev</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/login")}
            style={{ padding: "8px 18px", background: "transparent", border: "1px solid #2a2a2a", borderRadius: "10px", color: "#888", fontSize: "13px", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#444")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
          >
            Entrar
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{ padding: "8px 18px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Começar grátis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: "120px", paddingBottom: "80px", textAlign: "center", padding: "140px 2rem 80px" }}>
        <div style={{ display: "inline-block", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "100px", padding: "6px 16px", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "12px", color: "#f97316", fontWeight: 500 }}>Planner com agente de IA para dev iniciante</span>
        </div>
        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.25rem", maxWidth: "700px", margin: "0 auto 1.25rem" }}>
          Eu te mostro o{" "}
          <span style={{ color: "#f97316" }}>caminho</span>{" "}
          pra virar dev.
        </h1>
        <p style={{ fontSize: "17px", color: "#666", maxWidth: "480px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
          Responda algumas perguntas e o Rota Dev monta sua rota de estudos personalizada com IA em minutos.
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "14px 36px", background: "#f97316", border: "none",
            borderRadius: "14px", color: "#fff", fontSize: "15px", fontWeight: 700,
            cursor: "pointer", transition: "opacity 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Gerar meu plano grátis →
        </button>
        <p style={{ fontSize: "12px", color: "#444", marginTop: "12px" }}>Sem cartão. Grátis pra começar.</p>
      </section>

      {/* Como funciona */}
      <section style={{ padding: "60px 2rem", maxWidth: "900px", margin: "0 auto" }}>
        <p style={{ fontSize: "11px", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", marginBottom: "12px" }}>Como funciona</p>
        <h2 style={{ fontSize: "28px", fontWeight: 700, textAlign: "center", marginBottom: "3rem" }}>
          Do zero ao plano em 2 minutos
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {STEPS.map(s => (
            <div key={s.num} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "1.75rem" }}>
              <p style={{ fontSize: "28px", fontWeight: 800, color: "rgba(249,115,22,0.2)", marginBottom: "1rem" }}>{s.num}</p>
              <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>{s.title}</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "60px 2rem", maxWidth: "700px", margin: "0 auto" }}>
        <p style={{ fontSize: "11px", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", marginBottom: "12px" }}>Planos</p>
        <h2 style={{ fontSize: "28px", fontWeight: 700, textAlign: "center", marginBottom: "3rem" }}>
          Simples e sem surpresa
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Free */}
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "20px", padding: "2rem" }}>
            <p style={{ fontSize: "12px", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Free</p>
            <p style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "4px" }}>R$ 0</p>
            <p style={{ fontSize: "12px", color: "#555", marginBottom: "1.5rem" }}>pra sempre</p>
            <button
              onClick={() => navigate("/login")}
              style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #2a2a2a", borderRadius: "10px", color: "#888", fontSize: "13px", cursor: "pointer", marginBottom: "1.5rem" }}
            >
              Começar grátis
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {COMPARE.map(c => (
                <div key={c.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#666" }}>{c.label}</span>
                  <span style={{ fontSize: "12px", color: c.free === false ? "#333" : "#888" }}>
                    {c.free === false ? "—" : c.free === true ? "✓" : c.free}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div style={{ background: "linear-gradient(135deg, #111 0%, #1a0e00 100%)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "20px", padding: "2rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "16px", right: "16px", background: "#f97316", borderRadius: "100px", padding: "3px 10px", fontSize: "10px", fontWeight: 700, color: "#fff" }}>
              POPULAR
            </div>
            <p style={{ fontSize: "12px", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Pro</p>
            <p style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "4px" }}>R$ 12,90</p>
            <p style={{ fontSize: "12px", color: "#555", marginBottom: "1.5rem" }}>por mês · cancele quando quiser</p>
            <button
              onClick={() => navigate("/login")}
              style={{ width: "100%", padding: "10px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: "1.5rem" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Assinar Pro
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
      <section style={{ padding: "80px 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px" }}>
          Pronto pra começar?
        </h2>
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "2rem" }}>
          Crie seu plano grátis agora. Sem cartão.
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{ padding: "14px 36px", background: "#f97316", border: "none", borderRadius: "14px", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Gerar meu plano grátis →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #111", padding: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#333" }}>
          © {new Date().getFullYear()} Rota Dev ·{" "}
          <a href="https://www.instagram.com/codebylilian" target="_blank" rel="noopener noreferrer" style={{ color: "#f97316", textDecoration: "none" }}>
            @codebylilian
          </a>
        </p>
      </footer>
    </div>
  );
}
