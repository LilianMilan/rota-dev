import { useNavigate } from "react-router-dom";
import foxImg from "../assets/fox.png";

export default function TermsPage() {
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
        <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Termos de Uso</h1>
        <p style={{ fontSize: "13px", color: "#555", marginBottom: "2.5rem" }}>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {[
            {
              title: "1. Aceitação dos termos",
              body: "Ao utilizar o Rota Dev, você concorda com estes termos de uso. Se não concordar com algum ponto, pedimos que não utilize o serviço.",
            },
            {
              title: "2. Descrição do serviço",
              body: "O Rota Dev é uma plataforma de planejamento de estudos que utiliza inteligência artificial para gerar planos personalizados para iniciantes em desenvolvimento de software.",
            },
            {
              title: "3. Conta e acesso",
              body: "Para acessar o serviço, você precisa criar uma conta com e-mail válido. Você é responsável pela segurança das suas credenciais de acesso.",
            },
            {
              title: "4. Plano gratuito e Pro",
              body: "O plano gratuito oferece geração de 1 plano com 7 dias de conteúdo, salvo localmente no navegador. O plano Pro oferece recursos adicionais descritos na página de preços, mediante assinatura mensal.",
            },
            {
              title: "5. Cancelamento",
              body: "Você pode cancelar sua assinatura Pro a qualquer momento pelo painel de assinatura. O acesso Pro permanece ativo até o final do período pago.",
            },
            {
              title: "6. Uso aceitável",
              body: "Você concorda em não usar o serviço para fins ilegais, não compartilhar sua conta e não tentar contornar as limitações técnicas da plataforma.",
            },
            {
              title: "7. Limitação de responsabilidade",
              body: "O Rota Dev fornece planos de estudo como sugestões educacionais geradas por IA. Não garantimos resultados específicos de aprendizado. O serviço é fornecido 'como está'.",
            },
            {
              title: "8. Contato",
              body: "Dúvidas sobre os termos? Entre em contato pelo Instagram @codebylilian.",
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
