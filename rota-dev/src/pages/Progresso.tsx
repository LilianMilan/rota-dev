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

  const weeks: { semana: string; tarefas: number; meta: number }[] = [];
  const chunkSize = 7;
  for (let i = 0; i < plan.days.length; i += chunkSize) {
    const chunk = plan.days.slice(i, i + chunkSize);
    const tarefasFeitas = chunk.reduce((acc, d) => acc + d.tasks.filter(t => checkedTasks.includes(t)).length, 0);
    const meta = chunk.reduce((acc, d) => acc + d.tasks.length, 0);
    weeks.push({ semana: `Sem ${Math.floor(i / chunkSize) + 1}`, tarefas: tarefasFeitas, meta });
  }

  let streak = 0;
  for (const day of plan.days) {
    if (day.tasks.every(t => checkedTasks.includes(t))) streak++;
    else break;
  }

  return { totalTasks, doneTasks, daysDone, weeks, streak };
}

const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

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
      <button
        onClick={() => window.location.href = "/app"}
        style={{ marginTop: "8px", padding: "10px 24px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
      >
        Criar meu plano →
      </button>
    </div>
  );

  const { totalTasks, doneTasks, daysDone, weeks, streak } = calcStats(plan, checkedTasks);
  const totalDays = plan.days.length;
  const globalPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const maxTarefas = Math.max(...weeks.map(w => w.tarefas), 1);

  // Atividade da semana: domingo = índice 0 no JS
  const todayDow = new Date().getDay(); // 0=Dom, 6=Sáb
  // Reordena para começar na segunda (índice 1) e terminar no domingo (0)
  // ordem visual: S T Q Q S S D = índices JS: 1,2,3,4,5,6,0
  const weekOrder = [1, 2, 3, 4, 5, 6, 0];
  const weekLabels = ["S", "T", "Q", "Q", "S", "S", "D"];
  // Dias com atividade: simulamos com base em tarefas feitas (placeholder real seria timestamps)
  // Por hora, marcamos o dia atual se tiver tarefas feitas hoje
  const hasActivityToday = doneTasks > 0;

  const STATS = [
    { label: "Dias concluídos", value: `${daysDone}/${totalDays}`, highlight: false },
    { label: "Tarefas feitas", value: `${doneTasks}`, highlight: false },
    { label: "Streak atual", value: streak > 0 ? `${streak} dias 🦊` : "0 dias", highlight: false },
    { label: "Progresso geral", value: `${globalPct}%`, highlight: true },
  ];

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Progresso</h1>
        <p style={{ fontSize: "13px", color: "#555" }}>
          Sua evolução em{" "}
          <span style={{ color: "#f97316", fontWeight: 500 }}>{plan.planTitle}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid-4" style={{ marginBottom: "1.25rem" }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            background: "#161616",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
          }}>
            <p style={{ fontSize: "11px", color: "#555", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {s.label}
            </p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: s.highlight ? "#f97316" : "#fff", lineHeight: 1 }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Progresso total */}
      <div style={{
        background: "#161616",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.25rem",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", color: "#888", fontWeight: 500 }}>Progresso total do plano</span>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#f97316" }}>{globalPct}%</span>
        </div>
        <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "6px" }}>
          <div style={{ height: "6px", width: `${globalPct}%`, background: "#f97316", borderRadius: "6px", transition: "width 0.5s ease" }} />
        </div>
        <p style={{ fontSize: "11px", color: "#3a3a3a", marginTop: "8px" }}>
          {doneTasks} de {totalTasks} tarefas concluídas
        </p>
      </div>

      {/* Gráfico + Atividade da semana */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

        {/* Tarefas por semana */}
        {weeks.length > 0 && (
          <div style={{
            background: "#161616",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
          }}>
            <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "1.5rem" }}>Tarefas por semana</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "120px" }}>
              {weeks.slice(0, 4).map((w) => {
                const filled = w.tarefas > 0;
                const barHeight = filled ? Math.max((w.tarefas / maxTarefas) * 100, 16) : 4;
                return (
                  <div key={w.semana} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                    {/* Valor acima */}
                    <span style={{ fontSize: "11px", fontWeight: 600, color: filled ? "#f97316" : "#333", marginBottom: "6px" }}>
                      {w.tarefas}
                    </span>
                    {/* Barra */}
                    <div style={{ width: "100%", height: "100px", display: "flex", alignItems: "flex-end" }}>
                      <div style={{
                        width: "100%",
                        height: `${barHeight}px`,
                        background: filled ? "rgba(249,115,22,0.35)" : "#1f1f1f",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.4s ease",
                        minHeight: "4px",
                      }} />
                    </div>
                    {/* Divisor + label */}
                    <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.06)", margin: "6px 0 4px" }} />
                    <span style={{ fontSize: "11px", color: "#444" }}>{w.semana}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Atividade da semana */}
        <div style={{
          background: "#161616",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
        }}>
          <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "1.5rem" }}>Atividade da semana</h2>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {weekOrder.map((dow, i) => {
              const isToday = dow === todayDow;
              const hasActivity = isToday && hasActivityToday;

              let bg = "#1f1f1f";
              let border = "1px solid transparent";
              let color = "#444";

              if (isToday) {
                bg = "rgba(249,115,22,0.25)";
                border = "1px solid rgba(249,115,22,0.4)";
                color = "#f97316";
              } else if (hasActivity) {
                bg = "rgba(249,115,22,0.15)";
                color = "#fb923c";
              }

              return (
                <div key={i} style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  background: bg,
                  border,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                  color,
                }}>
                  {weekLabels[i]}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: "11px", color: "#3a3a3a", marginTop: "1rem" }}>
            {hasActivityToday ? "Você estudou hoje 🦊" : "Nenhuma atividade hoje ainda"}
          </p>
        </div>
      </div>
    </div>
  );
}
