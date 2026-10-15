import type { Handler } from "@netlify/functions";
import { supabaseAdmin } from "./_supabase.js";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") return json(405, { error: "Método não permitido." });

  const { clerk_id, email } = JSON.parse(event.body || "{}") as { clerk_id?: string; email?: string };

  if (!clerk_id || !email) return json(400, { error: "clerk_id e email são obrigatórios." });

  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert({ clerk_id, email }, { onConflict: "clerk_id" })
    .select("id, clerk_id, email, is_pro, plan_count")
    .single();

  if (error) return json(500, { error: error.message });

  return json(200, data);
};
