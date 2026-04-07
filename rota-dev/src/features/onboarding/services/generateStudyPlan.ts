import type { FormValues, StudyPlan } from "../types/onboarding";

export async function generateStudyPlan(
  data: FormValues
): Promise<StudyPlan> {
  const response = await fetch("http://localhost:3001/generate-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao gerar rota.");
  }

  return response.json();
}