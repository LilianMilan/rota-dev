// Autenticação das functions: o usuário vem do token de sessão do Clerk
// (header Authorization), nunca de clerk_id/email mandados pelo navegador.
import { createClerkClient, verifyToken } from "@clerk/backend";
import type { HandlerEvent } from "@netlify/functions";

const secretKey = process.env.CLERK_SECRET_KEY;
const clerk = createClerkClient({ secretKey });

// Sites que podem gerar tokens aceitos aqui (claim "azp" do Clerk).
const authorizedParties = [
  process.env.VITE_APP_URL ?? "https://rotadev.app.br",
  "https://rotadev.app.br",
  "https://www.rotadev.app.br",
  "http://localhost:5173",
  "http://localhost:8888",
];

/** clerk_id do usuário logado, ou null se o token faltar/for inválido. */
export async function getClerkId(event: HandlerEvent): Promise<string | null> {
  if (!secretKey) {
    console.error("CLERK_SECRET_KEY não configurada — todas as rotas autenticadas vão recusar.");
    return null;
  }
  const header = event.headers.authorization ?? event.headers.Authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = await verifyToken(token, { secretKey, authorizedParties });
    return payload.sub;
  } catch {
    return null;
  }
}

/** E-mail principal verificado do usuário, direto do Clerk. */
export async function getVerifiedEmail(clerkId: string): Promise<string | null> {
  const user = await clerk.users.getUser(clerkId);
  const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
  return primary?.verification?.status === "verified" ? primary.emailAddress : null;
}

export const unauthorized = () => ({
  statusCode: 401,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ error: "Sessão expirada. Entre de novo." }),
});
