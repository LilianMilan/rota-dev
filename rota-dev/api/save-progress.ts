import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./_supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { clerk_id, checkedTasks } = req.body as {
    clerk_id?: string;
    checkedTasks?: string[];
  };

  if (!clerk_id || !Array.isArray(checkedTasks)) {
    return res.status(400).json({ error: "clerk_id e checkedTasks são obrigatórios." });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", clerk_id)
    .single();

  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

  const { data: planRow } = await supabaseAdmin
    .from("plans")
    .select("id, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!planRow) return res.status(404).json({ error: "Plano não encontrado." });

  const { error } = await supabaseAdmin
    .from("plans")
    .update({ content: { ...planRow.content as object, checkedTasks } })
    .eq("id", planRow.id);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
