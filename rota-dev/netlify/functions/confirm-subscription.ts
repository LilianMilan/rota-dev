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

  const { clerk_id, email, session_id } = JSON.parse(event.body || "{}") as {
    clerk_id?: string;
    email?: string;
    session_id?: string;
  };
  if (!clerk_id) return json(400, { error: "clerk_id é obrigatório." });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" as const });

  try {
    // Caminho principal: confirma direto pela sessão de checkout retornada
    // no redirect. Cartão já vem "paid"; boleto fica "unpaid" até compensar.
    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const ownedByUser = session.metadata?.clerk_id === clerk_id;
      const paid = ownedByUser && session.payment_status === "paid";

      // Boleto gerado: checkout concluído mas pagamento ainda não compensado.
      const pending =
        ownedByUser &&
        session.status === "complete" &&
        session.payment_status === "unpaid";

      if (paid) {
        await supabaseAdmin
          .from("users")
          .update({ is_pro: true, plan_type: session.metadata?.plan_type ?? "lifetime" })
          .eq("clerk_id", clerk_id);
      }

      return json(200, { is_pro: paid, status: paid ? "paid" : pending ? "pending" : "unpaid" });
    }

    // Fallback legado: assinatura mensal ativa por e-mail.
    if (!email) return json(200, { is_pro: false });

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

    return json(200, { is_pro: isActivePro, status: isActivePro ? "paid" : "unpaid" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return json(500, { error: message });
  }
};
