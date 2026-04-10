import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./_supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { clerk_id, plan_id, checkedTasks } = req.body as {
    clerk_id?: string;
    plan_id?: string;
    checkedTasks?: string[];
  };

  if (!clerk_id || !plan_id || !Array.isArray(checkedTasks)) {
    return res.status(400).json({ error: "clerk_id, plan_id e checkedTasks são obrigatórios." });
  }

  const { data: planRow } = await supabaseAdmin
    .from("plans")
    .select("id, content")
    .eq("id", plan_id)
    .single();

  if (!planRow) return res.status(404).json({ error: "Plano não encontrado." });

  const { error } = await supabaseAdmin
    .from("plans")
    .update({ content: { ...planRow.content as object, checkedTasks } })
    .eq("id", plan_id);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
