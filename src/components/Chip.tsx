type ChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  tone?: "voice" | "song" | "echo";
};

const selectedTone = {
  voice: { background: "var(--purple-100)", borderColor: "var(--purple-300)", color: "var(--text-900)" },
  song: { background: "var(--pink-50)", borderColor: "#D6408A", color: "#D6408A" },
  echo: { background: "var(--amber-50)", borderColor: "#D98A1F", color: "#D98A1F" },
};

export function Chip({ label, selected, onClick, tone = "voice" }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="relative -my-[7px] inline-flex h-11 items-center border-0 bg-transparent p-0"
    >
      <span
        className="rounded-full border px-3.5 py-1.5 text-[12px] leading-4"
        style={selected ? selectedTone[tone] : { background: "transparent", borderColor: "var(--line)", color: "var(--text-900)" }}
      >
        {label}
      </span>
    </button>
  );
}
