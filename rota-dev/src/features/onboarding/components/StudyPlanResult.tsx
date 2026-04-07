import { useEffect, useMemo, useState } from "react";
import type { StudyPlan } from "../types/onboarding";

type StudyPlanResultProps = {
  plan: StudyPlan;
  onReset: () => void;
};

export default function StudyPlanResult({
  plan,
  onReset,
}: StudyPlanResultProps) {
  const storageKey = useMemo(() => {
    const safeTitle = plan.planTitle?.trim() || "default-plan";
    return `rota-dev-progress:${safeTitle}`;
  }, [plan.planTitle]);

  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem(storageKey);

    if (savedProgress) {
      try {
        setCheckedTasks(JSON.parse(savedProgress) as Record<string, boolean>);
      } catch {
        setCheckedTasks({});
      }
    } else {
      setCheckedTasks({});
    }

    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(storageKey, JSON.stringify(checkedTasks));
  }, [checkedTasks, storageKey, hydrated]);

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    setCheckedTasks({});
    onReset();
  };

  return (
    <div>
      <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
        <p className="text-sm font-medium text-orange-200">
          Sua rota inicial está pronta
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">{plan.planTitle}</h2>

        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Aqui está seu ponto de partida. Agora é seguir um passo de cada vez.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {plan.days?.map((item) => (
          <div
            key={item.day}
            className="rounded-3xl border border-white/10 bg-white/5 p-5"
          >
            <p className="text-sm font-medium text-orange-300">
              Dia {item.day}
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">{item.title}</h3>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {item.description}
            </p>

            <ul className="mt-4 space-y-2">
              {item.tasks?.map((task, index) => {
                const taskKey = `${item.day}-${index}`;
                const isChecked = checkedTasks[taskKey] ?? false;

                return (
                  <li
                    key={taskKey}
                    className="rounded-2xl border border-white/10 bg-zinc-900/70 px-4 py-3"
                  >
                    <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-100">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          setCheckedTasks((prev) => ({
                            ...prev,
                            [taskKey]: e.target.checked,
                          }));
                        }}
                        className="peer mt-1 h-4 w-4 shrink-0 accent-orange-500"
                      />
                      <span className="leading-6 transition peer-checked:text-zinc-500 peer-checked:line-through">
                        {task}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleReset}
        className="mt-6 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
      >
        Gerar uma nova rota
      </button>
    </div>
  );
}
