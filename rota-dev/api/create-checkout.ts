import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

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

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Stripe não configurado." });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-03-25.dahlia" as const });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            recurring: { interval: "month" },
            unit_amount: 1290, // R$ 12,90
            product_data: {
              name: "Rota Dev Pro",
              description: "Plano completo de 90 dias + Agente IA + Progresso na nuvem",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { clerk_id },
      success_url: `${process.env.VITE_APP_URL ?? "https://rota-dev.vercel.app"}/dashboard?subscribed=true`,
      cancel_url: `${process.env.VITE_APP_URL ?? "https://rota-dev.vercel.app"}/app`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return res.status(500).json({ error: message });
  }
}
