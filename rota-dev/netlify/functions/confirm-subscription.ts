import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { supabaseAdmin } from "./_supabase.js";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método não permitido." });

  const { clerk_id, email } = JSON.parse(event.body || "{}") as { clerk_id?: string; email?: string };
  if (!clerk_id || !email) return json(400, { error: "clerk_id e email são obrigatórios." });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" as const });

  try {
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

    return json(200, { is_pro: isActivePro });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return json(500, { error: message });
  }
};
