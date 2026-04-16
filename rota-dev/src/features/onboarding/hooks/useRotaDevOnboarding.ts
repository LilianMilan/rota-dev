import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@clerk/clerk-react";

import type { FormValues, StudyPlan } from "../types/onboarding";
import { ONBOARDING_FIELDS } from "../constants/onboarding-fields";
import { generateStudyPlan } from "../services/generateStudyPlan";
import { useProStatus } from "../../../contexts/ProStatusContext";

const PLAN_STORAGE_KEY = "rota-dev-plan";
const SUBMITTED_DATA_STORAGE_KEY = "rota-dev-submitted-data";
const PLAN_COUNT_KEY = "rota-dev-plan-count";
const TRIAL_START_KEY = "rota-dev-trial-start";
const TRIAL_DAYS = 7;

export function useRotaDevOnboarding() {
  const { isPro, planType, loading: proLoading, refetch: refetchProStatus } = useProStatus();
  const { user } = useUser();

  const form = useForm<FormValues>({
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
  const [hydrated, setHydrated] = useState(false);
  const [showGenerationPaywall, setShowGenerationPaywall] = useState(false);
  const [paywallBlockFree, setPaywallBlockFree] = useState(false);
  const [monthlyLimitReached, setMonthlyLimitReached] = useState(false);


  // Verifica limite mensal Pro ao entrar na página
  useEffect(() => {
    if (!isPro || !user) return;
    const monthlyLimit = planType === "lifetime" ? 8 : 4;
    void fetch(`/api/plan-count-month?clerk_id=${user.id}`)
      .then(r => r.json())
      .then((d: { count: number }) => { if (d.count >= monthlyLimit) setMonthlyLimitReached(true); })
      .catch(() => {});
  }, [isPro, planType, user?.id]);

  // Hidrata estado — Pro usa nuvem, free usa localStorage
  useEffect(() => {
    if (proLoading) return;

    if (isPro) {
      // Pro: limpa qualquer resquício de localStorage
      localStorage.removeItem(PLAN_STORAGE_KEY);
      localStorage.removeItem(SUBMITTED_DATA_STORAGE_KEY);
    } else {
      // Free: carrega do localStorage
      const savedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
      const savedSubmittedData = localStorage.getItem(SUBMITTED_DATA_STORAGE_KEY);

      if (savedPlan) {
        try {
          setPlan(JSON.parse(savedPlan) as StudyPlan);
        } catch {
          localStorage.removeItem(PLAN_STORAGE_KEY);
        }
      }

      if (savedSubmittedData) {
        try {
          setSubmittedData(JSON.parse(savedSubmittedData) as FormValues);
        } catch {
          localStorage.removeItem(SUBMITTED_DATA_STORAGE_KEY);
        }
      }
    }

    setHydrated(true);
  }, [proLoading, isPro]);

  // Persiste plano no localStorage apenas para free users
  useEffect(() => {
    if (!hydrated || isPro) return;

    if (plan) {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    } else {
      localStorage.removeItem(PLAN_STORAGE_KEY);
    }
  }, [plan, hydrated, isPro]);

  // Persiste dados do formulário no localStorage apenas para free users
  useEffect(() => {
    if (!hydrated || isPro) return;

    if (submittedData) {
      localStorage.setItem(SUBMITTED_DATA_STORAGE_KEY, JSON.stringify(submittedData));
    } else {
      localStorage.removeItem(SUBMITTED_DATA_STORAGE_KEY);
    }
  }, [submittedData, hydrated, isPro]);

  const currentField = ONBOARDING_FIELDS[step];
  const totalSteps = ONBOARDING_FIELDS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const nextStep = async () => {
    const isValid = await form.trigger(currentField);

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
    const isLastFieldValid = await form.trigger("motivation");

    if (!isLastFieldValid) return;

    // Verifica limite de planos
    if (!isPro) {
      const count = parseInt(localStorage.getItem(PLAN_COUNT_KEY) ?? "0", 10);
      if (count >= 1) { setPaywallBlockFree(true); setShowGenerationPaywall(true); return; }
    } else if (user) {
      const monthlyLimit = planType === "lifetime" ? 8 : 4;
      const res = await fetch(`/api/plan-count-month?clerk_id=${user.id}`);
      if (res.ok) {
        const { count } = await res.json() as { count: number };
        if (count >= monthlyLimit) {
          setApiError(`Você já gerou ${monthlyLimit} planos este mês. Limite renova no primeiro dia do próximo mês.`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      setApiError("");

      // NÃO limpa plan antes
      setSubmittedData(data);

      const result = await generateStudyPlan(data);
      setPlan(result);

      if (isPro && user) {
        void fetch("/api/save-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerk_id: user.id, plan: result, checkedTasks: [] }),
        });
      } else {
        // Free: incrementa contador e salva início do trial
        const prev = parseInt(localStorage.getItem(PLAN_COUNT_KEY) ?? "0", 10);
        localStorage.setItem(PLAN_COUNT_KEY, String(prev + 1));
        if (!localStorage.getItem(TRIAL_START_KEY)) {
          localStorage.setItem(TRIAL_START_KEY, String(Date.now()));
        }
      }

      refetchProStatus();
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
    form.reset({
      goal: "",
      level: "",
      hoursPerDay: "",
      daysPerWeek: "",
      motivation: "",
    });

    localStorage.removeItem(PLAN_STORAGE_KEY);
    localStorage.removeItem(SUBMITTED_DATA_STORAGE_KEY);
    // NÃO remove PLAN_COUNT_KEY nem TRIAL_START_KEY — persistem entre resets
  };

  return {
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
    showGenerationPaywall,
    setShowGenerationPaywall,
    paywallBlockFree,
    monthlyLimitReached,
  };
}