// Promoção do vitalício por tempo limitado (horário de Brasília).
// Usado no front (textos/preço exibido) e no create-checkout (preço cobrado):
// fora da janela tudo volta sozinho ao preço normal, sem precisar de deploy.
export const PROMO_START = new Date("2026-09-27T00:00:00-03:00");
export const PROMO_END = new Date("2026-10-04T23:59:59-03:00");

export const PROMO_PRICE_CENTS = 990;
export const PROMO_PRICE_LABEL = "R$ 9,90";
export const REGULAR_PRICE_LABEL = "R$ 47,90";
export const PROMO_END_LABEL = "04/10";

export function isPromoActive(now: Date = new Date()): boolean {
  return now >= PROMO_START && now <= PROMO_END;
}
