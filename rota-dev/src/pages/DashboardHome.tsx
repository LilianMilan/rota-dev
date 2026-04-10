import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import type { StudyPlan } from "../features/onboarding/types/onboarding";

const PROGRESS_KEY = (title: string) => `rota-dev-progress:${title}`;

export default function DashboardHome() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<string[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rota-dev-plan");
      if (raw) {
        const p = JSON.parse(raw) as StudyPlan;
        setPlan(p);
        const progress = localStorage.getItem(PROGRESS_KEY(p.planTitle));
        if (progress) setCheckedTasks(JSON.parse(progress));

        // Descobre o primeiro dia com tarefas incompletas
        const firstIncomplete = p.days.findIndex(d =>
          d.tasks.some(t => !(JSON.parse(progress ?? "[]") as string[]).includes(t))
        );
        setCurrentDayIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
      }
    } catch { /* ignore */ }
  }, []);

  function toggleTask(task: string) {
    if (!plan) return;
    setCheckedTasks(prev => {
      const next = prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task];
      localStorage.setItem(PROGRESS_KEY(plan.planTitle), JSON.stringify(next));
      return next;
    });
  }

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  const currentDay = plan?.days[currentDayIndex] ?? null;
  const doneTasks = currentDay ? currentDay.tasks.filter(t => checkedTasks.includes(t)).length : 0;
  const totalTasks = currentDay?.tasks.length ?? 0;

  const totalDone = plan?.days.reduce((acc, d) => acc + d.tasks.filter(t => checkedTasks.includes(t)).length, 0) ?? 0;
  const totalAllTasks = plan?.days.reduce((acc, d) => acc + d.tasks.length, 0) ?? 1;
  const progress = Math.round((totalDone / totalAllTasks) * 100);

  const metrics = [
    { label: "Streak", value: "7 dias 🔥", sub: "em sequência" },
    { label: "Progresso", value: plan ? `${progress}%` : "—", sub: "do plano concluído", progress: true, progressValue: progress },
    { label: "Dia atual", value: plan ? `${currentDayIndex + 1} de ${plan.days.length}` : "—", sub: "dias no plano" },
    { label: "Tarefas feitas", value: plan ? `${doneTasks}/${totalTasks}` : "—", sub: "hoje" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
          Olá, {user?.firstName} 🚀
        </h1>
        <p style={{ fontSize: "13px", color: "#666", textTransform: "capitalize" }}>{today}</p>
      </div>

      <div className="metrics-grid">
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: "#111", border: "1px solid #1e1e1e",
            borderRadius: "14px", padding: "1.75rem",
          }}>
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{m.value}</p>
            {m.progress && (
              <div style={{ height: "4px", background: "#1e1e1e", borderRadius: "4px", margin: "8px 0", width: "100%" }}>
                <div style={{ height: "4px", width: `${m.progressValue ?? 0}%`, background: "#f97316", borderRadius: "4px" }} />
              </div>
            )}
            <p style={{ fontSize: "11px", color: "#666" }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {currentDay && (
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff" }}>Tarefas de hoje</h2>
            <span style={{ fontSize: "12px", color: "#555" }}>Dia {currentDayIndex + 1} — {currentDay.title}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {currentDay.tasks.map((task) => {
              const done = checkedTasks.includes(task);
              return (
                <div
                  key={task}
                  onClick={() => toggleTask(task)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 14px", borderRadius: "10px",
                    background: done ? "rgba(249,115,22,0.04)" : "#161616",
                    border: `1px solid ${done ? "rgba(249,115,22,0.2)" : "#1e1e1e"}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    border: `2px solid ${done ? "#f97316" : "#2a2a2a"}`,
                    background: done ? "#f97316" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.15s",
                  }}>
                    {done && <span style={{ color: "#fff", fontSize: "10px" }}>✓</span>}
                  </div>
                  <span style={{ fontSize: "15px", color: done ? "#444" : "#ccc", textDecoration: done ? "line-through" : "none", flex: 1 }}>
                    {task}
                  </span>
                  {done && (
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

      {!plan && (
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "#555", marginBottom: "12px" }}>Você ainda não tem um plano gerado.</p>
          <button
            onClick={() => navigate("/app")}
            style={{ padding: "10px 24px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Criar meu plano →
          </button>
        </div>
      )}

      <div style={{
        background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px",
        padding: "1.5rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
      }}>
        <div>
          <p style={{ fontSize: "11px", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Agente IA</p>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Tem alguma dúvida sobre seu plano?</h3>
          <p style={{ fontSize: "13px", color: "#888" }}>O agente está disponível pra te ajudar agora.</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/agente")}
          style={{
            padding: "10px 20px", background: "#f97316", border: "none",
            borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "opacity 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Conversar →
        </button>
      </div>
    </div>
  );
}
