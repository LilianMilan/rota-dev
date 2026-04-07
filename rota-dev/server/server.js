import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(cors());
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

app.get("/", (req, res) => {
  res.send("Backend do Rota Dev está rodando 🚀");
});

app.post("/generate-plan", async (req, res) => {
  try {
    const prompt = buildPrompt(req.body);

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: prompt,
    });

    const text = response.output_text?.trim();

    if (!text) {
      return res.status(500).json({
        message: "A IA não retornou conteúdo.",
      });
    }

    let plan;

    try {
      plan = JSON.parse(text);
    } catch (parseError) {
      console.error("Erro ao converter resposta da IA em JSON:", text);
      return res.status(500).json({
        message: "A resposta da IA veio em formato inválido.",
      });
    }

    return res.json(plan);
  } catch (error) {
    console.error("Erro ao gerar plano:", error);

    return res.status(500).json({
      message: "Não foi possível gerar a rota agora.",
    });
  }
});

app.listen(3001, () => {
  console.log("Servidor rodando em http://localhost:3001");
});