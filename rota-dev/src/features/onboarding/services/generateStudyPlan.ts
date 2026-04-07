import type { FormValues, StudyPlan } from "../types/onboarding";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function generateStudyPlan(
  data: FormValues,
): Promise<StudyPlan> {
  const response = await fetch(`${API_URL}/generate-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.error || "Erro ao gerar rota.");
  }

  return response.json();
}