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

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", clerk_id)
    .single();

  if (!user) return json(200, null);

  const { data: rows } = await supabaseAdmin
    .from("plans")
    .select("id, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return json(200, rows ?? []);
};
