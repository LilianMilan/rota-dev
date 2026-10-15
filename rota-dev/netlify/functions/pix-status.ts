import type { Handler } from "@netlify/functions";
import { supabaseAdmin } from "./_supabase.js";
import { asaas, isPixPaid, type AsaasPayment } from "./_asaas.js";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// Consultado pela tela do QR Code enquanto a pessoa paga. Confere o status
// direto no Asaas (fonte da verdade) e libera o Pro — serve de rede de
// segurança caso o webhook atrase.
export const handler: Handler = async (event) => {
  const paymentId = event.queryStringParameters?.payment_id;
  const clerkId = event.queryStringParameters?.clerk_id;
  if (!paymentId || !clerkId) return json(400, { error: "payment_id e clerk_id são obrigatórios." });

  try {
    const payment = await asaas<AsaasPayment>(`/payments/${encodeURIComponent(paymentId)}`);
    if (payment.externalReference !== clerkId) return json(404, { error: "Pagamento não encontrado." });

    const paid = isPixPaid(payment);
    if (paid) {
      await supabaseAdmin
        .from("users")
        .update({ is_pro: true, plan_type: "lifetime" })
        .eq("clerk_id", clerkId);
    }

    return json(200, { paid, status: payment.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return json(500, { error: message });
  }
};
