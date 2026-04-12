import { useState } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import "./Dashboard.css";
import { useProStatus } from "../contexts/ProStatusContext";

import DashboardHome from "./DashboardHome";
import MeuPlano from "./MeuPlano";
import AgenteIA from "./AgenteIA";
import Progresso from "./Progresso";

const NAV_ITEMS = [
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
    label: "Início", path: "/dashboard",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
    label: "Meu plano", path: "/dashboard/plano",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    label: "Agente IA", path: "/dashboard/agente",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    label: "Progresso", path: "/dashboard/progresso",
  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isPro } = useProStatus();
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleManageSubscription() {
    if (!user) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: user.id }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function isActive(path: string) {
    return path === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(path);
  }

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "2rem", paddingLeft: "2px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
          Rota<span style={{ color: "#f97316" }}>Dev</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={() => { navigate(item.path); onClose?.(); }}
              style={{
                display: "flex", alignItems: "center", gap: "9px",
                padding: "9px 10px", borderRadius: "9px",
                background: active ? "rgba(249,115,22,0.12)" : "transparent",
                border: "none",
                color: active ? "#fb923c" : "#555",
                fontSize: "13px", fontWeight: active ? 600 : 400,
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "#888"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "#555"; e.currentTarget.style.background = "transparent"; } }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer user */}
      <div style={{ marginTop: "auto" }}>
        {isPro && (
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            style={{
              width: "100%", padding: "8px 10px", background: "transparent",
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", color: "#666",
              fontSize: "12px", cursor: portalLoading ? "not-allowed" : "pointer",
              textAlign: "left", marginBottom: "10px", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
          >
            {portalLoading ? "Abrindo..." : "Gerenciar assinatura"}
          </button>
        )}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "12px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={user.firstName ?? ""} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#f97316" }}>{initials}</span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "12px", color: "#ccc", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.firstName} {user?.lastName}
            </p>
            {isPro && (
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#f97316", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: "100px", padding: "1px 7px", letterSpacing: "0.06em" }}>
                PRO
              </span>
            )}
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            title="Sair"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#444", fontSize: "16px", padding: "4px", flexShrink: 0, lineHeight: 1 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f97316")}
            onMouseLeave={e => (e.currentTarget.style.color = "#444")}
          >
            ⏻
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <div className={`dashboard-overlay${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(false)} />

      <aside className={`dashboard-sidebar${drawerOpen ? " open" : ""}`}>
        <SidebarContent onClose={() => setDrawerOpen(false)} />
      </aside>

      <header className="dashboard-mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🦊</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
            Rota<span style={{ color: "#f97316" }}>Dev</span>
          </span>
        </div>
        <button
          onClick={() => setDrawerOpen(v => !v)}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#888", fontSize: "20px", padding: "4px" }}
        >
          {drawerOpen ? "✕" : "☰"}
        </button>
      </header>

      <main className="dashboard-main">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="plano" element={<MeuPlano />} />
          <Route path="agente" element={<AgenteIA />} />
          <Route path="progresso" element={<Progresso />} />
        </Routes>
      </main>
    </div>
  );
}
