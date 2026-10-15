// fetch pras functions com o token de sessão do Clerk — o servidor descobre
// quem é o usuário pelo token, então nunca mande clerk_id/email no corpo.
declare global {
  interface Window {
    Clerk?: { session?: { getToken(): Promise<string | null> } | null };
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await window.Clerk?.session?.getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers });
}
