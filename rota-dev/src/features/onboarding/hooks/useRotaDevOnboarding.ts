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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (plan) {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    } else {
      localStorage.removeItem(PLAN_STORAGE_KEY);
    }
  }, [plan]);

  useEffect(() => {
    if (submittedData) {
      localStorage.setItem(
        SUBMITTED_DATA_STORAGE_KEY,
        JSON.stringify(submittedData),
      );
    } else {
      localStorage.removeItem(SUBMITTED_DATA_STORAGE_KEY);
    }
  }, [submittedData]);

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
    form.reset();

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
    nextStep,
    prevStep,
    onSubmit,
    resetFormFlow,
  };
}