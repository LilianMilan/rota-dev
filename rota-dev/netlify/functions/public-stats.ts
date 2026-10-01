import type { Handler } from "@netlify/functions";
import { supabaseAdmin } from "./_supabase.js";

// Números públicos pra prova social na landing. Só devolve a contagem
// (nunca dados de usuário) e o CDN guarda por 2 min pra não bater no banco
// a cada visita.
export const handler: Handler = async () => {
  const { count, error } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact", head: true });

  if (error || count === null) {
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "indisponível" }) };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=120",
    },
    body: JSON.stringify({ users: count }),
  };
};
