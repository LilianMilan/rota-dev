import type { Handler } from "@netlify/functions";
import OpenAI from "openai";
import { supabaseAdmin } from "./_supabase.js";

type Message = { role: "user" | "assistant"; content: string };

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método não permitido." });

  const { clerk_id, messages } = JSON.parse(event.body || "{}") as {
    clerk_id?: string;
    messages?: Message[];
  };

  if (!clerk_id || !messages?.length) {
    return json(400, { error: "clerk_id e messages são obrigatórios." });
  }

  let planContext = "";
  try {
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", clerk_id)
      .single();

    if (user) {
      const { data: planRow } = await supabaseAdmin
        .from("plans")
        .select("content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (planRow?.content) {
        const { plan } = planRow.content as { plan: { planTitle: string; days: { day: number; title: string; tasks: string[] }[] } };
        if (plan) {
          planContext = `\n\nPlano atual do usuário: "${plan.planTitle}"\nDias: ${plan.days.map(d => `Dia ${d.day}: ${d.title} (${d.tasks.join(", ")})`).join(" | ")}`;
        }
      }
    }
  } catch { /* sem plano, responde mesmo assim */ }

  const systemPrompt = `Você é o agente de IA do Rota Dev 🦊, focado em ajudar iniciantes na jornada de virar dev.

Você pode responder sobre:
- Dúvidas da trilha de estudos do usuário (tarefas, dias, tópicos do plano)
- Conceitos de programação (HTML, CSS, JS, React, Git, e afins)
- Dicas de estudo, consistência e organização
- Carreira dev para quem está começando

Você NÃO responde sobre assuntos fora de programação e carreira dev (culinária, viagens, política, entretenimento, etc.).

Se a pergunta estiver fora do escopo, diga de forma simpática: "Isso está fora da minha área aqui no Rota Dev! Posso te ajudar com sua trilha, conceitos de programação ou dicas de carreira. 🦊"

Responda sempre em português do Brasil, de forma clara, encorajadora e direta. Sem enrolação.${planContext}`;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 600,
    });

    const reply = response.choices[0]?.message?.content ?? "Não consegui responder agora. Tente de novo.";
    return json(200, { reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return json(500, { error: message });
  }
};
