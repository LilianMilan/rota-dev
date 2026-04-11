import { useNavigate } from "react-router-dom";
import foxImg from "../assets/fox.png";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem 2rem", background: "rgba(10,10,10,0.9)",
        backdropFilter: "blur(12px)", borderBottom: "1px solid #111",
      }}>
        <button
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <img src={foxImg} alt="Rota Dev" style={{ width: "28px", height: "28px", borderRadius: "6px" }} />
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#fff" }}>
            Rota<span style={{ color: "#f97316" }}>Dev</span>
          </span>
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{ fontSize: "13px", color: "#555", background: "transparent", border: "none", cursor: "pointer" }}
        >
          ← Voltar
        </button>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "120px 2rem 80px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Política de Privacidade</h1>
        <p style={{ fontSize: "13px", color: "#555", marginBottom: "2.5rem" }}>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {[
            {
              title: "1. Dados coletados",
              body: "Coletamos seu e-mail (via Clerk) para autenticação, seu plano de estudos e progresso (para usuários Pro, armazenado no Supabase), e dados de pagamento processados de forma segura pelo Stripe — nunca armazenamos dados de cartão.",
            },
            {
              title: "2. Como usamos seus dados",
              body: "Seus dados são usados exclusivamente para fornecer o serviço Rota Dev: autenticação, sincronização do plano na nuvem e processamento do pagamento da assinatura Pro.",
            },
            {
              title: "3. Compartilhamento de dados",
              body: "Não vendemos nem compartilhamos seus dados pessoais com terceiros, exceto com os provedores de serviço necessários para o funcionamento da plataforma (Clerk para autenticação, Supabase para banco de dados, Stripe para pagamentos, OpenAI para geração de planos).",
            },
            {
              title: "4. Plano gratuito — armazenamento local",
              body: "Para usuários do plano gratuito, o plano de estudos e o progresso são armazenados apenas no seu navegador (localStorage). Esses dados não são enviados para nossos servidores.",
            },
            {
              title: "5. Retenção de dados",
              body: "Seus dados são mantidos enquanto sua conta estiver ativa. Você pode solicitar a exclusão dos seus dados a qualquer momento pelo Instagram @codebylilian.",
            },
            {
              title: "6. Cookies e rastreamento",
              body: "Utilizamos apenas cookies essenciais para autenticação via Clerk. Não utilizamos cookies de rastreamento ou publicidade.",
            },
            {
              title: "7. Segurança",
              body: "Utilizamos serviços com padrões de segurança reconhecidos pelo mercado (Clerk, Supabase, Stripe). A comunicação é feita via HTTPS.",
            },
            {
              title: "8. Contato",
              body: "Para exercer seus direitos de acesso, correção ou exclusão de dados, entre em contato pelo Instagram @codebylilian.",
            },
          ].map(s => (
            <div key={s.title}>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#ccc", marginBottom: "8px" }}>{s.title}</h2>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.7 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

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
