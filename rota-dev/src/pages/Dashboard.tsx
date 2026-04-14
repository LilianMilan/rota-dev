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
  const { isPro, planType } = useProStatus();
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
      <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
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
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 8px", borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
        {/* Avatar */}
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt={user.firstName ?? ""} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#f97316" }}>{initials}</span>
          </div>
        )}

        {/* Coluna de texto */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#e5e7eb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.firstName} {user?.lastName}
          </span>
          {isPro && (
            <span style={{ fontSize: "9px", background: "rgba(249,115,22,0.2)", color: "#fb923c", border: "0.5px solid rgba(249,115,22,0.3)", padding: "1px 6px", borderRadius: "20px", width: "fit-content" }}>
              PRO
            </span>
          )}
          {isPro && planType !== "lifetime" && (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              style={{ background: "transparent", border: "none", padding: 0, fontSize: "11px", color: "#4b5563", cursor: portalLoading ? "not-allowed" : "pointer", textAlign: "left", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#9ca3af")}
              onMouseLeave={e => (e.currentTarget.style.color = "#4b5563")}
            >
              {portalLoading ? "Abrindo..." : "Gerenciar assinatura"}
            </button>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          title="Sair"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#4b5563", padding: "4px", flexShrink: 0, lineHeight: 1, transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#f97316")}
          onMouseLeave={e => (e.currentTarget.style.color = "#4b5563")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64"/><line x1="12" y1="2" x2="12" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { signOut } = useClerk();
  const { isPro, planType } = useProStatus();
  const { user } = useUser();
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleManageSubscriptionMobile() {
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

  return (
    <div className="dashboard-layout">
      <div className={`dashboard-overlay${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(false)} />

      <aside className={`dashboard-sidebar${drawerOpen ? " open" : ""}`}>
        <SidebarContent onClose={() => setDrawerOpen(false)} />
      </aside>

      <header className="dashboard-mobile-header">
        <button
          onClick={() => setDrawerOpen(v => !v)}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#888", fontSize: "20px", padding: "4px" }}
        >
          {drawerOpen ? "✕" : "☰"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🦊</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
            Rota<span style={{ color: "#f97316" }}>Dev</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isPro && planType !== "lifetime" && (
            <button
              onClick={handleManageSubscriptionMobile}
              disabled={portalLoading}
              style={{ background: "transparent", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", color: "#fb923c", cursor: "pointer" }}
            >
              {portalLoading ? "..." : "Assinatura"}
            </button>
          )}
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            title="Sair"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#555", padding: "4px", lineHeight: 1 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64"/><line x1="12" y1="2" x2="12" y2="12"/>
            </svg>
          </button>
        </div>
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
