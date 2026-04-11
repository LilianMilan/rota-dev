import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import type { StudyPlan } from "../features/onboarding/types/onboarding";
import { useProStatus } from "../contexts/ProStatusContext";

type PlanRow = {
  id: string;
  content: { plan: StudyPlan; checkedTasks: string[] };
  created_at: string;
};

function calcStats(plan: StudyPlan, checkedTasks: string[]) {
  const totalTasks = plan.days.reduce((acc, d) => acc + d.tasks.length, 0);
  const doneTasks = plan.days.reduce((acc, d) => acc + d.tasks.filter(t => checkedTasks.includes(t)).length, 0);
  const daysDone = plan.days.filter(d => d.tasks.every(t => checkedTasks.includes(t))).length;

  // Calcula semanas agrupando dias do plano em grupos de 7
  const weeks: { semana: string; tarefas: number; meta: number }[] = [];
  const chunkSize = 7;
  for (let i = 0; i < plan.days.length; i += chunkSize) {
    const chunk = plan.days.slice(i, i + chunkSize);
    const tarefasFeitas = chunk.reduce((acc, d) => acc + d.tasks.filter(t => checkedTasks.includes(t)).length, 0);
    const meta = chunk.reduce((acc, d) => acc + d.tasks.length, 0);
    weeks.push({ semana: `Sem ${Math.floor(i / chunkSize) + 1}`, tarefas: tarefasFeitas, meta });
  }

  // Streak: dias consecutivos concluídos do início
  let streak = 0;
  for (const day of plan.days) {
    if (day.tasks.every(t => checkedTasks.includes(t))) streak++;
    else break;
  }

  return { totalTasks, doneTasks, daysDone, weeks, streak };
}

export default function Progresso() {
  const { user } = useUser();
  const { isPro } = useProStatus();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (isPro && user) {
        try {
          const res = await fetch(`/api/get-plan?clerk_id=${user.id}`);
          if (res.ok) {
            const rows = await res.json() as PlanRow[];
            if (rows.length > 0) {
              setPlan(rows[0].content.plan);
              setCheckedTasks(Array.isArray(rows[0].content.checkedTasks) ? rows[0].content.checkedTasks : []);
              setLoading(false);
              return;
            }
          }
        } catch { /* fallback */ }
      }
      try {
        const raw = localStorage.getItem("rota-dev-plan");
        if (raw) {
          const p = JSON.parse(raw) as StudyPlan;
          setPlan(p);
          const key = `rota-dev-progress:${p.planTitle}`;
          const progressRaw = localStorage.getItem(key);
          if (progressRaw) {
            const parsed = JSON.parse(progressRaw);
            setCheckedTasks(Array.isArray(parsed) ? parsed : []);
          }
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    void load();
  }, [isPro, user?.id]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
      <div style={{ width: "28px", height: "28px", border: "3px solid #1e1e1e", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!plan) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: "12px" }}>
      <span style={{ fontSize: "32px" }}>📈</span>
      <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>Nenhum progresso ainda</h2>
      <p style={{ fontSize: "13px", color: "#666" }}>Gere um plano e comece a marcar tarefas para ver sua evolução.</p>
      <button onClick={() => window.location.href = "/app"} style={{ marginTop: "8px", padding: "10px 24px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
        Criar meu plano →
      </button>
    </div>
  );

  const { totalTasks, doneTasks, daysDone, weeks, streak } = calcStats(plan, checkedTasks);
  const totalDays = plan.days.length;
  const globalPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const maxTarefas = Math.max(...weeks.map(w => w.meta), 1);

  const STATS = [
    { label: "Dias concluídos", value: `${daysDone}/${totalDays}` },
    { label: "Tarefas feitas", value: `${doneTasks}` },
    { label: "Streak atual", value: streak > 0 ? `${streak} 🔥` : "0" },
    { label: "Progresso geral", value: `${globalPct}%` },
  ];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Progresso</h1>
        <p style={{ fontSize: "13px", color: "#555" }}>Sua evolução em <span style={{ color: "#888" }}>{plan.planTitle}</span></p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "2rem" }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "1.25rem" }}>
            <p style={{ fontSize: "11px", color: "#555", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#fff" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Barra de progresso geral */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", color: "#888" }}>Progresso total do plano</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#f97316" }}>{globalPct}%</span>
        </div>
        <div style={{ height: "8px", background: "#1e1e1e", borderRadius: "8px" }}>
          <div style={{ height: "8px", width: `${globalPct}%`, background: "#f97316", borderRadius: "8px", transition: "width 0.5s ease" }} />
        </div>
        <p style={{ fontSize: "11px", color: "#555", marginTop: "6px" }}>{doneTasks} de {totalTasks} tarefas concluídas</p>
      </div>

      {/* Gráfico por semana */}
      {weeks.length > 0 && (
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "1.5rem" }}>Tarefas por semana</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "140px" }}>
            {weeks.map((w) => {
              const pct = (w.tarefas / maxTarefas) * 100;
              const acimaMeta = w.tarefas >= w.meta;
              return (
                <div key={w.semana} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "11px", color: w.tarefas > 0 ? (acimaMeta ? "#f97316" : "#888") : "#333", fontWeight: 600 }}>
                    {w.tarefas}
                  </span>
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100px" }}>
                    <div style={{
                      width: "100%", height: `${Math.max(pct, w.tarefas > 0 ? 4 : 0)}%`,
                      background: acimaMeta ? "#f97316" : w.tarefas > 0 ? "#2a2a2a" : "#1a1a1a",
                      border: `1px solid ${acimaMeta ? "rgba(249,115,22,0.4)" : "#2a2a2a"}`,
                      borderRadius: "6px 6px 0 0", transition: "height 0.4s ease",
                      minHeight: "4px",
                    }} />
                  </div>
                  <span style={{ fontSize: "11px", color: "#444" }}>{w.semana}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "12px", height: "3px", background: "#f97316", borderRadius: "2px" }} />
            <span style={{ fontSize: "11px", color: "#555" }}>Meta: todas as tarefas da semana</span>
          </div>
        </div>
      )}
    </div>
  );
}
