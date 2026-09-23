import { useCallback, useState } from "react";
import type { BreathingPattern } from "../../data/breathPatterns";
import { useWakeLock } from "../../hooks/useWakeLock";
import { Choose, Countdown } from "./Choose";
import { Complete } from "./Complete";
import { Session, type SessionResult } from "./Session";

type Step =
  | { name: "choose" }
  | { name: "countdown"; pattern: BreathingPattern }
  | { name: "session"; pattern: BreathingPattern }
  | { name: "complete"; pattern: BreathingPattern; result: SessionResult };

type BreathProps = {
  onBackHome: () => void;
};

export function Breath({ onBackHome }: BreathProps) {
  const [step, setStep] = useState<Step>({ name: "choose" });
  const [countdownBreath, setCountdownBreath] = useState(0);

  useWakeLock(step.name === "countdown" || step.name === "session");

  const goHome = useCallback(() => {
    onBackHome();
  }, [onBackHome]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[var(--dark-bg)] pt-[47px] text-white">
      <div className="flex min-h-0 flex-1 flex-col">
        {step.name === "choose" && (
          <Choose
            onSelect={(pattern) => {
              setCountdownBreath(0.15);
              setStep({ name: "countdown", pattern });
            }}
            onBackHome={goHome}
          />
        )}
        {step.name === "countdown" && (
          <Countdown
            breath={countdownBreath}
            onBreathChange={setCountdownBreath}
            onCancel={() => setStep({ name: "choose" })}
            onDone={() => setStep({ name: "session", pattern: step.pattern })}
          />
        )}
        {step.name === "session" && (
          <Session
            pattern={step.pattern}
            onComplete={(result) => setStep({ name: "complete", pattern: step.pattern, result })}
            onEnd={(result) => setStep({ name: "complete", pattern: step.pattern, result })}
          />
        )}
        {step.name === "complete" && (
          <Complete
            pattern={step.pattern}
            cycles={step.result.cycles}
            elapsed={step.result.elapsed}
            onAgain={() => {
              setCountdownBreath(0.15);
              setStep({ name: "countdown", pattern: step.pattern });
            }}
            onBackHome={goHome}
          />
        )}
      </div>
    </div>
  );
}
