import type { Handler } from "@netlify/functions";
import { timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "./_supabase.js";
import { isPixPaid, type AsaasPayment } from "./_asaas.js";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

function tokenMatches(received: string | undefined, expected: string): boolean {
  if (!received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Webhook do Asaas (Pix). O Asaas manda o token configurado no painel no
// header "asaas-access-token"; sem ele batendo, ignora a requisição.
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método não permitido." });

  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected || !tokenMatches(event.headers["asaas-access-token"], expected)) {
    return json(401, { error: "Token inválido." });
  }

  const body = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : (event.body || "");
  const { event: type, payment } = JSON.parse(body || "{}") as { event?: string; payment?: AsaasPayment };

  if (type === "PAYMENT_RECEIVED" && payment && isPixPaid(payment) && payment.externalReference) {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ is_pro: true, plan_type: "lifetime" })
      .eq("clerk_id", payment.externalReference);
    // Erro no banco → 500 pro Asaas reenviar depois.
    if (error) return json(500, { error: error.message });
  }

  // Demais eventos: só confirma o recebimento (o Asaas pausa a fila após 15 falhas).
  return json(200, { received: true });
};
