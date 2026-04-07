import type { FormValues } from "../types/onboarding";

type FormPreviewProps = {
  data: FormValues | null;
};

const goalMap = {
  frontend: "Front-end",
  backend: "Back-end",
  fullstack: "Full Stack",
  not_sure: "Ainda não sei 😅",
};

const levelMap = {
  never_programmed: "Nunca programei",
  basic: "Sei o básico",
  some_projects: "Já fiz alguns projetos",
};

const hoursMap = {
  "30min": "30 minutos",
  "1h": "1 hora",
  "2h": "2 horas",
  "3h_plus": "3+ horas",
};

const daysMap = {
  "2_3": "2 a 3 dias",
  "4_5": "4 a 5 dias",
  everyday: "Todos os dias",
};

const motivationMap = {
  first_job: "Conseguir um emprego",
  career_change: "Mudar de carreira",
  earn_more: "Ganhar mais dinheiro",
  curiosity: "Curiosidade / hobby",
};

export default function FormPreview({ data }: FormPreviewProps) {
  if (!data) return null;

  return (
    <div className="mt-8 rounded-3xl border border-orange-500/30 bg-orange-500/10 p-5">
      <p className="text-sm font-medium text-orange-200">Seu perfil ✨</p>

      <div className="mt-4 space-y-3 text-sm text-zinc-100">
        <p>
          <span className="text-zinc-400">Objetivo:</span>{" "}
          {goalMap[data.goal as keyof typeof goalMap]}
        </p>

        <p>
          <span className="text-zinc-400">Nível:</span>{" "}
          {levelMap[data.level as keyof typeof levelMap]}
        </p>

        <p>
          <span className="text-zinc-400">Tempo por dia:</span>{" "}
          {hoursMap[data.hoursPerDay as keyof typeof hoursMap]}
        </p>

        <p>
          <span className="text-zinc-400">Dias por semana:</span>{" "}
          {daysMap[data.daysPerWeek as keyof typeof daysMap]}
        </p>

        <p>
          <span className="text-zinc-400">Motivação:</span>{" "}
          {motivationMap[data.motivation as keyof typeof motivationMap]}
        </p>
      </div>
    </div>
  );
}
