import { useFormContext } from "react-hook-form";
import { MOTIVATION_OPTIONS } from "../constants/onboarding-options";
import type { FormValues } from "../types/onboarding";
import StepCard from "../components/StepCard";
import OptionCard from "../components/OptionCard";

export default function MotivationStep() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormValues>();

  const motivationValue = watch("motivation") || "";

  return (
    <StepCard
      title="Por que você quer aprender programação?"
      subtitle="Essa resposta ajuda o agente a criar uma rota mais alinhada com seu momento."
      error={errors.motivation?.message}
    >
      <div className="grid gap-3">
        {MOTIVATION_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            value={option.value}
            selected={motivationValue === option.value}
            onSelect={(value) => {
              setValue("motivation", value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
          />
        ))}
      </div>
    </StepCard>
  );
}
