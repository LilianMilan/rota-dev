type ProgressBarProps = {
  step: number;
  totalSteps: number;
  progress: number;
};

export default function ProgressBar({
  step,
  totalSteps,
  progress,
}: ProgressBarProps) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
        <span>
          Etapa {step + 1} de {totalSteps}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
