import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { BreathPhase, BreathingPattern } from "../../data/breathPatterns";
import { useWakeLock } from "../../hooks/useWakeLock";
import { BreathBlob, BreathVignette } from "./BreathBlob";
import { Choose, Countdown } from "./Choose";
import { Session } from "./Session";

type Step =
  | { name: "choose" }
  | { name: "countdown"; pattern: BreathingPattern }
  | { name: "session"; pattern: BreathingPattern };

type BreathProps = {
  onBackHome: () => void;
};

const REST_BREATH = 0.4;

export function Breath({ onBackHome }: BreathProps) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>({ name: "choose" });
  const [breath, setBreath] = useState(REST_BREATH);
  const [blobPhase, setBlobPhase] = useState<BreathPhase | "idle" | "paused">("idle");
  const [dimmed, setDimmed] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const exiting = useRef(false);
  const breathRef = useRef(breath);
  breathRef.current = breath;

  useWakeLock(step.name === "countdown" || step.name === "session");

  const goHome = useCallback(() => {
    onBackHome();
  }, [onBackHome]);

  const returnToChoose = useCallback(() => {
    if (exiting.current) return;
    exiting.current = true;
    setUiVisible(false);
    setDimmed(false);
    setBlobPhase("idle");

    const from = breathRef.current;
    const start = performance.now();
    const duration = reduce ? 0 : 400;

    const tick = (now: number) => {
      const p = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      // easeOutCubic — soft settle to rest
      const eased = 1 - (1 - p) ** 3;
      setBreath(from + (REST_BREATH - from) * eased);
      if (p < 1) {
        requestAnimationFrame(tick);
        return;
      }
      setStep({ name: "choose" });
      setUiVisible(true);
      exiting.current = false;
    };
    requestAnimationFrame(tick);
  }, [reduce]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[var(--dark-bg)] pt-[47px] text-white">
      <BreathBlob breath={breath} phase={blobPhase} dimmed={dimmed} />
      <BreathVignette breath={breath} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {uiVisible && (
            <motion.div
              key={step.name === "session" ? `session-${step.pattern.id}` : step.name}
              className="flex min-h-0 flex-1 flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
            >
              {step.name === "choose" && (
                <Choose
                  onSelect={(pattern) => {
                    setBreath(0.15);
                    setBlobPhase("idle");
                    setStep({ name: "countdown", pattern });
                  }}
                  onBackHome={goHome}
                  onBreathChange={setBreath}
                />
              )}
              {step.name === "countdown" && (
                <Countdown
                  onBreathChange={setBreath}
                  onCancel={() => {
                    setBlobPhase("idle");
                    setStep({ name: "choose" });
                  }}
                  onDone={() => {
                    setBlobPhase("inhale");
                    setStep({ name: "session", pattern: step.pattern });
                  }}
                />
              )}
              {step.name === "session" && (
                <Session
                  pattern={step.pattern}
                  onExit={returnToChoose}
                  onBreathChange={setBreath}
                  onPhaseChange={setBlobPhase}
                  onDimmedChange={setDimmed}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
