import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./_supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { clerk_id, plan, checkedTasks = [] } = req.body as {
    clerk_id?: string;
    plan?: unknown;
    checkedTasks?: string[];
  };

  if (!clerk_id || !plan) {
    return res.status(400).json({ error: "clerk_id e plan são obrigatórios." });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", clerk_id)
    .single();

  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

  // Remove plano anterior e insere novo
  await supabaseAdmin.from("plans").delete().eq("user_id", user.id);

  const { error } = await supabaseAdmin
    .from("plans")
    .insert({ user_id: user.id, content: { plan, checkedTasks } });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
