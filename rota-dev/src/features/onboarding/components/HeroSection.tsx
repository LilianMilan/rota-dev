import type { StudyPlan } from "../types/onboarding";

type HeroSectionProps = {
  plan: StudyPlan | null;
  onReset: () => void;
};

export default function HeroSection({ plan, onReset }: HeroSectionProps) {
  return (
    <section className="pt-4 lg:pt-12">
      <div className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1 text-sm text-orange-200">
        🦊 Planner com agente de IA para dev iniciante
      </div>

      <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
        Eu te mostro o <span className="text-orange-500">caminho</span> pra
        virar dev.
      </h1>

      <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
        Responda algumas perguntinhas e o Rota Dev monta sua rota inicial de
        estudos de forma simples, prática e personalizada.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-zinc-400">Passo 1</p>
          <p className="mt-2 font-semibold">Você responde</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-zinc-400">Passo 2</p>
          <p className="mt-2 font-semibold">A IA organiza</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-zinc-400">Passo 3</p>
          <p className="mt-2 font-semibold">Você segue a rota</p>
        </div>
      </div>

      {plan ? (
        <div className="mt-8 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
          <p className="text-sm font-medium text-orange-200">
            Sua rota foi criada ✨
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-200">
            Agora você já tem um começo claro. O próximo passo é transformar
            isso em progresso real, um dia de cada vez.
          </p>

          <button
            type="button"
            onClick={onReset}
            className="mt-4 rounded-2xl border border-orange-500/30 px-4 py-2 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/10"
          >
            Criar outra rota
          </button>
        </div>
      ) : null}
    </section>
  );
}
