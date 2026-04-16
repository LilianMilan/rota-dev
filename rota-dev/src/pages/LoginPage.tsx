import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn, useSignUp, useAuth } from "@clerk/clerk-react";
import foxImg from "../assets/fox.png";

const features = [
  { icon: "☁️", title: "Plano salvo na nuvem", sub: "Acesse de qualquer dispositivo" },
  { icon: "📊", title: "Progresso acompanhado", sub: "Veja sua evolução dia a dia" },
  { icon: "🤖", title: "Agente de IA disponível", sub: "Tire dúvidas dentro do seu plano" },
];

function LeftPanel() {
  return (
    <div
      className="relative flex flex-col justify-center items-center overflow-hidden"
      style={{ height: "100vh", background: "#111111", padding: "3rem", borderRight: "1px solid #1e1e1e" }}
    >
      {/* Círculos decorativos */}
      <div className="absolute rounded-full" style={{ top: "-60px", right: "-60px", width: "220px", height: "220px", border: "0.5px solid rgba(249,115,22,0.07)" }} />
      <div className="absolute rounded-full" style={{ top: "-30px", right: "-30px", width: "140px", height: "140px", border: "0.5px solid rgba(249,115,22,0.12)" }} />
      <div className="absolute rounded-full" style={{ bottom: "80px", left: "-40px", width: "160px", height: "160px", border: "0.5px solid rgba(249,115,22,0.08)" }} />

      <div className="flex flex-col gap-3 z-10" style={{ maxWidth: "480px", width: "100%" }}>
        {/* Logo */}
        <div className="flex items-center gap-0">
          <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0">
            <img src={foxImg} alt="Rota Dev" className="w-full h-full object-cover fox-float" />
          </div>
          <span className="text-white text-2xl font-bold">
            Rota<span className="text-orange-500">Dev</span>
          </span>
        </div>

        {/* Tagline */}
        <div>
          <p className="text-orange-500 text-xs tracking-widest uppercase mb-4">Planner com IA</p>
          <h2 className="text-white text-2xl font-medium leading-snug mb-3">
            Eu te mostro o <span className="text-orange-500">caminho</span> pra<br />virar dev.
          </h2>
          <p className="text-zinc-600 text-sm leading-relaxed">
            Plano de estudos personalizado,<br />gerado por IA em minutos.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2" style={{ maxWidth: "400px" }}>
          {features.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors duration-200 border-orange-500/20 hover:border-orange-500"
              style={{ background: "#161616" }}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              <div>
                <p className="text-white text-sm font-medium">{item.title}</p>
                <p className="text-zinc-500 text-xs">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { isSignedIn, isLoaded } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"initial" | "verify">("initial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/app", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  async function handleOAuth() {
    await signIn?.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/app",
    });
  }

  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");

  async function handleEmailSubmit() {
    if (!signInLoaded || !signUpLoaded || !email) return;
    setLoading(true);
    setError("");
    try {
      await signIn!.create({ identifier: email });
      await signIn!.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: signIn!.supportedFirstFactors?.find(
          (f) => f.strategy === "email_code"
        )?.emailAddressId ?? "",
      });
      setAuthMode("signIn");
      setStep("verify");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { code: string }[] };
      if (clerkErr?.errors?.[0]?.code === "form_identifier_not_found") {
        try {
          await signUp!.create({ emailAddress: email });
          await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
          setAuthMode("signUp");
          setStep("verify");
        } catch {
          setError("Não foi possível enviar o código. Verifique o e-mail.");
        }
      } else {
        setError("Não foi possível enviar o código. Verifique o e-mail.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!signInLoaded || !signUpLoaded || !code) return;
    setLoading(true);
    setError("");
    try {
      if (authMode === "signUp") {
        const result = await signUp!.attemptEmailAddressVerification({ code });
        if (result.status === "complete") {
          await setActive!({ session: result.createdSessionId });
          navigate("/app", { replace: true });
        }
      } else {
        const result = await signIn!.attemptFirstFactor({ strategy: "email_code", code });
        if (result.status === "complete") {
          await setActive!({ session: result.createdSessionId });
          navigate("/app", { replace: true });
        }
      }
    } catch {
      setError("Código inválido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    color: "#ccc",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div className="w-screen h-screen bg-[#0d0d0d] flex">
      {/* Painel esquerdo */}
      <div className="flex-1 h-full hidden md:block">
        <LeftPanel />
      </div>

      {/* Painel direito */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0d0d0d]" style={{ height: "100vh" }}>
        <div className="w-full max-w-xs">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
              <img src={foxImg} alt="Rota Dev" className="w-full h-full object-cover" />
            </div>
            <span className="text-white text-lg font-bold">
              Rota<span className="text-orange-500">Dev</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-white text-3xl font-semibold mb-1.5">Boas-vindas.</h1>
            <p className="text-zinc-500 text-sm">Entre pra acessar ou criar seu plano.</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Google */}
            <button
              className="flex items-center justify-center gap-2.5 w-full py-3 px-4 bg-white rounded-xl text-[#111] text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer"
              onClick={handleOAuth}
            >
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-21 0-1.3-.2-2.7-.5-4z" />
                <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" />
                <path fill="#FBBC05" d="M24 46c5.8 0 10.9-1.9 14.9-5.2l-6.9-5.7C29.9 36.6 27.1 37 24 37c-6.1 0-11.3-4.1-13.2-9.7l-7 5.4C7.6 41.3 15.3 46 24 46z" />
                <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.7-4.8 6.1l6.9 5.7C42.1 37.3 46 31.1 46 24c0-1.3-.2-2.7-.5-4z" />
              </svg>
              Continuar com Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px" style={{ background: "#1e1e1e" }} />
              <span className="text-xs text-zinc-700">ou</span>
              <div className="flex-1 h-px" style={{ background: "#1e1e1e" }} />
            </div>

            {/* Email flow */}
            {step === "initial" ? (
              <>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleEmailSubmit()}
                  style={{ ...inputStyle }}
                />
                <button
                  onClick={handleEmailSubmit}
                  disabled={loading || !email}
                  className="w-full py-3 rounded-xl text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#f97316", border: "none" }}
                >
                  {loading ? "Enviando..." : "Continuar com email"}
                </button>
              </>
            ) : (
              <>
                <p className="text-zinc-500 text-xs">
                  Código enviado para <span className="text-zinc-300">{email}</span>
                </p>
                <input
                  type="text"
                  placeholder="Digite o código"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleVerifyCode()}
                  style={{ ...inputStyle, letterSpacing: "0.2em", textAlign: "center" }}
                />
                <button
                  onClick={handleVerifyCode}
                  disabled={loading || !code}
                  className="w-full py-3 rounded-xl text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#f97316", border: "none" }}
                >
                  {loading ? "Verificando..." : "Verificar código"}
                </button>
                <button
                  onClick={() => { setStep("initial"); setCode(""); setError(""); }}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer text-center"
                  style={{ background: "transparent", border: "none" }}
                >
                  ← Voltar
                </button>
              </>
            )}

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          </div>

          <p className="text-xs text-zinc-700 mt-6 text-center leading-relaxed">
            Ao entrar, você concorda com os{" "}
            <a href="/terms" className="text-orange-500 hover:text-orange-400 transition-colors">Termos</a> e{" "}
            <a href="/privacy" className="text-orange-500 hover:text-orange-400 transition-colors">Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
