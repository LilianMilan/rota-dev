import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { StudyPlan, PlanDay } from "../features/onboarding/types/onboarding";

// Mock — futuramente virá do Stripe/Supabase
const HAS_PRO = true;

const FREE_DAY_LIMIT = 7;
const PROGRESS_KEY = (title: string) => `rota-dev-progress:${title}`;

function DayCard({
  day,
  locked,
  checkedTasks,
  onToggle,
}: {
  day: PlanDay;
  done?: boolean;
  locked: boolean;
  checkedTasks: string[];
  onToggle: (task: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const completedCount = day.tasks.filter(t => checkedTasks.includes(t)).length;
  const allDone = completedCount === day.tasks.length;

  return (
    <div
      style={{
        background: locked ? "#0e0e0e" : "#111",
        border: `1px solid ${allDone ? "rgba(249,115,22,0.3)" : locked ? "#161616" : "#1e1e1e"}`,
        borderRadius: "14px",
        overflow: "hidden",
        opacity: locked ? 0.45 : 1,
        transition: "border-color 0.2s",
      }}
    >
      {/* Header do card */}
      <button
        onClick={() => !locked && setExpanded(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "12px",
          padding: "1rem 1.25rem", background: "transparent", border: "none",
          cursor: locked ? "not-allowed" : "pointer", textAlign: "left",
        }}
      >
        {/* Número do dia */}
        <div style={{
          width: "32px", height: "32px", borderRadius: "9px", flexShrink: 0,
          background: allDone ? "#f97316" : locked ? "#1a1a1a" : "#1a1a1a",
          border: `1px solid ${allDone ? "#f97316" : "#2a2a2a"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: 700,
          color: allDone ? "#fff" : "#444",
        }}>
          {allDone ? "✓" : day.day}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: locked ? "#333" : "#fff", marginBottom: "2px" }}>
            Dia {day.day} — {day.title}
          </p>
          <p style={{ fontSize: "11px", color: "#555" }}>
            {completedCount}/{day.tasks.length} tarefas concluídas
          </p>
        </div>

        {/* Barra de progresso mini */}
        <div style={{ width: "60px", height: "4px", background: "#1e1e1e", borderRadius: "4px", flexShrink: 0 }}>
          <div style={{
            height: "4px", borderRadius: "4px", background: "#f97316",
            width: `${day.tasks.length ? (completedCount / day.tasks.length) * 100 : 0}%`,
            transition: "width 0.3s",
          }} />
        </div>

        {locked ? (
          <span style={{ fontSize: "14px", color: "#333" }}>🔒</span>
        ) : (
          <span style={{ fontSize: "12px", color: "#444", transition: "transform 0.2s", display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
        )}
      </button>

      {/* Conteúdo expandido */}
      {expanded && !locked && (
        <div style={{ padding: "0 1.25rem 1.25rem" }}>
          {day.description && (
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "1rem", lineHeight: 1.6 }}>
              {day.description}
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {day.tasks.map((task) => {
              const checked = checkedTasks.includes(task);
              return (
                <div
                  key={task}
                  onClick={() => onToggle(task)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "10px",
                    background: checked ? "rgba(249,115,22,0.04)" : "#161616",
                    border: `1px solid ${checked ? "rgba(249,115,22,0.2)" : "#1e1e1e"}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${checked ? "#f97316" : "#2a2a2a"}`,
                    background: checked ? "#f97316" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    {checked && <span style={{ color: "#fff", fontSize: "10px" }}>✓</span>}
                  </div>
                  <span style={{
                    fontSize: "13px", flex: 1,
                    color: checked ? "#555" : "#ccc",
                    textDecoration: checked ? "line-through" : "none",
                  }}>
                    {task}
                  </span>
                  {checked && (
                    <span style={{
                      fontSize: "10px", fontWeight: 600, color: "#f97316",
                      background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
                      borderRadius: "4px", padding: "2px 8px",
                    }}>feito</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ProBanner() {
  const navigate = useNavigate();
  return (
    <div style={{
      background: "linear-gradient(135deg, #111 0%, #1a0f00 100%)",
      border: "1px solid rgba(249,115,22,0.3)",
      borderRadius: "16px", padding: "2rem",
      textAlign: "center", marginTop: "1rem",
    }}>
      <p style={{ fontSize: "20px", marginBottom: "8px" }}>🔒</p>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
        Desbloqueie o plano completo
      </h3>
      <p style={{ fontSize: "13px", color: "#888", marginBottom: "1.5rem", lineHeight: 1.6 }}>
        No plano Pro você acessa todos os dias da trilha, recursos com links reais,<br />
        pode regenerar e ajustar seu plano a qualquer momento.
      </p>
      <button
        onClick={() => navigate("/paywall")}
        style={{
          padding: "12px 28px", background: "#f97316", border: "none",
          borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600,
          cursor: "pointer", transition: "opacity 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        Assinar Pro — R$19/mês
      </button>
    </div>
  );
}

export default function MeuPlano() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  // Futuramente: buscar do Supabase. Por agora usa localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rota-dev-plan");
      if (raw) setPlan(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!plan) return;
    try {
      const raw = localStorage.getItem(PROGRESS_KEY(plan.planTitle));
      if (raw) setCheckedTasks(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [plan]);

  function toggleTask(task: string) {
    if (!plan) return;
    setCheckedTasks(prev => {
      const next = prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task];
      localStorage.setItem(PROGRESS_KEY(plan.planTitle), JSON.stringify(next));
      return next;
    });
  }

  if (!plan) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: "12px" }}>
        <span style={{ fontSize: "32px" }}>📋</span>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>Nenhum plano gerado ainda</h2>
        <p style={{ fontSize: "13px", color: "#666" }}>Responda o questionário para gerar sua trilha personalizada.</p>
        <button
          onClick={() => window.location.href = "/app"}
          style={{
            marginTop: "8px", padding: "10px 24px", background: "#f97316",
            border: "none", borderRadius: "10px", color: "#fff",
            fontSize: "13px", fontWeight: 600, cursor: "pointer",
          }}
        >
          Criar meu plano →
        </button>
      </div>
    );
  }

  const visibleDays = HAS_PRO ? plan.days : plan.days.slice(0, FREE_DAY_LIMIT);
  const lockedDays = HAS_PRO ? [] : plan.days.slice(FREE_DAY_LIMIT);
  const totalDone = plan.days.reduce((acc, d) => acc + d.tasks.filter(t => checkedTasks.includes(t)).length, 0);
  const totalTasks = plan.days.reduce((acc, d) => acc + d.tasks.length, 0);
  const globalProgress = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

  // Mock de múltiplas rotas para Pro
  const PLANOS_PRO = [plan.planTitle, "Rota Alternativa (em breve)"];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Meu Plano</h1>
          <p style={{ fontSize: "13px", color: "#666" }}>{plan.planTitle}</p>
        </div>

        {HAS_PRO && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{
              padding: "8px 16px", background: "transparent",
              border: "1px solid #2a2a2a", borderRadius: "10px",
              color: "#888", fontSize: "12px", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.color = "#f97316"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#888"; }}
            >
              ✏️ Ajustar plano
            </button>
            <button
              onClick={() => window.location.href = "/app"}
              style={{
                padding: "8px 16px", background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.3)", borderRadius: "10px",
                color: "#f97316", fontSize: "12px", cursor: "pointer",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              🔄 Regenerar plano
            </button>
          </div>
        )}
      </div>

      {/* Abas de planos — só Pro */}
      {HAS_PRO && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
          {PLANOS_PRO.map((nome, i) => (
            <button
              key={nome}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                cursor: i === 1 ? "not-allowed" : "pointer",
                background: activeTab === i ? "rgba(249,115,22,0.1)" : "transparent",
                border: `1px solid ${activeTab === i ? "rgba(249,115,22,0.3)" : "#1e1e1e"}`,
                color: activeTab === i ? "#f97316" : "#555",
                opacity: i === 1 ? 0.4 : 1,
              }}
              disabled={i === 1}
            >
              {nome}
            </button>
          ))}
        </div>
      )}

      {/* Progresso global */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", color: "#888" }}>Progresso geral</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#f97316" }}>{globalProgress}%</span>
        </div>
        <div style={{ height: "6px", background: "#1e1e1e", borderRadius: "6px" }}>
          <div style={{ height: "6px", width: `${globalProgress}%`, background: "#f97316", borderRadius: "6px", transition: "width 0.3s" }} />
        </div>
        <p style={{ fontSize: "11px", color: "#555", marginTop: "6px" }}>{totalDone} de {totalTasks} tarefas concluídas</p>
      </div>

      {/* Cards dos dias */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {visibleDays.map(day => (
          <DayCard
            key={day.day}
            day={day}
            done={day.tasks.every(t => checkedTasks.includes(t))}
            locked={false}
            checkedTasks={checkedTasks}
            onToggle={toggleTask}
          />
        ))}

        {/* Dias bloqueados (Free) */}
        {lockedDays.map(day => (
          <DayCard
            key={day.day}
            day={day}
            done={false}
            locked={true}
            checkedTasks={[]}
            onToggle={() => {}}
          />
        ))}
      </div>

      {/* Banner Pro */}
      {!HAS_PRO && <ProBanner />}
    </div>
  );
}
