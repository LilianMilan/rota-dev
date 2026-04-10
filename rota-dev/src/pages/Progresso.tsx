const SEMANAS = [
  { semana: "Sem 1", tarefas: 6, meta: 6 },
  { semana: "Sem 2", tarefas: 5, meta: 6 },
  { semana: "Sem 3", tarefas: 4, meta: 6 },
  { semana: "Sem 4", tarefas: 7, meta: 6 },
];

const STATS = [
  { label: "Dias concluídos", value: "22" },
  { label: "Tarefas feitas", value: "47" },
  { label: "Streak atual", value: "7 🔥" },
  { label: "Melhor streak", value: "12 🏆" },
];

export default function Progresso() {
  const maxTarefas = Math.max(...SEMANAS.map(s => s.tarefas));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Progresso</h1>
        <p style={{ fontSize: "13px", color: "#555" }}>Sua evolução nas últimas semanas.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "2rem" }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            background: "#111", border: "1px solid #1e1e1e",
            borderRadius: "14px", padding: "1.25rem",
          }}>
            <p style={{ fontSize: "11px", color: "#555", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#fff" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de barras */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "1.5rem" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "1.5rem" }}>Tarefas por semana</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "140px" }}>
          {SEMANAS.map((s) => {
            const pct = (s.tarefas / maxTarefas) * 100;
            const acimaMeta = s.tarefas >= s.meta;
            return (
              <div key={s.semana} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontSize: "11px", color: acimaMeta ? "#f97316" : "#555", fontWeight: 600 }}>{s.tarefas}</span>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100px" }}>
                  <div style={{
                    width: "100%",
                    height: `${pct}%`,
                    background: acimaMeta ? "#f97316" : "#1e1e1e",
                    border: `1px solid ${acimaMeta ? "rgba(249,115,22,0.4)" : "#2a2a2a"}`,
                    borderRadius: "6px 6px 0 0",
                    transition: "height 0.3s ease",
                    minHeight: "8px",
                  }} />
                </div>
                <span style={{ fontSize: "11px", color: "#444" }}>{s.semana}</span>
              </div>
            );
          })}
        </div>

        {/* Legenda meta */}
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "3px", background: "#f97316", borderRadius: "2px" }} />
          <span style={{ fontSize: "11px", color: "#555" }}>Meta: 6 tarefas/semana</span>
        </div>
      </div>
    </div>
  );
}
