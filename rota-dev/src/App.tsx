import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import LoginPage from "./pages/LoginPage";
import SSOCallback from "./pages/SSOCallback";
import Dashboard from "./pages/Dashboard";
import RotaDevOnboardingForm from "./features/onboarding/components/RotaDevOnboardingForm";
import foxImg from "./assets/fox.png";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AppLayout() {
  const { signOut } = useClerk();
  const { user } = useUser();

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
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/sso-callback" element={<SSOCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
