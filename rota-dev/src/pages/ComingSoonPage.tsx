export default function ComingSoonPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0c0c",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Anéis decorativos */}
      {[400, 700, 1000].map((size) => (
        <div key={size} style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          border: "0.5px solid rgba(249,115,22,0.06)",
          pointerEvents: "none",
        }} />
      ))}

      {/* Conteúdo */}
      <div style={{
        position: "relative",
        zIndex: 1,
        maxWidth: "480px",
        width: "100%",
        padding: "0 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "0",
      }}>
        {/* Ícone */}
        <span style={{ fontSize: "32px", marginBottom: "20px" }}>🦊</span>

        {/* Logo */}
        <p style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "20px" }}>
          Rota<span style={{ color: "#f97316" }}>Dev</span>
        </p>

        {/* Badge */}
        <span style={{
          display: "inline-block",
          padding: "4px 14px",
          background: "rgba(249,115,22,0.12)",
          border: "1px solid rgba(249,115,22,0.25)",
          borderRadius: "100px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#f97316",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "28px",
        }}>
          Em construção
        </span>

        {/* Título */}
        <h1 style={{
          fontSize: "clamp(28px, 6vw, 36px)",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          marginBottom: "16px",
        }}>
          Estamos preparando algo incrível.
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontSize: "14px",
          color: "#555",
          lineHeight: 1.7,
          marginBottom: "32px",
          maxWidth: "400px",
        }}>
          O Rota Dev está quase pronto. Em breve você poderá criar sua rota de estudos personalizada com IA.
        </p>

      </div>
    </div>
  );
}
