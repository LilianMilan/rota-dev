import { useFormContext } from "react-hook-form";
import { GOAL_OPTIONS } from "../constants/onboarding-options";
import type { FormValues } from "../types/onboarding";
import StepCard from "../components/StepCard";
import OptionCard from "../components/OptionCard";

export default function GoalStep() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormValues>();

  const goalValue = watch("goal");

  return (
    <StepCard
      title="O que você quer aprender?"
      subtitle="Pode escolher sem medo. Se ainda estiver em dúvida, tudo bem também."
      error={errors.goal?.message}
    >
      <div className="grid gap-3">
        {GOAL_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            value={option.value}
            selected={goalValue === option.value}
            onSelect={(value) => {
              setValue("goal", value, { shouldValidate: true });
            }}
          />
        ))}
      </div>
    </StepCard>
  );
}
