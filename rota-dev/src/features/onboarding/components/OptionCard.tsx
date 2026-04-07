type OptionCardProps = {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
};

export default function OptionCard({
  label,
  value,
  selected,
  onSelect,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full rounded-2xl border px-4 py-4 text-left text-sm font-medium transition-all duration-200 ${
        selected
          ? "border-orange-500 bg-orange-500/20 text-white shadow-lg"
          : "border-white/10 bg-zinc-900/70 text-zinc-200 hover:border-orange-400/50 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}
