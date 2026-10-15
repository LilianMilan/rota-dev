import type { Handler } from "@netlify/functions";
import { supabaseAdmin } from "./_supabase.js";
import { getClerkId, unauthorized } from "./_auth.js";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método não permitido." });

  const clerk_id = await getClerkId(event);
  if (!clerk_id) return unauthorized();

  const { plan, checkedTasks = [] } = JSON.parse(event.body || "{}") as {
    plan?: unknown;
    checkedTasks?: string[];
  };

  if (!plan) return json(400, { error: "plan é obrigatório." });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, is_pro")
    .eq("clerk_id", clerk_id)
    .single();

  if (!user) return json(404, { error: "Usuário não encontrado." });
  // Plano salvo na nuvem é recurso Pro (free fica só no navegador).
  if (!user.is_pro) return json(403, { error: "Recurso exclusivo do plano Pro." });

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
