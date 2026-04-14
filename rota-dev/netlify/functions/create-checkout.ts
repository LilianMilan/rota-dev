import type { Handler } from "@netlify/functions";
import Stripe from "stripe";

const LIFETIME_PRICE_ID = "price_1TLQ44B6G3QSloksE19rZJj9";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") return json(405, { error: "Método não permitido." });

  const { clerk_id, email, plan = "monthly" } = JSON.parse(event.body || "{}") as {
    clerk_id?: string;
    email?: string;
    plan?: "monthly" | "lifetime";
  };

  if (!clerk_id || !email) return json(400, { error: "clerk_id e email são obrigatórios." });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return json(500, { error: "Stripe não configurado." });

  const stripe = new Stripe(secretKey, { apiVersion: "2026-03-25.dahlia" as const });
  const baseUrl = process.env.VITE_APP_URL ?? "https://rotadev.app.br";

  try {
    let session: Stripe.Checkout.Session;

    if (plan === "lifetime") {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
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

    return json(200, { url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return json(500, { error: message });
  }
};
