import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  instructionFor,
  type BreathPhase,
  type BreathingPattern,
} from "../../data/breathPatterns";
import { DarkPill } from "./DarkPill";
import { Display } from "../../components/Display";
import { Eyebrow } from "../../components/Eyebrow";
import { useBreathingCycle } from "../../hooks/useBreathingCycle";

type SessionProps = {
  pattern: BreathingPattern;
  onExit: () => void;
  onBreathChange: (value: number) => void;
  onPhaseChange: (phase: BreathPhase | "paused") => void;
  onDimmedChange: (dimmed: boolean) => void;
};

export function Session({
  pattern,
  onExit,
  onBreathChange,
  onPhaseChange,
  onDimmedChange,
}: SessionProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(true);
  const finished = useRef(false);
  const cycle = useBreathingCycle(pattern, active, () => {
    if (finished.current) return;
    finished.current = true;
    setActive(false);
    onExit();
  });

  const cycleRef = useRef(cycle);
  cycleRef.current = cycle;
  const onBreathRef = useRef(onBreathChange);
  onBreathRef.current = onBreathChange;
  const onPhaseRef = useRef(onPhaseChange);
  onPhaseRef.current = onPhaseChange;
  const onDimmedRef = useRef(onDimmedChange);
  onDimmedRef.current = onDimmedChange;

  const displayPhase: BreathPhase | "paused" = cycle.paused ? "paused" : cycle.phase;
  const word = cycle.paused ? "paused" : cycle.phase;
  const instruction = cycle.paused ? "Tap to resume" : instructionFor(pattern, cycle.phase);
  const progressFill = cycle.phase === "hold" ? 1 - cycle.phaseProgress : cycle.phaseProgress;
  const countLabel = cycle.countLeft === 1 ? "1 COUNT" : `${cycle.countLeft} COUNTS`;
  const wordY = reduce || cycle.paused ? 0 : cycle.phase === "inhale" ? -4 : 0;

  useEffect(() => {
    onBreathRef.current(cycle.breath);
    onPhaseRef.current(displayPhase);
    onDimmedRef.current(cycle.paused);
  }, [cycle.breath, cycle.paused, displayPhase]);

  function endEarly() {
    if (finished.current) return;
    finished.current = true;
    cycleRef.current.end();
    setActive(false);
    onExit();
  }

  const endEarlyRef = useRef(endEarly);
  endEarlyRef.current = endEarly;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        const snap = cycleRef.current;
        if (snap.paused) snap.resume();
        else snap.pause();
      } else if (event.key === "Escape") {
        event.preventDefault();
        endEarlyRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function togglePause() {
    if (cycle.paused) cycle.resume();
    else cycle.pause();
  }

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col px-5">
      <button
        type="button"
        aria-label={cycle.paused ? "Resume breathing" : "Pause breathing"}
        onClick={togglePause}
        className="absolute inset-0 z-[5] cursor-pointer border-0 bg-transparent"
      />

      <div className="pointer-events-none relative z-10 pt-2">
        <Eyebrow>Relief mode · {pattern.eyebrowName}</Eyebrow>
      </div>

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center" style={{ transform: `translateY(${wordY}px)` }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={word}
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              aria-live="polite"
            >
              <Display size={44} tone="light" weight={400}>
                {word}
              </Display>
            </motion.div>
          </AnimatePresence>
          <p className="mt-3 text-center font-sans text-[14px] leading-5 text-white/55">{instruction}</p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <div
            className="h-0.5 w-[120px] overflow-hidden rounded-full bg-white/20"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressFill * 100)}
            aria-label="Phase progress"
          >
            <div
              className="h-full rounded-full bg-white/90"
              style={{ width: `${Math.min(100, Math.max(0, progressFill * 100))}%` }}
            />
          </div>
          <p className="font-sans text-[10px] leading-3 font-medium tracking-[0.2em] text-white/45 uppercase">
            {cycle.paused ? "PAUSED" : countLabel}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex justify-center pb-12">
        <DarkPill onClick={endEarly} aria-label="End session">
          End Session
        </DarkPill>
      </div>
    </div>
  );
}
