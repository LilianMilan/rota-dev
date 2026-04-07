import { useFormContext } from "react-hook-form";
import { LEVEL_OPTIONS } from "../constants/onboarding-options";
import type { FormValues } from "../types/onboarding";
import StepCard from "../components/StepCard";
import OptionCard from "../components/OptionCard";

export default function LevelStep() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormValues>();

  const levelValue = watch("level");

  return (
    <StepCard
      title="Qual é seu nível hoje?"
      subtitle="Nada de termos complicados. Escolha a opção que mais parece com você agora."
      error={errors.level?.message}
    >
      <div className="grid gap-3">
        {LEVEL_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            value={option.value}
            selected={levelValue === option.value}
            onSelect={(value) => {
              setValue("level", value, { shouldValidate: true });
            }}
          />
        ))}
      </div>
    </StepCard>
  );
}
