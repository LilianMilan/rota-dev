import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { supabaseAdmin } from "./_supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { clerk_id } = req.body as { clerk_id?: string };

  if (!clerk_id) {
    return res.status(400).json({ error: "clerk_id é obrigatório." });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Stripe não configurado." });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-03-25.dahlia" as const });
  const baseUrl = process.env.VITE_APP_URL ?? "https://rota-dev.vercel.app";

  try {
    // Busca o email do usuário no Supabase
    const { data } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("clerk_id", clerk_id)
      .single();

    if (!data?.email) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Busca o customer no Stripe pelo email
    const customers = await stripe.customers.list({ email: data.email, limit: 1 });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado no Stripe." });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${baseUrl}/dashboard`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return res.status(500).json({ error: message });
  }
}
