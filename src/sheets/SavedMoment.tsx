import type { ReactNode } from "react";
import { motion } from "framer-motion";

type SavedMomentProps = {
  titleId: string;
  tone: "voice" | "song" | "echo";
  week?: number;
  heading?: string;
  body?: string;
  reduce: boolean | null;
  children: ReactNode;
};

const tones = {
  voice: { tile: "var(--purple-100)", check: "var(--purple-500)" },
  song: { tile: "var(--pink-200)", check: "var(--pink-500)" },
  echo: { tile: "var(--amber-100)", check: "var(--amber-500)" },
};

export function SavedMoment({ titleId, tone, week, heading = "Saved.", body, reduce, children }: SavedMomentProps) {
  const color = tones[tone];

  return (
    <div className="flex flex-col items-center px-4 pt-4 pb-2 text-center">
      <span className="grid size-14 place-items-center rounded-[12px]" style={{ background: color.tile, color: color.check }}>
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
          <motion.path
            d="M5 12.5 9.5 17 19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: "easeOut" }}
          />
        </svg>
      </span>
      <h2 id={titleId} className="mt-4 text-[22px] leading-7 font-semibold text-[var(--text-900)]">
        {heading}
      </h2>
      <p className="mt-2 text-[15px] leading-5 font-semibold text-[var(--text-900)]">{children}</p>
      <p className="mt-2 text-[15px] leading-5 text-[var(--text-400)]">
        {body ?? `It's part of week ${week} now. Echo will remember this one.`}
      </p>
    </div>
  );
}
