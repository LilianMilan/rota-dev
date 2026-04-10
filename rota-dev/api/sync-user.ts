import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./_supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { clerk_id, email } = req.body as { clerk_id?: string; email?: string };

  if (!clerk_id || !email) {
    return res.status(400).json({ error: "clerk_id e email são obrigatórios." });
  }

  // Upsert: cria se não existe, ignora se já existe
  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert({ clerk_id, email }, { onConflict: "clerk_id" })
    .select("id, clerk_id, email, is_pro, plan_count")
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}
