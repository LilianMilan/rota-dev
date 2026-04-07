import { useFormContext } from "react-hook-form";
import { HOURS_OPTIONS } from "../constants/onboarding-options";
import type { FormValues } from "../types/onboarding";
import StepCard from "../components/StepCard";
import OptionCard from "../components/OptionCard";

export default function HoursStep() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormValues>();

  const hoursValue = watch("hoursPerDay") || "";

  return (
    <StepCard
      title="Quanto tempo você consegue estudar por dia?"
      subtitle="Pode ser pouco. O importante é ser realista pra sua rota funcionar de verdade."
      error={errors.hoursPerDay?.message}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {HOURS_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            value={option.value}
            selected={hoursValue === option.value}
            onSelect={(value) => {
              setValue("hoursPerDay", value, {
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
