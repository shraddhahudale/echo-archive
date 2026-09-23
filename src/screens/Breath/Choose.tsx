import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { breathPatterns, type BreathingPattern } from "../../data/breathPatterns";
import { DarkPill } from "./DarkPill";

type ChooseProps = {
  onSelect: (pattern: BreathingPattern) => void;
  onBackHome: () => void;
  onBreathChange: (value: number) => void;
};

export function Choose({ onSelect, onBackHome, onBreathChange }: ChooseProps) {
  const reduce = useReducedMotion();
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const onBreathRef = useRef(onBreathChange);
  onBreathRef.current = onBreathChange;

  useEffect(() => {
    if (reduce) {
      onBreathRef.current(0.4);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = ((now - start) % 10000) / 10000;
      onBreathRef.current(0.35 + (Math.sin(t * Math.PI * 2) * 0.5 + 0.5) * 0.2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  function pick(pattern: BreathingPattern) {
    if (leavingId) return;
    setLeavingId(pattern.id);
    window.setTimeout(() => onSelect(pattern), reduce ? 120 : 320);
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col px-5">
      <div className="relative z-10 pt-2">
        <p className="text-center font-sans text-[10px] leading-3 font-medium tracking-[0.2em] text-white/50 uppercase">
          Relief mode
        </p>
        <h1 className="mt-3 text-center font-sans text-[24px] leading-7 font-semibold tracking-[-0.01em] text-white">
          Choose your breathing
        </h1>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3">
        {breathPatterns.map((pattern) => {
          const selected = leavingId === pattern.id;
          const faded = leavingId != null && !selected;
          return (
            <button
              key={pattern.id}
              type="button"
              aria-label={`${pattern.name}. ${pattern.subtitle}`}
              disabled={leavingId != null}
              onClick={() => pick(pattern)}
              className="flex h-[60px] w-[260px] flex-col items-center justify-center rounded-[20px] border-0 transition-[transform,opacity,background-color] duration-300"
              style={{
                background: selected ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.18)",
                opacity: faded ? 0 : 1,
                transform: selected && !reduce ? "scale(0.97)" : "scale(1)",
              }}
            >
              <span className="font-sans text-[13px] leading-4 font-medium text-white">{pattern.name}</span>
              <span className="mt-0.5 font-sans text-[11px] leading-3.5 text-white/60">{pattern.subtitle}</span>
            </button>
          );
        })}
      </div>

      <div className="relative z-10 flex justify-center pb-12">
        <DarkPill onClick={onBackHome} aria-label="Back to home">
          Back to home
        </DarkPill>
      </div>
    </div>
  );
}

type CountdownProps = {
  onDone: () => void;
  onCancel: () => void;
  onBreathChange: (value: number) => void;
};

export function Countdown({ onDone, onCancel, onBreathChange }: CountdownProps) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(3);
  const onDoneRef = useRef(onDone);
  const onBreathRef = useRef(onBreathChange);
  onDoneRef.current = onDone;
  onBreathRef.current = onBreathChange;

  useEffect(() => {
    let cancelled = false;
    const bumps = [0.18, 0.12, 0.06];
    let step = 0;
    const timers: number[] = [];

    function runStep() {
      if (cancelled) return;
      const value = 3 - step;
      setN(value);
      if (!reduce) {
        onBreathRef.current(bumps[step] ?? 0);
        timers.push(
          window.setTimeout(() => {
            if (!cancelled) onBreathRef.current(lerpTowardEmpty(step));
          }, 280),
        );
      } else {
        onBreathRef.current(0);
      }

      if (step >= 2) {
        timers.push(
          window.setTimeout(() => {
            if (!cancelled) {
              onBreathRef.current(0);
              onDoneRef.current();
            }
          }, 1000),
        );
        return;
      }
      step += 1;
      timers.push(window.setTimeout(runStep, 1000));
    }

    runStep();
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reduce]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col px-5">
      <div className="relative z-10 pt-2">
        <p className="text-center font-sans text-[10px] leading-3 font-medium tracking-[0.2em] text-white/50 uppercase">
          Relief mode · Starting
        </p>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={n}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="font-serif text-[44px] leading-[48px] font-normal text-white italic"
            aria-live="polite"
          >
            {n}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex justify-center pb-12">
        <DarkPill onClick={onCancel} aria-label="Cancel countdown">
          Cancel
        </DarkPill>
      </div>
    </div>
  );
}

function lerpTowardEmpty(step: number): number {
  if (step === 0) return 0.08;
  if (step === 1) return 0.04;
  return 0;
}
