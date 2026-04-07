import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY não definida no ambiente.");
}

const app = express();

const allowedOrigins = [
  process.env.FRONT_URL,
  "http://localhost:5173",
  "https://rota-dev.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origem não permitida pelo CORS"));
      }
    },
  }),
);

app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildPrompt(data) {
  const goalMap = {
    frontend: "Front-end",
    backend: "Back-end",
    fullstack: "Full Stack",
    not_sure: "Ainda não sabe",
  };

  const levelMap = {
    never_programmed: "Nunca programou",
    basic: "Sabe o básico",
    some_projects: "Já fez alguns projetos",
  };

  const hoursMap = {
    "30min": "30 minutos por dia",
    "1h": "1 hora por dia",
    "2h": "2 horas por dia",
    "3h_plus": "3 ou mais horas por dia",
  };

  const daysMap = {
    "2_3": "2 a 3 dias por semana",
    "4_5": "4 a 5 dias por semana",
    everyday: "Todos os dias",
  };

  const motivationMap = {
    first_job: "Conseguir um emprego",
    career_change: "Mudar de carreira",
    earn_more: "Ganhar mais dinheiro",
    curiosity: "Curiosidade ou hobby",
  };

  const planLengthMap = {
    "2_3": 3,
    "4_5": 5,
    everyday: 7,
  };

  const totalDays = planLengthMap[data.daysPerWeek] ?? 7;

  return `
Você é um agente de IA do produto Rota Dev.
Crie uma rota inicial de estudos para uma pessoa iniciante em programação.

Perfil:
- Objetivo: ${goalMap[data.goal] ?? data.goal}
- Nível: ${levelMap[data.level] ?? data.level}
- Tempo por dia: ${hoursMap[data.hoursPerDay] ?? data.hoursPerDay}
- Dias por semana: ${daysMap[data.daysPerWeek] ?? data.daysPerWeek}
- Motivação: ${motivationMap[data.motivation] ?? data.motivation}

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
}

app.get("/", (_req, res) => {
  res.send("Backend do Rota Dev está rodando 🚀");
});

app.post("/generate-plan", async (req, res) => {
  try {
    const { goal, level, hoursPerDay, daysPerWeek, motivation } = req.body;

    if (!goal || !level || !hoursPerDay || !daysPerWeek || !motivation) {
      return res.status(400).json({
        error: "Preencha todos os campos obrigatórios.",
      });
    }

    const prompt = buildPrompt(req.body);

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text?.trim();

    if (!text) {
      return res.status(500).json({
        error: "A IA não retornou conteúdo.",
      });
    }

    let plan;

    try {
      plan = JSON.parse(text);
    } catch {
      console.error("Resposta inválida da IA:", text);

      return res.status(500).json({
        error: "A resposta da IA veio em formato inválido.",
      });
    }

    return res.json(plan);
  } catch (error) {
    console.error("Erro ao gerar plano:", error);

    return res.status(500).json({
      error: "Não foi possível gerar a rota agora.",
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});