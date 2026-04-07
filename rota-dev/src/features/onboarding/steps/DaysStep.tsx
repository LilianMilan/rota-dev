import { useFormContext } from "react-hook-form";
import { DAYS_OPTIONS } from "../constants/onboarding-options";
import type { FormValues } from "../types/onboarding";
import StepCard from "../components/StepCard";
import OptionCard from "../components/OptionCard";

export default function DaysStep() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormValues>();

  const daysValue = watch("daysPerWeek") || "";

  return (
    <StepCard
      title="Quantos dias por semana você pretende estudar?"
      subtitle="Sem pressão. Vamos montar uma rota que caiba na sua rotina."
      error={errors.daysPerWeek?.message}
    >
      <div className="grid gap-3">
        {DAYS_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            value={option.value}
            selected={daysValue === option.value}
            onSelect={(value) => {
              setValue("daysPerWeek", value, {
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
