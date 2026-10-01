import { useEffect, useState } from "react";

// Prova social da landing: "+N devs já montaram sua rota", com o número
// subindo do 0 ao abrir. N é a contagem exata do banco (sobe a cada cadastro).
// Se a API falhar, o selo não aparece.
const DURATION_MS = 1400;

export default function UserCountBadge() {
  const [target, setTarget] = useState<number | null>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public-stats")
      .then(r => (r.ok ? r.json() : null))
      .then((d: { users?: number } | null) => {
        if (!cancelled && d?.users && d.users >= 10) setTarget(d.users);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (target === null) return;
    // Quem pediu menos movimento no sistema vê o número direto (duração 0).
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : DURATION_MS;
    let frame = 0;
    const start = performance.now();
    function tick(now: number) {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // desacelera no final
      setShown(Math.round(target! * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  if (target === null) return null;

  return (
    <div style={{ marginBottom: "14px" }}>
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "8px",
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "100px", padding: "7px 16px 7px 10px",
      animation: "ucbFade 0.4s ease-out",
    }}>
      <style>{"@keyframes ucbFade { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }"}</style>
      <span style={{ fontSize: "15px" }}>🦊</span>
      <span style={{ fontSize: "13px", color: "#ddd", fontWeight: 600 }}>
        <span style={{ color: "#f97316", fontVariantNumeric: "tabular-nums" }}>
          +{shown.toLocaleString("pt-BR")}
        </span>{" "}
        devs já montaram sua rota
      </span>
    </div>
    </div>
  );
}
