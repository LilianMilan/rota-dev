import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import type { StudyPlan } from "../features/onboarding/types/onboarding";
import { useProStatus } from "../contexts/ProStatusContext";

type PlanRow = { id: string; content: { plan: StudyPlan; checkedTasks: string[] }; created_at: string };

const PROGRESS_KEY = (title: string) => `rota-dev-progress:${title}`;

export default function DashboardHome() {
  const { user } = useUser();
  const { isPro } = useProStatus();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<string[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  function applyPlanAndProgress(p: StudyPlan, progress: string[]) {
    setPlan(p);
    setCheckedTasks(progress);
    const firstIncomplete = p.days.findIndex(d => d.tasks.some(t => !progress.includes(t)));
    setCurrentDayIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
  }

  useEffect(() => {
    async function load() {
      if (isPro && user) {
        try {
          const res = await fetch(`/api/get-plan?clerk_id=${user.id}`);
          if (res.ok) {
            const rows = await res.json() as PlanRow[];
            if (rows.length > 0) {
              const { plan: p, checkedTasks: ct } = rows[0].content;
              localStorage.setItem("rota-dev-plan", JSON.stringify(p));
              setPlanId(rows[0].id);
              applyPlanAndProgress(p, Array.isArray(ct) ? ct : []);
              return;
            }
          }
        } catch { /* fallback localStorage */ }
      }
      try {
        const raw = localStorage.getItem("rota-dev-plan");
        if (raw) {
          const p = JSON.parse(raw) as StudyPlan;
          const progressRaw = localStorage.getItem(PROGRESS_KEY(p.planTitle));
          const parsed = (() => { try { const v = JSON.parse(progressRaw ?? "[]"); return Array.isArray(v) ? v as string[] : []; } catch { return []; } })();
          applyPlanAndProgress(p, parsed);
        }
      } catch { /* ignore */ }
    }
    void load();
  }, [isPro, user?.id]);

  function toggleTask(task: string) {
    if (!plan) return;
    setCheckedTasks(prev => {
      const next = prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task];
      localStorage.setItem(PROGRESS_KEY(plan.planTitle), JSON.stringify(next));
      if (isPro && user && planId) {
        void fetch("/api/save-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerk_id: user.id, plan_id: planId, checkedTasks: next }),
        });
      }
      return next;
    });
  }

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const currentDay = plan?.days[currentDayIndex] ?? null;
  const doneTasks = currentDay ? currentDay.tasks.filter(t => checkedTasks.includes(t)).length : 0;
  const totalTasks = currentDay?.tasks.length ?? 0;
  const dayProgress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalDone = plan?.days.reduce((acc, d) => acc + d.tasks.filter(t => checkedTasks.includes(t)).length, 0) ?? 0;
  const totalAllTasks = plan?.days.reduce((acc, d) => acc + d.tasks.length, 0) ?? 1;
  const progress = Math.round((totalDone / totalAllTasks) * 100);

  const streak = (() => {
    if (!plan) return 0;
    let s = 0;
    for (const day of plan.days) {
      if (day.tasks.every(t => checkedTasks.includes(t))) s++;
      else break;
    }
    return s;
  })();

  // Descobrir em qual semana estamos (grupos de 7 dias)
  const weekNum = Math.floor(currentDayIndex / 7) + 1;

  const metrics = [
    { label: "Streak", value: streak > 0 ? `${streak} dias 🔥` : "0 dias", sub: "em sequência" },
    { label: "Progresso", value: plan ? `${progress}%` : "—", sub: "do plano concluído", showBar: true, barValue: progress },
    { label: "Dia atual", value: plan ? `${currentDayIndex + 1} de ${plan.days.length}` : "—", sub: "dias no plano" },
    { label: "Tarefas feitas", value: plan ? `${doneTasks}/${totalTasks}` : "—", sub: "hoje" },
  ];

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
          Olá, {user?.firstName} 🚀
        </h1>
        <p style={{ fontSize: "13px", color: "#555", textTransform: "capitalize" }}>{today}</p>
      </div>

      {/* Stat cards */}
      <div className="metrics-grid" style={{ marginBottom: "1.5rem" }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: "#161616", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px", padding: "1.25rem 1.5rem",
          }}>
            <p style={{ fontSize: "11px", color: "#555", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{m.label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: "6px" }}>{m.value}</p>
            {m.showBar && (
              <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", margin: "8px 0" }}>
                <div style={{ height: "3px", width: `${m.barValue ?? 0}%`, background: "#f97316", borderRadius: "2px", transition: "width 0.4s ease" }} />
              </div>
            )}
            <p style={{ fontSize: "11px", color: "#444" }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Tarefas de hoje */}
      {currentDay && (
        <div style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden", marginBottom: "1.5rem" }}>
          {/* Card header */}
          <div style={{ padding: "1.25rem 1.5rem 0" }}>
            <p style={{ fontSize: "10px", color: "#f97316", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "4px" }}>
              Semana {weekNum} — {plan?.planTitle ?? ""}
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                Dia {currentDayIndex + 1} — {currentDay.title}
              </h2>
              <span style={{ fontSize: "11px", color: "#444" }}>{doneTasks}/{totalTasks} feitas</span>
            </div>
          </div>

          {/* Task rows */}
          <div style={{ padding: "0 1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {currentDay.tasks.map((task) => {
                const done = checkedTasks.includes(task);
                return (
                  <div
                    key={task}
                    onClick={() => toggleTask(task)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 12px", borderRadius: "10px",
                      background: done ? "rgba(249,115,22,0.04)" : "#1e1e1e",
                      border: `1px solid ${done ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.05)"}`,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {/* Checkbox quadrado */}
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                      border: done ? "none" : "1.5px solid #374151",
                      background: done ? "#f97316" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}>
                      {done && <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{
                      fontSize: "13px", color: done ? "#444" : "#ccc",
                      textDecoration: done ? "line-through" : "none", flex: 1, lineHeight: 1.4,
                    }}>
                      {task}
                    </span>
                    {done && (
                      <span style={{
                        fontSize: "10px", fontWeight: 600, color: "#f97316",
                        background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
                        borderRadius: "4px", padding: "2px 8px", flexShrink: 0,
                      }}>feito</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress bar rodapé */}
          <div style={{ padding: "1rem 1.5rem 1.25rem" }}>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "12px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: "#555" }}>Progresso do dia</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#f97316" }}>{dayProgress}%</span>
            </div>
            <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
              <div style={{ height: "3px", width: `${dayProgress}%`, background: "#f97316", borderRadius: "2px", transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>
      )}

      {/* Sem plano */}
      {!plan && (
        <div style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "#555", marginBottom: "12px" }}>Você ainda não tem um plano gerado.</p>
          <button
            onClick={() => navigate("/app")}
            style={{ padding: "10px 24px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
          >
            Criar meu plano →
          </button>
        </div>
      )}

      {/* Agente IA */}
      <div style={{
        background: "#161616", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px",
        padding: "1.5rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
      }}>
        <div>
          <p style={{ fontSize: "10px", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px", fontWeight: 700 }}>Agente IA</p>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Tem alguma dúvida sobre seu plano?</h3>
          <p style={{ fontSize: "13px", color: "#555" }}>O agente está disponível pra te ajudar agora.</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/agente")}
          style={{
            padding: "10px 20px", background: "#f97316", border: "none",
            borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
          onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
        >
          Conversar →
        </button>
      </div>
    </div>
  );
}
