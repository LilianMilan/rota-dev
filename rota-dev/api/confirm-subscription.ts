import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { supabaseAdmin } from "./_supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { clerk_id, email } = req.body as { clerk_id?: string; email?: string };

  if (!clerk_id || !email) {
    return res.status(400).json({ error: "clerk_id e email são obrigatórios." });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" as const });

  try {
    // Busca clientes no Stripe pelo e-mail
    const customers = await stripe.customers.list({ email, limit: 5 });

    let isActivePro = false;

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: "active",
        limit: 1,
      });
      if (subscriptions.data.length > 0) {
        isActivePro = true;
        break;
      }
    }

    if (isActivePro) {
      await supabaseAdmin
        .from("users")
        .update({ is_pro: true })
        .eq("clerk_id", clerk_id);
    }

    return res.status(200).json({ is_pro: isActivePro });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return res.status(500).json({ error: message });
  }
}
