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
  day, locked, checkedTasks, onToggle, isCurrentDay,
}: {
  day: PlanDay; locked: boolean; checkedTasks: string[]; onToggle: (task: string) => void; isCurrentDay: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const completedCount = day.tasks.filter(t => checkedTasks.includes(t)).length;
  const allDone = completedCount === day.tasks.length && day.tasks.length > 0;
  const pct = day.tasks.length ? Math.round((completedCount / day.tasks.length) * 100) : 0;
  const active = isCurrentDay && !locked;

  return (
    <div
      style={{
        background: active ? "rgba(249,115,22,0.04)" : locked ? "rgba(255,255,255,0.01)" : "#161616",
        border: `0.5px solid ${active ? "rgba(249,115,22,0.35)" : allDone ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "12px", overflow: "hidden",
        opacity: locked ? 0.4 : 1,
        transition: "border-color 0.2s",
      }}
      onMouseEnter={e => { if (!locked && !active) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(249,115,22,0.2)"; }}
      onMouseLeave={e => { if (!locked && !active) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
    >
      <button
        onClick={() => !locked && setExpanded(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "14px",
          padding: "14px 16px", background: "transparent", border: "none",
          cursor: locked ? "not-allowed" : "pointer", textAlign: "left",
        }}
      >
        {/* Número do dia */}
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
          background: active ? "rgba(249,115,22,0.15)" : "#1f1f1f",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: 700,
          color: active ? "#f97316" : allDone ? "#f97316" : "#444",
        }}>
          {allDone ? "✓" : day.day}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: locked ? "#333" : "#fff", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {day.title}
          </p>
          <p style={{ fontSize: "11px", color: "#555" }}>{completedCount}/{day.tasks.length} tarefas concluídas</p>
        </div>

        {/* Barra de progresso + seta */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {!locked && (
            <div style={{ width: "80px", height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
              <div style={{ height: "3px", width: `${pct}%`, background: "#f97316", borderRadius: "2px", transition: "width 0.3s" }} />
            </div>
          )}
          {locked ? (
            <span style={{ fontSize: "13px", color: "#2a2a2a" }}>🔒</span>
          ) : (
            <span style={{ fontSize: "14px", color: active ? "#f97316" : "#333", transition: "transform 0.2s", display: "inline-block", transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
          )}
        </div>
      </button>

      {expanded && !locked && (
        <div style={{ padding: "0 16px 16px" }}>
          {day.description && (
            <p style={{ fontSize: "12px", color: "#555", marginBottom: "12px", lineHeight: 1.6 }}>{day.description}</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {day.tasks.map((task) => {
              const checked = checkedTasks.includes(task);
              return (
                <div key={task} onClick={() => onToggle(task)} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "9px 12px", borderRadius: "8px",
                  background: checked ? "rgba(249,115,22,0.04)" : "#1e1e1e",
                  border: `0.5px solid ${checked ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.05)"}`,
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{
                    width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                    border: checked ? "none" : "1.5px solid #374151",
                    background: checked ? "#f97316" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {checked && <span style={{ color: "#fff", fontSize: "9px", fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: "12px", flex: 1, color: checked ? "#4b5563" : "#ccc", textDecoration: checked ? "line-through" : "none" }}>
                    {task}
                  </span>
                  {checked && (
                    <span style={{ fontSize: "10px", fontWeight: 600, color: "#f97316", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "4px", padding: "2px 7px" }}>feito</span>
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
    <div style={{ background: "#161616", border: "0.5px solid rgba(249,115,22,0.3)", borderRadius: "12px", padding: "1.75rem", textAlign: "center", marginTop: "8px" }}>
      <p style={{ fontSize: "18px", marginBottom: "8px" }}>🔒</p>
      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>Desbloqueie o plano completo</h3>
      <p style={{ fontSize: "12px", color: "#555", marginBottom: "1.25rem", lineHeight: 1.6 }}>
        No Pro você acessa todos os dias, agente IA e progresso salvo na nuvem.
      </p>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{ padding: "10px 24px", background: "#f97316", border: "none", borderRadius: "9px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "background 0.2s" }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#fb923c"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#f97316"; }}
      >
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
        <span style={{ fontSize: "28px" }}>📋</span>
        <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#fff" }}>Nenhum plano gerado ainda</h2>
        <p style={{ fontSize: "13px", color: "#555" }}>Responda o questionário para gerar sua trilha personalizada.</p>
        <button
          onClick={() => window.location.href = "/app"}
          style={{ marginTop: "8px", padding: "10px 24px", background: "#f97316", border: "none", borderRadius: "9px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#fb923c")}
          onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
        >
          Criar meu plano →
        </button>
      </div>
    );
  }

  const totalDone = plan.days.reduce((acc, d) => acc + d.tasks.filter(t => checkedTasks.includes(t)).length, 0);
  const totalTasks = plan.days.reduce((acc, d) => acc + d.tasks.length, 0);
  const globalProgress = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

  // Dia atual = primeiro dia com tarefas incompletas
  const currentDayIndex = plan.days.findIndex(d => d.tasks.some(t => !checkedTasks.includes(t)));
  const activeDayNum = currentDayIndex >= 0 ? plan.days[currentDayIndex].day : plan.days[plan.days.length - 1]?.day;

  const visibleDays = isPro ? plan.days : plan.days.slice(0, FREE_DAY_LIMIT);
  const lockedDays = isPro ? [] : plan.days.slice(FREE_DAY_LIMIT);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Meu Plano</h1>
          <p style={{ fontSize: "13px", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "320px" }}>{plan.planTitle}</p>
        </div>
        {isPro && (
          <button
            onClick={() => window.location.href = "/app?regenerar=true"}
            style={{ padding: "8px 14px", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: "9px", color: "#f97316", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(249,115,22,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(249,115,22,0.1)"; }}
          >
            ＋ Novo plano
          </button>
        )}
      </div>

      {/* Chips de planos — só Pro com mais de 1 plano */}
      {isPro && allPlans.length > 1 && (
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px", fontWeight: 600 }}>Seus planos</p>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
            {allPlans.map((row, i) => {
              const p = row.content.plan;
              const ct = Array.isArray(row.content.checkedTasks) ? row.content.checkedTasks : [];
              const done = p.days.reduce((acc, d) => acc + d.tasks.filter(t => ct.includes(t)).length, 0);
              const total = p.days.reduce((acc, d) => acc + d.tasks.length, 0);
              const pct = total ? Math.round((done / total) * 100) : 0;
              const active = row.id === (selectedId ?? allPlans[0]?.id);
              const date = new Date(row.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

              return (
                <button
                  key={row.id}
                  onClick={() => setSelectedId(row.id)}
                  style={{
                    background: active ? "rgba(249,115,22,0.06)" : "#161616",
                    border: `0.5px solid ${active ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: "10px", padding: "12px 14px", cursor: "pointer",
                    textAlign: "left", minWidth: "160px", flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                >
                  <p style={{ fontSize: "10px", color: active ? "#f97316" : "#555", marginBottom: "4px", fontWeight: 600 }}>
                    {i === 0 ? "Atual" : date}
                  </p>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: active ? "#fff" : "#888", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.planTitle}
                  </p>
                  <p style={{ fontSize: "10px", color: "#555", marginBottom: "6px" }}>{pct}% concluído</p>
                  <div style={{ height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "1px" }}>
                    <div style={{ height: "2px", width: `${pct}%`, background: active ? "#f97316" : "#333", borderRadius: "1px" }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Progresso geral */}
      <div style={{ background: "#161616", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "18px 22px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", color: "#888" }}>Progresso geral</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#f97316" }}>{globalProgress}%</span>
        </div>
        <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
          <div style={{ height: "5px", width: `${globalProgress}%`, background: "#f97316", borderRadius: "3px", transition: "width 0.4s ease" }} />
        </div>
        <p style={{ fontSize: "11px", color: "#444", marginTop: "8px" }}>{totalDone} de {totalTasks} tarefas concluídas</p>
      </div>

      {/* Lista de dias */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {visibleDays.map(day => (
          <DayCard
            key={day.day}
            day={day}
            locked={false}
            checkedTasks={checkedTasks}
            onToggle={toggleTask}
            isCurrentDay={day.day === activeDayNum}
          />
        ))}
        {lockedDays.map(day => (
          <DayCard
            key={day.day}
            day={day}
            locked={true}
            checkedTasks={[]}
            onToggle={() => {}}
            isCurrentDay={false}
          />
        ))}
      </div>

      {!isPro && <ProBanner />}
    </div>
  );
}
