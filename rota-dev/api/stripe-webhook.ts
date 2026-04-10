import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { supabaseAdmin } from "./_supabase.js";

// Desabilita o body parser do Vercel — o Stripe precisa do raw body para validar a assinatura
export const config = { api: { bodyParser: false } };

function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" as const });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook inválido";
    return res.status(400).json({ error: message });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerk_id = session.metadata?.clerk_id;

    if (clerk_id) {
      await supabaseAdmin
        .from("users")
        .update({ is_pro: true })
        .eq("clerk_id", clerk_id);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
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

  return res.status(200).json({ received: true });
}
