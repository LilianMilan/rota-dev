import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";

import type { FormValues, StudyPlan } from "../types/onboarding";
import { ONBOARDING_FIELDS } from "../constants/onboarding-fields";
import { generateStudyPlan } from "../services/generateStudyPlan";

import GoalStep from "../steps/GoalStep";
import LevelStep from "../steps/LevelStep";
import HoursStep from "../steps/HoursStep";
import DaysStep from "../steps/DaysStep";
import MotivationStep from "../steps/MotivationStep";

import ProgressBar from "./ProgressBar";
import HeroSection from "./HeroSection";
import StudyPlanResult from "./StudyPlanResult";
import FormPreview from "./FormPreview";
import ApiErrorMessage from "./ApiErrorMessage";

export default function RotaDevOnboardingForm() {
  const methods = useForm<FormValues>({
    defaultValues: {
      goal: "",
      level: "",
      hoursPerDay: "",
      daysPerWeek: "",
      motivation: "",
    },
    mode: "onSubmit",
  });

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);

  const currentField = ONBOARDING_FIELDS[step];
  const totalSteps = ONBOARDING_FIELDS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const nextStep = async () => {
    const isValid = await methods.trigger(currentField);
    if (!isValid) return;

    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 0 && !loading) {
      setStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: FormValues) => {
    const isLastFieldValid = await methods.trigger("motivation");
    if (!isLastFieldValid) return;

    try {
      setLoading(true);
      setApiError("");
      setSubmittedData(data);
      setPlan(null);

      const result = await generateStudyPlan(data);
      setPlan(result);
    } catch {
      setApiError("Não consegui gerar sua rota agora. Tenta de novo 💛");
    } finally {
      setLoading(false);
    }
  };

  const resetFormFlow = () => {
    setPlan(null);
    setApiError("");
    setSubmittedData(null);
    setStep(0);
    methods.reset();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <GoalStep />;
      case 1:
        return <LevelStep />;
      case 2:
        return <HoursStep />;
      case 3:
        return <DaysStep />;
      case 4:
        return <MotivationStep />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#0F0F0F] px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <HeroSection plan={plan} onReset={resetFormFlow} />

        <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-4 shadow-2xl sm:p-6">
          {!plan ? (
            <>
              <ProgressBar
                step={step}
                totalSteps={totalSteps}
                progress={progress}
              />

              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                  {/* hidden fields */}
                  <input
                    type="hidden"
                    {...methods.register("goal", {
                      required: "Escolha seu objetivo.",
                    })}
                  />
                  <input
                    type="hidden"
                    {...methods.register("level", {
                      required: "Escolha seu nível.",
                    })}
                  />
                  <input
                    type="hidden"
                    {...methods.register("hoursPerDay", {
                      required: "Escolha seu tempo por dia.",
                    })}
                  />
                  <input
                    type="hidden"
                    {...methods.register("daysPerWeek", {
                      required: "Escolha quantos dias por semana.",
                    })}
                  />
                  <input
                    type="hidden"
                    {...methods.register("motivation", {
                      required: "Escolha sua motivação.",
                    })}
                  />

                  {renderStep()}

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={step === 0 || loading}
                      className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 disabled:opacity-40"
                    >
                      Voltar
                    </button>

                    {step < totalSteps - 1 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={loading}
                        className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
                      >
                        Continuar
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
                      >
                        {loading ? "Gerando sua rota..." : "Gerar minha rota"}
                      </button>
                    )}
                  </div>
                </form>
              </FormProvider>

              <FormPreview data={submittedData} />

              <ApiErrorMessage message={apiError} />
            </>
          ) : (
            <StudyPlanResult plan={plan} onReset={resetFormFlow} />
          )}
        </section>
      </div>
    </main>
  );
}
