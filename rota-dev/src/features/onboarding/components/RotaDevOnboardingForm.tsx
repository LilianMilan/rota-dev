import { FormProvider } from "react-hook-form";
import { useEffect } from "react";

import { useRotaDevOnboarding } from "../hooks/useRotaDevOnboarding";

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
  const {
    form,
    step,
    totalSteps,
    progress,
    loading,
    apiError,
    submittedData,
    plan,
    hydrated,
    nextStep,
    prevStep,
    onSubmit,
    resetFormFlow,
  } = useRotaDevOnboarding();

  useEffect(() => {
    if (hydrated && submittedData) {
      form.reset(submittedData);
    }
  }, [hydrated, submittedData, form]);

  if (!hydrated) {
    return null;
  }

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
          {plan && plan.days?.length > 0 ? (
            <StudyPlanResult plan={plan} onReset={resetFormFlow} />
          ) : (
            <>
              <ProgressBar
                step={step}
                totalSteps={totalSteps}
                progress={progress}
              />

              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <input
                    type="hidden"
                    {...form.register("goal", {
                      required: "Escolha seu objetivo.",
                    })}
                  />
                  <input
                    type="hidden"
                    {...form.register("level", {
                      required: "Escolha seu nível.",
                    })}
                  />
                  <input
                    type="hidden"
                    {...form.register("hoursPerDay", {
                      required: "Escolha seu tempo por dia.",
                    })}
                  />
                  <input
                    type="hidden"
                    {...form.register("daysPerWeek", {
                      required: "Escolha quantos dias por semana.",
                    })}
                  />
                  <input
                    type="hidden"
                    {...form.register("motivation", {
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
          )}
        </section>
      </div>
    </main>
  );
}
