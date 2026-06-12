import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { supabaseAdmin } from "./_supabase.js";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

async function grantPro(session: Stripe.Checkout.Session) {
  const clerk_id = session.metadata?.clerk_id;
  const plan_type = session.metadata?.plan_type ?? "lifetime";
  if (clerk_id) {
    await supabaseAdmin
      .from("users")
      .update({ is_pro: true, plan_type })
      .eq("clerk_id", clerk_id);
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método não permitido." });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" as const });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const signature = event.headers["stripe-signature"] as string;

  let stripeEvent: Stripe.Event;

  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : (event.body || "");
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook inválido";
    return json(400, { error: message });
  }

  // Cartão: paga na hora → completed já vem com payment_status "paid".
  // Pix: completed dispara com payment_status "unpaid" (aguardando) e só
  // confirma depois via async_payment_succeeded. Por isso só liberamos
  // quando o pagamento está de fato pago.
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      await grantPro(session);
    }
  }

  if (stripeEvent.type === "checkout.session.async_payment_succeeded") {
    await grantPro(stripeEvent.data.object as Stripe.Checkout.Session);
  }

  // Legado: assinaturas mensais canceladas (não há mais venda de mensal,
  // mas mantém o downgrade de quem ainda for assinante).
  if (stripeEvent.type === "customer.subscription.deleted") {
    const subscription = stripeEvent.data.object as Stripe.Subscription;
    const customer = await stripe.customers.retrieve(subscription.customer as string);

    if (!customer.deleted) {
      const email = (customer as Stripe.Customer).email;
      if (email) {
        await supabaseAdmin
          .from("users")
          .update({ is_pro: false })
          .eq("email", email);
      }
    }
  }

  return json(200, { received: true });
};
