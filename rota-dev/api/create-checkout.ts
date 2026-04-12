import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const LIFETIME_PRICE_ID = "price_1TLQ44B6G3QSloksE19rZJj9";

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

  const { clerk_id, email, plan = "monthly" } = req.body as {
    clerk_id?: string;
    email?: string;
    plan?: "monthly" | "lifetime";
  };

  if (!clerk_id || !email) {
    return res.status(400).json({ error: "clerk_id e email são obrigatórios." });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Stripe não configurado." });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-03-25.dahlia" as const });
  const baseUrl = process.env.VITE_APP_URL ?? "https://rota-dev.vercel.app";

  try {
    let session: Stripe.Checkout.Session;

    if (plan === "lifetime") {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card", "pix"],
        customer_email: email,
        line_items: [{ price: LIFETIME_PRICE_ID, quantity: 1 }],
        metadata: { clerk_id, plan_type: "lifetime" },
        success_url: `${baseUrl}/dashboard?subscribed=true`,
        cancel_url: `${baseUrl}/app`,
      });
    } else {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "brl",
              recurring: { interval: "month" },
              unit_amount: 1290,
              product_data: {
                name: "Rota Dev Pro",
                description: "Acesso completo + Agente IA + Progresso na nuvem",
              },
            },
            quantity: 1,
          },
        ],
        metadata: { clerk_id, plan_type: "monthly" },
        success_url: `${baseUrl}/dashboard?subscribed=true`,
        cancel_url: `${baseUrl}/app`,
      });
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return res.status(500).json({ error: message });
  }
}
