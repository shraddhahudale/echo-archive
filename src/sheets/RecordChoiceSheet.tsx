import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Mic, Music, Users, type LucideIcon } from "lucide-react";
import { useArchiveStore } from "../store/useArchiveStore";

type RecordChoiceSheetProps = {
  titleId: string;
  onVoice: () => void;
  onSong: () => void;
  onEcho: () => void;
};

function rise(delay: number, reduce: boolean | null) {
  if (reduce) {
    return {
      hidden: { opacity: 0 },
      shown: { opacity: 1, transition: { duration: 0.15 } },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    };
  }
  return {
    hidden: { opacity: 0, y: 12 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" as const, delay } },
    exit: { opacity: 0, y: 12, transition: { duration: 0.18, ease: "easeIn" as const } },
  };
}

export function RecordChoiceSheet({ titleId, onVoice, onSong, onEcho }: RecordChoiceSheetProps) {
  const reduce = useReducedMotion();
  const savedThisWeek = useArchiveStore(
    (state) => state.entries.reduce((count, entry) => (entry.week === state.user.week ? count + 1 : count), 0),
  );
  const hint =
    savedThisWeek === 0
      ? "You haven't recorded this week yet."
      : `You've saved ${savedThisWeek} moments this week.`;

  return (
    <div className="px-5 pb-8">
      <h2 id={titleId} className="text-center text-[17px] leading-[22px] font-semibold text-[var(--text-900)]">
        How would you like to record this moment?
      </h2>
      <div className="mt-6 flex flex-col gap-3">
        <ChoiceCard
          label="Add a voice note"
          icon={Mic}
          accent="var(--purple-500)"
          tint="active:bg-[var(--purple-50)]"
          onClick={onVoice}
          delay={0.08}
          reduce={reduce}
        />
        <ChoiceCard
          label="Archive a song"
          icon={Music}
          accent="var(--pink-500)"
          tint="active:bg-[var(--pink-50)]"
          onClick={onSong}
          delay={0.12}
          reduce={reduce}
        />
        <ChoiceCard
          label="Add an echo"
          icon={Users}
          accent="var(--amber-500)"
          tint="active:bg-[var(--amber-50)]"
          onClick={onEcho}
          delay={0.16}
          reduce={reduce}
        />
      </div>
      <motion.p
        variants={rise(0.2, reduce)}
        className="mt-4 rounded-[16px] bg-[var(--purple-50)] px-4 py-3 text-center text-[13px] leading-5 text-[var(--text-400)]"
      >
        A song, a feeling, a moment, anything worth keeping. {hint}
      </motion.p>
    </div>
  );
}

function ChoiceCard({
  label,
  icon: Icon,
  accent,
  tint,
  onClick,
  delay,
  reduce,
}: {
  label: string;
  icon: LucideIcon;
  accent: string;
  tint: string;
  onClick: () => void;
  delay: number;
  reduce: boolean | null;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={rise(delay, reduce)}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      className={`flex h-[72px] w-full items-center rounded-[20px] border border-[var(--line)] bg-white pr-4 pl-4 text-left shadow-[var(--shadow-card)] ${tint}`}
    >
      <span
        className="grid size-10 shrink-0 place-items-center rounded-full text-white"
        style={{
          background: accent,
          boxShadow: `0 0 0 4px color-mix(in srgb, ${accent} 22%, transparent)`,
        }}
      >
        <Icon size={18} strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="ml-3.5 text-[16px] leading-5 font-medium text-[var(--text-900)]">{label}</span>
      <ChevronRight size={20} strokeWidth={2} className="ml-auto shrink-0 text-[var(--future-day)]" aria-hidden="true" />
    </motion.button>
  );
}
