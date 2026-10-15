import type { Handler } from "@netlify/functions";
import { supabaseAdmin } from "./_supabase.js";
import { getClerkId, unauthorized } from "./_auth.js";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Método não permitido." });

  const clerk_id = await getClerkId(event);
  if (!clerk_id) return unauthorized();

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
