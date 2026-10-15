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

  const { plan_id, checkedTasks } = JSON.parse(event.body || "{}") as {
    plan_id?: string;
    checkedTasks?: string[];
  };

  if (!plan_id || !Array.isArray(checkedTasks)) {
    return json(400, { error: "plan_id e checkedTasks são obrigatórios." });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", clerk_id)
    .single();

  if (!user) return json(404, { error: "Usuário não encontrado." });

  // Só mexe em plano do próprio usuário.
  const { data: planRow } = await supabaseAdmin
    .from("plans")
    .select("id, content")
    .eq("id", plan_id)
    .eq("user_id", user.id)
    .single();

  if (!planRow) return json(404, { error: "Plano não encontrado." });

  const { error } = await supabaseAdmin
    .from("plans")
    .update({ content: { ...(planRow.content as object), checkedTasks } })
    .eq("id", plan_id);

  if (error) return json(500, { error: error.message });

  return json(200, { ok: true });
};
