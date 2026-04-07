type StepCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  error?: string;
};

export default function StepCard({
  title,
  subtitle,
  children,
  error,
}: StepCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
      <div className="mb-5">
        <p className="text-sm font-medium text-orange-300">Rota Dev</p>
        <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-300">{subtitle}</p>
      </div>

      {children}

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
