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

  const { clerk_id } = JSON.parse(event.body || "{}") as { clerk_id?: string };
  if (!clerk_id) return json(400, { error: "clerk_id é obrigatório." });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return json(500, { error: "Stripe não configurado." });

  const stripe = new Stripe(secretKey, { apiVersion: "2026-03-25.dahlia" as const });
  const baseUrl = process.env.VITE_APP_URL ?? "https://rotadev.app.br";

  try {
    const { data } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("clerk_id", clerk_id)
      .single();

    if (!data?.email) return json(404, { error: "Usuário não encontrado." });

    const customers = await stripe.customers.list({ email: data.email, limit: 1 });
    if (customers.data.length === 0) return json(404, { error: "Cliente não encontrado no Stripe." });

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${baseUrl}/dashboard`,
    });

    return json(200, { url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return json(500, { error: message });
  }
};
