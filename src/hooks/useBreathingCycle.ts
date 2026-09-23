import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildBreathTimeline,
  easeInOutSine,
  type BreathPhase,
  type BreathingPattern,
  type BreathSegment,
} from "../data/breathPatterns";

export type BreathingCycleState = {
  phase: BreathPhase;
  phaseProgress: number;
  countLeft: number;
  breath: number;
  cycle: number;
  elapsed: number;
  paused: boolean;
  complete: boolean;
  pause: () => void;
  resume: () => void;
  end: () => void;
};

type Snapshot = {
  phase: BreathPhase;
  phaseProgress: number;
  countLeft: number;
  breath: number;
  cycle: number;
  elapsed: number;
  paused: boolean;
  complete: boolean;
};

const idle: Snapshot = {
  phase: "inhale",
  phaseProgress: 0,
  countLeft: 0,
  breath: 0,
  cycle: 1,
  elapsed: 0,
  paused: false,
  complete: false,
};

function sample(segments: BreathSegment[], elapsedSec: number): Snapshot & { done: boolean } {
  let t = elapsedSec;
  for (const segment of segments) {
    if (t < segment.duration) {
      const phaseProgress = Math.min(1, Math.max(0, t / segment.duration));
      const eased =
        segment.breathFrom === segment.breathTo
          ? 0
          : easeInOutSine(phaseProgress);
      const breath =
        segment.breathFrom === segment.breathTo
          ? segment.breathFrom
          : segment.breathFrom + (segment.breathTo - segment.breathFrom) * eased;
      const remaining = segment.duration - t;
      const countLeft = Math.max(1, Math.ceil(remaining - 1e-6));
      return {
        phase: segment.phase,
        phaseProgress,
        countLeft,
        breath,
        cycle: segment.cycle,
        elapsed: elapsedSec,
        paused: false,
        complete: false,
        done: false,
      };
    }
    t -= segment.duration;
  }
  const last = segments[segments.length - 1];
  return {
    phase: last?.phase ?? "exhale",
    phaseProgress: 1,
    countLeft: 1,
    breath: last?.breathTo ?? 0,
    cycle: last?.cycle ?? 1,
    elapsed: elapsedSec,
    paused: false,
    complete: true,
    done: true,
  };
}

export function useBreathingCycle(
  pattern: BreathingPattern | null,
  active: boolean,
  onComplete?: (result: { cycles: number; elapsed: number }) => void,
): BreathingCycleState {
  const [snap, setSnap] = useState<Snapshot>(idle);
  const pausedRef = useRef(false);
  const startedAtRef = useRef(0);
  const pausedAccumRef = useRef(0);
  const pauseStartedRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const timelineRef = useRef<BreathSegment[]>([]);
  const patternRef = useRef(pattern);
  patternRef.current = pattern;

  const pause = useCallback(() => {
    if (!active || endedRef.current || completedRef.current || pausedRef.current) return;
    pausedRef.current = true;
    pauseStartedRef.current = performance.now();
    setSnap((prev) => ({ ...prev, paused: true }));
  }, [active]);

  const resume = useCallback(() => {
    if (!pausedRef.current || pauseStartedRef.current == null) return;
    pausedAccumRef.current += performance.now() - pauseStartedRef.current;
    pauseStartedRef.current = null;
    pausedRef.current = false;
    setSnap((prev) => ({ ...prev, paused: false }));
  }, []);

  const end = useCallback(() => {
    endedRef.current = true;
    pausedRef.current = false;
    pauseStartedRef.current = null;
  }, []);

  useEffect(() => {
    if (!active || !pattern) {
      setSnap(idle);
      return;
    }

    timelineRef.current = buildBreathTimeline(pattern);
    startedAtRef.current = performance.now();
    pausedAccumRef.current = 0;
    pauseStartedRef.current = null;
    pausedRef.current = false;
    endedRef.current = false;
    completedRef.current = false;

    let raf = 0;
    let lastPhase: BreathPhase | null = null;

    const tick = (now: number) => {
      if (endedRef.current) return;

      const pauseExtra =
        pausedRef.current && pauseStartedRef.current != null
          ? now - pauseStartedRef.current
          : 0;
      const elapsedSec = Math.max(
        0,
        (now - startedAtRef.current - pausedAccumRef.current - pauseExtra) / 1000,
      );

      const next = sample(timelineRef.current, elapsedSec);

      if (next.done && !completedRef.current) {
        completedRef.current = true;
        const cycles = patternRef.current?.cycles ?? next.cycle;
        const result = { cycles, elapsed: elapsedSec };
        setSnap({
          phase: next.phase,
          phaseProgress: 1,
          countLeft: next.countLeft,
          breath: next.breath,
          cycle: cycles,
          elapsed: elapsedSec,
          paused: false,
          complete: true,
        });
        onCompleteRef.current?.(result);
        return;
      }

      if (!pausedRef.current) {
        if (lastPhase !== null && lastPhase !== next.phase) {
          try {
            navigator.vibrate?.(15);
          } catch {
            /* ignore */
          }
        }
        lastPhase = next.phase;
        setSnap({
          phase: next.phase,
          phaseProgress: next.phaseProgress,
          countLeft: next.countLeft,
          breath: next.breath,
          cycle: next.cycle,
          elapsed: next.elapsed,
          paused: false,
          complete: false,
        });
      }

      raf = requestAnimationFrame(tick);
    };

    // Initial haptic for first inhale
    try {
      navigator.vibrate?.(15);
    } catch {
      /* ignore */
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, pattern]);

  return {
    ...snap,
    pause,
    resume,
    end,
  };
}
