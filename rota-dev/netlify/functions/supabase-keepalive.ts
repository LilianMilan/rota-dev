import type { Config } from "@netlify/functions";
import { supabaseAdmin } from "./_supabase.js";

// Mantém o projeto do Supabase ativo no plano grátis, que pausa projetos
// com mais de 7 dias sem atividade. Faz uma consulta leve no banco a cada
// 2 dias. Só conta, não lê nenhum dado de usuário.
export default async () => {
  const { count, error } = await supabaseAdmin
    .from("users")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("[keepalive] falhou:", error.message);
    return new Response("erro", { status: 500 });
  }

  console.log(`[keepalive] ok (${count} usuários)`);
  return new Response("ok");
};

// Cron em UTC: 15h UTC = 12h em Brasília, a cada 2 dias.
export const config: Config = {
  schedule: "0 15 */2 * *",
};
