import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import SSOCallback from "./pages/SSOCallback";
import Dashboard from "./pages/Dashboard";
import RotaDevOnboardingForm from "./features/onboarding/components/RotaDevOnboardingForm";
import foxImg from "./assets/fox.png";
import { ProStatusProvider, useProStatus } from "./contexts/ProStatusContext";
import RenewalPage from "./pages/RenewalPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

// Bloqueia dashboard se assinatura expirou
function ProRoute({ children }: { children: React.ReactNode }) {
  const { isPro, loading } = useProStatus();

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #1e1e1e", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!isPro) return <RenewalPage />;

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #1e1e1e", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!isSignedIn) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function AppLayout() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isPro, loading } = useProStatus();
  const [searchParams] = useSearchParams();

  // Pro user só acessa /app se veio via botão "Regenerar"
  if (!loading && isPro && searchParams.get("regenerar") !== "true") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 2rem",
          background: "#0f0f0f",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={foxImg} alt="Rota Dev" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>
            Rota<span style={{ color: "#f97316" }}>Dev</span>
          </span>
        </div>

        {/* Avatar + nome + sair */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt={user.firstName ?? ""}
              style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "1px solid #2a2a2a" }}
            />
          )}
          <span style={{ fontSize: "13px", color: "#555" }}>{user?.firstName}</span>
          <span style={{ color: "#222", fontSize: "12px" }}>|</span>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            style={{ fontSize: "13px", color: "#444", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f97316")}
            onMouseLeave={e => (e.currentTarget.style.color = "#444")}
          >
            Sair
          </button>
        </div>
      </header>
      <main className="flex-1" style={{ paddingTop: "72px" }}>
        <RotaDevOnboardingForm />
      </main>

      <footer className="w-full border-t border-zinc-900 bg-black py-5 text-center text-sm text-zinc-500">
        <p className="leading-relaxed">
          © {new Date().getFullYear()} Rota Dev. Todos os direitos reservados.
        </p>
        <a
          href="https://www.instagram.com/codebylilian"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-medium text-orange-500 transition hover:text-orange-400"
        >
          Criado por @codebylilian
        </a>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ProStatusProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard/*" element={<ProtectedRoute><ProRoute><Dashboard /></ProRoute></ProtectedRoute>} />
          <Route path="/sso-callback" element={<SSOCallback />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProStatusProvider>
    </BrowserRouter>
  );
}

export default App;
