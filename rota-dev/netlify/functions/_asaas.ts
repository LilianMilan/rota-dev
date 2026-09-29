// Cliente mínimo da API do Asaas (usado só pro Pix — cartão e boleto seguem no Stripe).
// ASAAS_ENV=production usa a API real; qualquer outro valor usa o sandbox.
const BASE_URL = process.env.ASAAS_ENV === "production"
  ? "https://api.asaas.com/v3"
  : "https://api-sandbox.asaas.com/v3";

export type AsaasPayment = {
  id: string;
  status: string;
  billingType: string;
  value: number;
  externalReference?: string | null;
};

export async function asaas<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) throw new Error("Asaas não configurado.");

  const res = await fetch(`${BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "rota-dev",
      access_token: apiKey,
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  const data = await res.json().catch(() => ({})) as { errors?: { description?: string }[] };
  if (!res.ok) {
    throw new Error(data.errors?.[0]?.description ?? `Asaas respondeu ${res.status}`);
  }
  return data as T;
}

// Pix "RECEIVED" = dinheiro caiu. "CONFIRMED" no Pix pode ser bloqueio
// cautelar do Asaas (até 72h), então só liberamos o Pro em RECEIVED.
export function isPixPaid(payment: AsaasPayment): boolean {
  return payment.billingType === "PIX" && payment.status === "RECEIVED";
}

// Valida CPF (11 dígitos) ou CNPJ (14) pelos dígitos verificadores.
export function isValidCpfCnpj(raw: string): boolean {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 11 && d.length !== 14) return false;
  if (/^(\d)\1+$/.test(d)) return false;

  if (d.length === 11) {
    for (const len of [9, 10]) {
      let sum = 0;
      for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
      const check = ((sum * 10) % 11) % 10;
      if (check !== Number(d[len])) return false;
    }
    return true;
  }

  for (const len of [12, 13]) {
    let sum = 0;
    let weight = len - 7;
    for (let i = 0; i < len; i++) {
      sum += Number(d[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const rest = sum % 11;
    const check = rest < 2 ? 0 : 11 - rest;
    if (check !== Number(d[len])) return false;
  }
  return true;
}
