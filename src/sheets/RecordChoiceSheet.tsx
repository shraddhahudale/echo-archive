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
    (state) => state.entries.filter((entry) => entry.week === state.user.week).length,
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
      <div className="mt-6 flex gap-3">
        <ChoiceCard
          label="Tap to record voice note"
          icon={Mic}
          soft="var(--purple-300)"
          core="var(--purple-500)"
          onClick={onVoice}
          delay={0.08}
          reduce={reduce}
        />
        <ChoiceCard
          label="Tap to archive a song"
          icon={Music}
          soft="var(--pink-200)"
          core="var(--pink-500)"
          onClick={onSong}
          delay={0.12}
          reduce={reduce}
        />
      </div>
      <motion.button
        type="button"
        onClick={onEcho}
        variants={rise(0.16, reduce)}
        className="mt-3 flex h-[88px] w-full items-center gap-3 rounded-[28px] border border-[var(--line)] bg-[var(--bg)] px-4 text-left shadow-[var(--shadow-card)]"
      >
        <SoftMark icon={Users} soft="var(--amber-100)" core="var(--amber-500)" size={56} />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] leading-5 font-semibold text-[var(--text-900)]">Add an echo</span>
          <span className="mt-0.5 block text-[12px] leading-4 text-[var(--text-400)]">
            Invite someone or add what they've shared
          </span>
        </span>
        <ChevronRight size={20} strokeWidth={2} className="shrink-0 text-[var(--text-400)]" aria-hidden="true" />
      </motion.button>
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
  icon,
  soft,
  core,
  onClick,
  delay,
  reduce,
}: {
  label: string;
  icon: LucideIcon;
  soft: string;
  core: string;
  onClick: () => void;
  delay: number;
  reduce: boolean | null;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={rise(delay, reduce)}
      className="flex min-h-[196px] flex-1 flex-col items-center justify-center gap-4 rounded-[28px] border border-[var(--line)] bg-[var(--bg)] px-3 py-5 shadow-[var(--shadow-card)]"
    >
      <SoftMark icon={icon} soft={soft} core={core} size={96} />
      <span className="text-center text-[13px] leading-5 font-medium text-[var(--text-900)]">{label}</span>
    </motion.button>
  );
}

function SoftMark({ icon: Icon, soft, core, size }: { icon: LucideIcon; soft: string; core: string; size: number }) {
  const mid = Math.round(size * 0.7);
  const coreSize = Math.round(size * 0.5);
  const iconSize = size > 70 ? 22 : 18;

  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <span
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: `color-mix(in srgb, ${soft} 45%, transparent)`,
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          width: mid,
          height: mid,
          background: `color-mix(in srgb, ${soft} 80%, transparent)`,
        }}
      />
      <span
        className="relative grid place-items-center rounded-full text-white"
        style={{ width: coreSize, height: coreSize, background: core }}
      >
        <Icon size={iconSize} strokeWidth={2} aria-hidden="true" />
      </span>
    </span>
  );
}
