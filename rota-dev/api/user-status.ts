import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./_supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { clerk_id } = req.query as { clerk_id?: string };

  if (!clerk_id) {
    return res.status(400).json({ error: "clerk_id é obrigatório." });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("is_pro, plan_count")
    .eq("clerk_id", clerk_id)
    .single();

  if (error) {
    // Usuário ainda não sincronizado — retorna defaults
    return res.status(200).json({ is_pro: false, plan_count: 0 });
  }

  return res.status(200).json(data);
}
