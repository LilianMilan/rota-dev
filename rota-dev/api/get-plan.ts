import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./_supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const { clerk_id } = req.query as { clerk_id?: string };
  if (!clerk_id) return res.status(400).json({ error: "clerk_id é obrigatório." });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", clerk_id)
    .single();

  if (!user) return res.status(200).json(null);

  const { data: rows } = await supabaseAdmin
    .from("plans")
    .select("id, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return res.status(200).json(rows ?? []);
}
