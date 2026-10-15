import type { Handler } from "@netlify/functions";
import OpenAI from "openai";

type FormValues = {
  goal: "frontend" | "backend" | "fullstack" | "not_sure";
  level: "never_programmed" | "basic" | "some_projects";
  hoursPerDay: "30min" | "1h" | "2h" | "3h_plus";
  daysPerWeek: "2_3" | "4_5" | "everyday";
  motivation: "first_job" | "career_change" | "earn_more" | "curiosity";
};

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método não permitido." });

  try {
    const { goal, level, hoursPerDay, daysPerWeek, motivation } = JSON.parse(event.body || "{}") as FormValues;

    if (!goal || !level || !hoursPerDay || !daysPerWeek || !motivation) {
      return json(400, { error: "Preencha todos os campos obrigatórios." });
    }

    const goalMap: Record<FormValues["goal"], string> = {
      frontend: "Front-end",
      backend: "Back-end",
      fullstack: "Full Stack",
      not_sure: "Ainda não sabe",
    };

    const levelMap: Record<FormValues["level"], string> = {
      never_programmed: "Nunca programou",
      basic: "Sabe o básico",
      some_projects: "Já fez alguns projetos",
    };

    const hoursMap: Record<FormValues["hoursPerDay"], string> = {
      "30min": "30 minutos por dia",
      "1h": "1 hora por dia",
      "2h": "2 horas por dia",
      "3h_plus": "3 ou mais horas por dia",
    };

    const daysMap: Record<FormValues["daysPerWeek"], string> = {
      "2_3": "2 a 3 dias por semana",
      "4_5": "4 a 5 dias por semana",
      everyday: "Todos os dias",
    };

    const motivationMap: Record<FormValues["motivation"], string> = {
      first_job: "Conseguir um emprego",
      career_change: "Mudar de carreira",
      earn_more: "Ganhar mais dinheiro",
      curiosity: "Curiosidade ou hobby",
    };

    const planLengthMap: Record<FormValues["daysPerWeek"], number> = {
      "2_3": 3,
      "4_5": 5,
      everyday: 7,
    };

    const totalDays = planLengthMap[daysPerWeek] ?? 7;

    const prompt = `
Você é um agente de IA do produto Rota Dev.
Crie uma rota inicial de estudos para uma pessoa iniciante em programação.

Perfil:
- Objetivo: ${goalMap[goal]}
- Nível: ${levelMap[level]}
- Tempo por dia: ${hoursMap[hoursPerDay]}
- Dias por semana: ${daysMap[daysPerWeek]}
- Motivação: ${motivationMap[motivation]}

Regras:
- Responda em português do Brasil.
- Foque em quem está começando.
- Seja claro, encorajador e prático.
- Gere uma rota de ${totalDays} dias.
- O título do plano deve ser amigável e específico.
- Para cada dia, devolva:
  - day
  - title
  - description
  - tasks (array com 2 ou 3 itens)
- Não use markdown.
- Responda APENAS em JSON válido.

Formato esperado:
{
  "planTitle": "string",
  "days": [
    {
      "day": 1,
      "title": "string",
      "description": "string",
      "tasks": ["string", "string"]
    }
  ]
}
`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text?.trim();
    if (!text) return json(500, { error: "A IA não retornou conteúdo." });

    let plan;
    try {
      plan = JSON.parse(text);
    } catch {
      return json(500, { error: "Resposta inválida da IA." });
    }

    return json(200, plan);
  } catch (error) {
    console.error("Erro ao gerar rota:", error);
    return json(500, { error: "Erro ao gerar rota." });
  }
};
