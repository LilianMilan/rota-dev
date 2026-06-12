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

  const { clerk_id, email } = JSON.parse(event.body || "{}") as {
    clerk_id?: string;
    email?: string;
  };

  if (!clerk_id || !email) return json(400, { error: "clerk_id e email são obrigatórios." });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return json(500, { error: "Stripe não configurado." });

  const stripe = new Stripe(secretKey, { apiVersion: "2026-03-25.dahlia" as const });
  const baseUrl = process.env.VITE_APP_URL ?? "https://rotadev.app.br";

  try {
    // Plano único: vitalício (pagamento único) — aceita cartão e boleto.
    // Cartão libera na hora; boleto compensa em 1-3 dias úteis e só então
    // libera o acesso (tratado via webhook async_payment_succeeded).
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "boleto"],
      payment_method_options: { boleto: { expires_after_days: 3 } },
      customer_email: email,
      line_items: [{ price: LIFETIME_PRICE_ID, quantity: 1 }],
      metadata: { clerk_id, plan_type: "lifetime" },
      success_url: `${baseUrl}/dashboard?subscribed=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/app`,
    });

    return json(200, { url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return json(500, { error: message });
  }
};
