import type { Handler } from "@netlify/functions";
import { supabaseAdmin } from "./_supabase.js";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método não permitido." });

  const { clerk_id, plan, checkedTasks = [] } = JSON.parse(event.body || "{}") as {
    clerk_id?: string;
    plan?: unknown;
    checkedTasks?: string[];
  };

  if (!clerk_id || !plan) return json(400, { error: "clerk_id e plan são obrigatórios." });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", clerk_id)
    .single();

  if (!user) return json(404, { error: "Usuário não encontrado." });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabaseAdmin
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth.toISOString());

  if ((count ?? 0) >= 4) {
    return json(429, { error: "Limite de 4 planos por mês atingido. Tente novamente no mês que vem." });
  }

  const { error } = await supabaseAdmin
    .from("plans")
    .insert({ user_id: user.id, content: { plan, checkedTasks } });

  if (error) return json(500, { error: error.message });

  return json(200, { ok: true });
};
