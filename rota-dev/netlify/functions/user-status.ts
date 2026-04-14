import type { Handler } from "@netlify/functions";
import { supabaseAdmin } from "./_supabase.js";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Método não permitido." });

  const clerk_id = event.queryStringParameters?.clerk_id;
  if (!clerk_id) return json(400, { error: "clerk_id é obrigatório." });

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("is_pro, plan_count, plan_type")
    .eq("clerk_id", clerk_id)
    .single();

  if (error) return json(200, { is_pro: false, plan_count: 0, plan_type: null });

  return json(200, data);
};
