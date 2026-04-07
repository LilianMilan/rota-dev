import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { FormValues, StudyPlan } from "../types/onboarding";
import { ONBOARDING_FIELDS } from "../constants/onboarding-fields";
import { generateStudyPlan } from "../services/generateStudyPlan";

const PLAN_STORAGE_KEY = "rota-dev-plan";
const SUBMITTED_DATA_STORAGE_KEY = "rota-dev-submitted-data";

export function useRotaDevOnboarding() {
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

  useEffect(() => {
    const savedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
    const savedSubmittedData = localStorage.getItem(SUBMITTED_DATA_STORAGE_KEY);

    let parsedPlan: StudyPlan | null = null;
    let parsedSubmittedData: FormValues | null = null;

    if (savedPlan) {
      try {
        parsedPlan = JSON.parse(savedPlan) as StudyPlan;
        console.log("🔥 LOADED PLAN DO LOCALSTORAGE:", parsedPlan);
        setPlan(parsedPlan);
      } catch {
        localStorage.removeItem(PLAN_STORAGE_KEY);
      }
    }

    if (savedSubmittedData) {
      try {
        parsedSubmittedData = JSON.parse(savedSubmittedData) as FormValues;
        setSubmittedData(parsedSubmittedData);
      } catch {
        localStorage.removeItem(SUBMITTED_DATA_STORAGE_KEY);
      }
    }

    setHydrated(true);
  }, [form]);

  useEffect(() => {
    if (!hydrated) return;

    if (plan) {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    } else {
      localStorage.removeItem(PLAN_STORAGE_KEY);
    }
  }, [plan, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    if (submittedData) {
      localStorage.setItem(
        SUBMITTED_DATA_STORAGE_KEY,
        JSON.stringify(submittedData),
      );
    } else {
      localStorage.removeItem(SUBMITTED_DATA_STORAGE_KEY);
    }
  }, [submittedData, hydrated]);

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
  
    try {
      setLoading(true);
      setApiError("");
  
      // NÃO limpa plan antes
      setSubmittedData(data);
  
      const result = await generateStudyPlan(data);
      console.log("🚀 RESULT DA API:", result);
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
    form.reset({
      goal: "",
      level: "",
      hoursPerDay: "",
      daysPerWeek: "",
      motivation: "",
    });

    localStorage.removeItem(PLAN_STORAGE_KEY);
    localStorage.removeItem(SUBMITTED_DATA_STORAGE_KEY);
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
  };
}