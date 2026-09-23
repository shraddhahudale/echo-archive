import type { ReactNode } from "react";
import { Chip } from "../components/Chip";
import { PillButton } from "../components/PillButton";

type AnythingToAddProps = {
  tone: "voice" | "song" | "echo";
  feelings: readonly string[];
  selected: string[];
  onToggle: (feeling: string) => void;
  note: string;
  onNote: (value: string) => void;
  onSave: () => void;
  card: ReactNode;
};

export function AnythingToAdd({ tone, feelings, selected, onToggle, note, onNote, onSave, card }: AnythingToAddProps) {
  return (
    <div className="pt-2">
      <p className="text-[15px] leading-5 text-[var(--text-400)]">How are you feeling right now?</p>
      <div className="mt-4">{card}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {feelings.map((feeling) => (
          <Chip
            key={feeling}
            label={feeling}
            tone={tone}
            selected={selected.includes(feeling)}
            onClick={() => onToggle(feeling)}
          />
        ))}
      </div>
      <textarea
        value={note}
        onChange={(event) => onNote(event.target.value)}
        placeholder="Add a note... (optional)"
        className={
          tone === "song"
            ? "song-note mt-4 h-[110px] w-full resize-none rounded-[16px] bg-[var(--pink-50)] px-4 py-3 text-[15px] leading-5 text-[var(--text-900)] placeholder:text-[var(--text-400)]"
            : tone === "echo"
              ? "echo-note mt-4 h-[110px] w-full resize-none rounded-[16px] bg-[var(--amber-50)] px-4 py-3 text-[15px] leading-5 text-[var(--text-900)] placeholder:text-[var(--text-400)]"
              : "mt-4 h-[110px] w-full resize-none rounded-[16px] border-0 bg-[var(--purple-100)] px-4 py-3 text-[15px] leading-5 text-[var(--text-900)] placeholder:text-[var(--text-400)]"
        }
      />
      {tone === "echo" ? (
        <button
          type="button"
          onClick={onSave}
          className="mt-6 h-11 w-full rounded-full border border-[var(--line)] bg-white px-4 text-[13px] leading-4 font-medium text-[#D98A1F]"
        >
          Save to this week
        </button>
      ) : (
        <PillButton className="mt-6 w-full" tone={tone === "song" ? "pink" : "purple"} onClick={onSave}>
          Save to this week
        </PillButton>
      )}
    </div>
  );
}
