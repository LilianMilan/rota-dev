import { useState } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import "./Dashboard.css";

import DashboardHome from "./DashboardHome";
import MeuPlano from "./MeuPlano";
import AgenteIA from "./AgenteIA";
import Progresso from "./Progresso";

const NAV_ITEMS = [
  { icon: "⊞", label: "Início",    path: "/dashboard" },
  { icon: "📋", label: "Meu plano", path: "/dashboard/plano" },
  { icon: "🤖", label: "Agente IA", path: "/dashboard/agente" },
  { icon: "📈", label: "Progresso", path: "/dashboard/progresso" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function isActive(path: string) {
    return path === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(path);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2rem", paddingLeft: "4px" }}>
          <span style={{ fontSize: "20px" }}>🦊</span>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
            Rota<span style={{ color: "#f97316" }}>Dev</span>
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => { navigate(item.path); onClose?.(); }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "10px",
                  background: active ? "rgba(249,115,22,0.1)" : "transparent",
                  border: active ? "1px solid rgba(249,115,22,0.2)" : "1px solid transparent",
                  color: active ? "#f97316" : "#555",
                  fontSize: "13px", fontWeight: active ? 500 : 400,
                  cursor: "pointer", textAlign: "left", width: "100%",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#888"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#555"; }}
              >
                <span style={{ fontSize: "15px" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ marginTop: "auto" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "12px", borderRadius: "12px",
        background: "#161616", border: "1px solid #1e1e1e",
      }}>
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt={user.firstName ?? ""} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: "14px" }}>
            {user?.firstName?.[0]}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "12px", color: "#ccc", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.firstName} {user?.lastName}
          </p>
          <span style={{
            fontSize: "10px", fontWeight: 600, color: "#f97316",
            background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)",
            borderRadius: "4px", padding: "1px 6px", letterSpacing: "0.05em",
          }}>
            PRO
          </span>
        </div>
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
