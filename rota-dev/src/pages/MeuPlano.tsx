import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import type { StudyPlan, PlanDay } from "../features/onboarding/types/onboarding";
import { useProStatus } from "../contexts/ProStatusContext";

const PROGRESS_KEY = (title: string) => `rota-dev-progress:${title}`;
const FREE_DAY_LIMIT = 7;

type PlanRow = {
  id: string;
  content: { plan: StudyPlan; checkedTasks: string[] };
  created_at: string;
};

function DayCard({
  day, locked, checkedTasks, onToggle,
}: {
  day: PlanDay; locked: boolean; checkedTasks: string[]; onToggle: (task: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const completedCount = day.tasks.filter(t => checkedTasks.includes(t)).length;
  const allDone = completedCount === day.tasks.length;

  return (
    <div style={{
      background: locked ? "#0e0e0e" : "#111",
      border: `1px solid ${allDone ? "rgba(249,115,22,0.3)" : locked ? "#161616" : "#1e1e1e"}`,
      borderRadius: "14px", overflow: "hidden", opacity: locked ? 0.45 : 1,
    }}>
      <button
        onClick={() => !locked && setExpanded(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "12px",
          padding: "1rem 1.25rem", background: "transparent", border: "none",
          cursor: locked ? "not-allowed" : "pointer", textAlign: "left",
        }}
      >
        <div style={{
          width: "32px", height: "32px", borderRadius: "9px", flexShrink: 0,
          background: "#1a1a1a", border: `1px solid ${allDone ? "#f97316" : "#2a2a2a"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: 700, color: allDone ? "#f97316" : "#444",
        }}>
          {allDone ? "✓" : day.day}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: locked ? "#333" : "#fff", marginBottom: "2px" }}>
            Dia {day.day} — {day.title}
          </p>
          <p style={{ fontSize: "11px", color: "#555" }}>{completedCount}/{day.tasks.length} tarefas concluídas</p>
        </div>
        <div style={{ width: "60px", height: "4px", background: "#1e1e1e", borderRadius: "4px", flexShrink: 0 }}>
          <div style={{ height: "4px", borderRadius: "4px", background: "#f97316", width: `${day.tasks.length ? (completedCount / day.tasks.length) * 100 : 0}%`, transition: "width 0.3s" }} />
        </div>
        {locked ? (
          <span style={{ fontSize: "14px", color: "#333" }}>🔒</span>
        ) : (
          <span style={{ fontSize: "12px", color: "#444", display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
        )}
      </button>

      {expanded && !locked && (
        <div style={{ padding: "0 1.25rem 1.25rem" }}>
          {day.description && <p style={{ fontSize: "13px", color: "#666", marginBottom: "1rem", lineHeight: 1.6 }}>{day.description}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {day.tasks.map((task) => {
              const checked = checkedTasks.includes(task);
              return (
                <div key={task} onClick={() => onToggle(task)} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "10px",
                  background: checked ? "rgba(249,115,22,0.04)" : "#161616",
                  border: `1px solid ${checked ? "rgba(249,115,22,0.2)" : "#1e1e1e"}`,
                  cursor: "pointer",
                }}>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${checked ? "#f97316" : "#2a2a2a"}`,
                    background: checked ? "#f97316" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {checked && <span style={{ color: "#fff", fontSize: "10px" }}>✓</span>}
                  </div>
                  <span style={{ fontSize: "13px", flex: 1, color: checked ? "#555" : "#ccc", textDecoration: checked ? "line-through" : "none" }}>
                    {task}
                  </span>
                  {checked && <span style={{ fontSize: "10px", fontWeight: 600, color: "#f97316", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "4px", padding: "2px 8px" }}>feito</span>}
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
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: user.id, email: user.primaryEmailAddress?.emailAddress }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally { setLoading(false); }
  }

  return (
    <div style={{ background: "linear-gradient(135deg, #111 0%, #1a0f00 100%)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "16px", padding: "2rem", textAlign: "center", marginTop: "1rem" }}>
      <p style={{ fontSize: "20px", marginBottom: "8px" }}>🔒</p>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Desbloqueie o plano completo</h3>
      <p style={{ fontSize: "13px", color: "#888", marginBottom: "1.5rem", lineHeight: 1.6 }}>
        No plano Pro você acessa todos os dias da trilha, agente IA, progresso salvo na nuvem e muito mais.
      </p>
      <button onClick={handleSubscribe} disabled={loading} style={{ padding: "12px 28px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Aguarde..." : "Assinar Pro — R$12,90/mês"}
      </button>
    </div>
  );
}

export default function MeuPlano() {
  const { isPro } = useProStatus();
  const { user } = useUser();
  const [allPlans, setAllPlans] = useState<PlanRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<string[]>([]);

  const selectedRow = allPlans.find(r => r.id === selectedId) ?? allPlans[0] ?? null;
  const plan = selectedRow?.content?.plan ?? null;

  useEffect(() => {
    async function load() {
      if (isPro && user) {
        try {
          const res = await fetch(`/api/get-plan?clerk_id=${user.id}`);
          if (res.ok) {
            const rows = await res.json() as PlanRow[];
            if (rows.length > 0) {
              setAllPlans(rows);
              setSelectedId(rows[0].id);
              setCheckedTasks(Array.isArray(rows[0].content.checkedTasks) ? rows[0].content.checkedTasks : []);
              return;
            }
          }
        } catch { /* fallback */ }
      }
      // Free ou fallback
      try {
        const raw = localStorage.getItem("rota-dev-plan");
        if (raw) {
          const p = JSON.parse(raw) as StudyPlan;
          const fakeRow: PlanRow = { id: "local", content: { plan: p, checkedTasks: [] }, created_at: new Date().toISOString() };
          const progressRaw = localStorage.getItem(PROGRESS_KEY(p.planTitle));
          if (progressRaw) { const parsed = JSON.parse(progressRaw); fakeRow.content.checkedTasks = Array.isArray(parsed) ? parsed : []; }
          setAllPlans([fakeRow]);
          setSelectedId("local");
          setCheckedTasks(fakeRow.content.checkedTasks);
        }
      } catch { /* ignore */ }
    }
    void load();
  }, [isPro, user?.id]);

  // Atualiza checkedTasks ao trocar de plano
  useEffect(() => {
    if (!selectedRow) return;
    setCheckedTasks(Array.isArray(selectedRow.content.checkedTasks) ? selectedRow.content.checkedTasks : []);
  }, [selectedId]);

  function toggleTask(task: string) {
    if (!plan || !selectedRow) return;
    setCheckedTasks(prev => {
      const next = prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task];
      localStorage.setItem(PROGRESS_KEY(plan.planTitle), JSON.stringify(next));
      if (isPro && user && selectedRow.id !== "local") {
        void fetch("/api/save-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerk_id: user.id, plan_id: selectedRow.id, checkedTasks: next }),
        });
      }
      return next;
    });
  }

  if (!plan) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: "12px" }}>
        <span style={{ fontSize: "32px" }}>📋</span>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>Nenhum plano gerado ainda</h2>
        <p style={{ fontSize: "13px", color: "#666" }}>Responda o questionário para gerar sua trilha personalizada.</p>
        <button onClick={() => window.location.href = "/app"} style={{ marginTop: "8px", padding: "10px 24px", background: "#f97316", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          Criar meu plano →
        </button>
      </div>
    );
  }

  const visibleDays = isPro ? plan.days : plan.days.slice(0, FREE_DAY_LIMIT);
  const lockedDays  = isPro ? [] : plan.days.slice(FREE_DAY_LIMIT);
  const totalDone   = plan.days.reduce((acc, d) => acc + d.tasks.filter(t => checkedTasks.includes(t)).length, 0);
  const totalTasks  = plan.days.reduce((acc, d) => acc + d.tasks.length, 0);
  const globalProgress = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Meu Plano</h1>
          <p style={{ fontSize: "13px", color: "#666" }}>{plan.planTitle}</p>
        </div>
        {isPro && (
          <button onClick={() => window.location.href = "/app?regenerar=true"} style={{ padding: "8px 16px", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "10px", color: "#f97316", fontSize: "12px", cursor: "pointer" }}>
            🔄 Novo plano
          </button>
        )}
      </div>

      {/* Cards de planos anteriores — só Pro com mais de 1 plano */}
      {isPro && allPlans.length > 1 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Seus planos</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {allPlans.map((row, i) => {
              const p = row.content.plan;
              const ct = Array.isArray(row.content.checkedTasks) ? row.content.checkedTasks : [];
              const done = p.days.reduce((acc, d) => acc + d.tasks.filter(t => ct.includes(t)).length, 0);
              const total = p.days.reduce((acc, d) => acc + d.tasks.length, 0);
              const pct = total ? Math.round((done / total) * 100) : 0;
              const active = row.id === (selectedId ?? allPlans[0]?.id);
              const date = new Date(row.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

              return (
                <button key={row.id} onClick={() => setSelectedId(row.id)} style={{
                  background: active ? "rgba(249,115,22,0.08)" : "#111",
                  border: `1px solid ${active ? "rgba(249,115,22,0.4)" : "#1e1e1e"}`,
                  borderRadius: "12px", padding: "12px 16px", cursor: "pointer",
                  textAlign: "left", minWidth: "160px", maxWidth: "220px", transition: "all 0.15s",
                }}>
                  <p style={{ fontSize: "11px", color: active ? "#f97316" : "#555", marginBottom: "4px" }}>
                    {i === 0 ? "Atual" : date}
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: active ? "#fff" : "#888", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.planTitle}
                  </p>
                  <div style={{ height: "3px", background: "#1e1e1e", borderRadius: "3px" }}>
                    <div style={{ height: "3px", width: `${pct}%`, background: active ? "#f97316" : "#333", borderRadius: "3px" }} />
                  </div>
                  <p style={{ fontSize: "10px", color: "#555", marginTop: "4px" }}>{pct}% concluído</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Progresso geral */}
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
        {visibleDays.map(day => <DayCard key={day.day} day={day} locked={false} checkedTasks={checkedTasks} onToggle={toggleTask} />)}
        {lockedDays.map(day => <DayCard key={day.day} day={day} locked={true} checkedTasks={[]} onToggle={() => {}} />)}
      </div>

      {!isPro && <ProBanner />}
    </div>
  );
}
