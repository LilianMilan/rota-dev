import type { FormValues } from "../types/onboarding";

export const ONBOARDING_FIELDS: (keyof FormValues)[] = [
  "goal",
  "level",
  "hoursPerDay",
  "daysPerWeek",
  "motivation",
];