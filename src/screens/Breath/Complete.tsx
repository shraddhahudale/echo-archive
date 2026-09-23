import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { BreathingPattern } from "../../data/breathPatterns";
import { BreathBlob, BreathVignette } from "./BreathBlob";
import { DarkPill } from "./DarkPill";

const feelings = ["calmer", "lighter", "same", "still anxious"] as const;

type CompleteProps = {
  pattern: BreathingPattern;
  cycles: number;
  elapsed: number;
  onAgain: () => void;
  onBackHome: () => void;
};

export function Complete({ pattern, cycles, elapsed, onAgain, onBackHome }: CompleteProps) {
  const reduce = useReducedMotion();
  const [breath, setBreath] = useState(0.4);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (reduce) {
      setBreath(0.4);
      return;
    }
    let raf = 0;
    const start = performance.now();
    // Settle toward rest, then idle
    const tick = (now: number) => {
      const elapsedMs = now - start;
      if (elapsedMs < 800) {
        setBreath(0.4 + (1 - elapsedMs / 800) * 0.15);
      } else {
        const t = ((elapsedMs - 800) % 10000) / 10000;
        setBreath(0.35 + (Math.sin(t * Math.PI * 2) * 0.5 + 0.5) * 0.2);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col px-5">
      <BreathBlob breath={breath} phase="idle" />
      <BreathVignette breath={breath} />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <h1 className="font-serif text-[40px] leading-[44px] font-normal text-white italic">Well done.</h1>
        <p className="mt-3 text-[14px] leading-5 text-white/55">
          {cycles} {cycles === 1 ? "cycle" : "cycles"} · {formatDuration(elapsed)}
        </p>

        <p className="mt-10 text-[15px] leading-5 text-white">How do you feel now?</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {feelings.map((feeling) => {
            const on = selected === feeling;
            return (
              <button
                key={feeling}
                type="button"
                aria-pressed={on}
                aria-label={feeling}
                onClick={() => setSelected(on ? null : feeling)}
                className="rounded-full border-0 px-3.5 py-1.5 text-[12px] leading-4 text-white transition-colors"
                style={{
                  background: on ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.18)",
                }}
              >
                {feeling}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3 pb-12">
        <DarkPill onClick={onAgain} aria-label={`Breathe again with ${pattern.name}`}>
          Breathe again
        </DarkPill>
        <DarkPill onClick={onBackHome} aria-label="Back to home">
          Back to home
        </DarkPill>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
