import type { Handler } from "@netlify/functions";
import { asaas, isValidCpfCnpj, type AsaasPayment } from "./_asaas.js";
import { isPromoActive, PROMO_PRICE_CENTS } from "../../src/lib/promo.js";

const REGULAR_PRICE_CENTS = 4790;

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// Data de hoje no fuso de Brasília, no formato YYYY-MM-DD.
function todayBrt(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método não permitido." });

  const { clerk_id, email, name, cpfCnpj } = JSON.parse(event.body || "{}") as {
    clerk_id?: string;
    email?: string;
    name?: string;
    cpfCnpj?: string;
  };

  if (!clerk_id || !email) return json(400, { error: "clerk_id e email são obrigatórios." });
  if (!name?.trim()) return json(400, { error: "Informe seu nome." });
  if (!cpfCnpj || !isValidCpfCnpj(cpfCnpj)) return json(400, { error: "CPF ou CNPJ inválido." });

  try {
    // Reaproveita o cliente do Asaas desse usuário (evita duplicar a cada tentativa).
    const found = await asaas<{ data: { id: string }[] }>(
      `/customers?externalReference=${encodeURIComponent(clerk_id)}&limit=1`,
    );
    let customerId = found.data[0]?.id;
    if (customerId) {
      await asaas(`/customers/${customerId}`, {
        method: "PUT",
        body: { name: name.trim(), cpfCnpj: cpfCnpj.replace(/\D/g, ""), email },
      });
    } else {
      const created = await asaas<{ id: string }>("/customers", {
        method: "POST",
        body: {
          name: name.trim(),
          cpfCnpj: cpfCnpj.replace(/\D/g, ""),
          email,
          externalReference: clerk_id,
          notificationDisabled: true,
        },
      });
      customerId = created.id;
    }

    // Valor decidido no servidor (promo ou cheio), igual ao checkout do Stripe.
    const cents = isPromoActive() ? PROMO_PRICE_CENTS : REGULAR_PRICE_CENTS;
    const payment = await asaas<AsaasPayment>("/payments", {
      method: "POST",
      body: {
        customer: customerId,
        billingType: "PIX",
        value: cents / 100,
        dueDate: todayBrt(),
        description: "Rota Dev Pro — acesso vitalício",
        externalReference: clerk_id,
      },
    });

    const qr = await asaas<{ encodedImage: string; payload: string; expirationDate: string }>(
      `/payments/${payment.id}/pixQrCode`,
    );

    return json(200, {
      payment_id: payment.id,
      value: payment.value,
      payload: qr.payload,
      qr_image: qr.encodedImage,
      expires_at: qr.expirationDate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return json(500, { error: message });
  }
};
