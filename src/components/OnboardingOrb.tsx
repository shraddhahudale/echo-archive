import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ONBOARD_STORY_SPRING } from "./StoryShell";

type OnboardingOrbProps = {
  size: number;
  onClick?: () => void;
  ariaLabel?: string;
  /** Brief 1 → 1.06 → 1 nudge when the user taps the wrong place on Meet the orb. */
  lookAtMe?: number;
  /** Expanding ring that fades every 1.6s (Meet the orb hint). */
  hintRing?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Soft light-variant orb for onboarding gradients.
 * Shares `layoutId="orb"` so size/position morph between screens.
 */
export function OnboardingOrb({
  size,
  onClick,
  ariaLabel = "Orb",
  lookAtMe = 0,
  hintRing = false,
  className = "",
  style,
}: OnboardingOrbProps) {
  const reduce = useReducedMotion();
  const [nudge, setNudge] = useState(1);
  const [squeezed, setSqueezed] = useState(false);
  const [tapRipple, setTapRipple] = useState(0);

  useEffect(() => {
    if (!lookAtMe || reduce) return;
    setNudge(1.06);
    const id = window.setTimeout(() => setNudge(1), 220);
    return () => window.clearTimeout(id);
  }, [lookAtMe, reduce]);

  const ringMid = size * 0.75;
  const core = size * 0.5;
  const glow = size * 1.25;

  function handleClick() {
    if (!onClick) return;
    if (reduce) {
      onClick();
      return;
    }
    setSqueezed(true);
    setTapRipple((n) => n + 1);
    window.setTimeout(() => setSqueezed(false), 160);
    window.setTimeout(onClick, 280);
  }

  const inner = (
    <motion.span
      layoutId="orb"
      className="relative grid place-items-center"
      initial={false}
      animate={{
        width: size,
        height: size,
        scale: reduce ? 1 : squeezed ? 0.94 : nudge,
      }}
      transition={reduce ? { duration: 0.15 } : ONBOARD_STORY_SPRING}
      style={{ willChange: "transform" }}
    >
      {/* Soft halo — 30% opacity, blur 30px, ≤1.25× orb */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: glow,
          height: glow,
          marginLeft: -glow / 2,
          marginTop: -glow / 2,
          background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 45%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Breathing — 1 → 1.025 over 4s */}
      <motion.span
        className="absolute inset-0"
        animate={reduce ? { scale: 1 } : { scale: [1, 1.025, 1] }}
        transition={reduce ? { duration: 0 } : { duration: 4, ease: "easeInOut", repeat: Infinity }}
        style={{ willChange: "transform" }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: ringMid,
            height: ringMid,
            background: "rgba(255,255,255,0.26)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: core,
            height: core,
            background: "radial-gradient(circle at 50% 45%, #F6F0FF 0%, #DCCDFF 55%, transparent 100%)",
            filter: "blur(1px)",
          }}
        />
      </motion.span>

      {hintRing && !reduce ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border border-white/25"
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity }}
        />
      ) : null}

      <AnimatePresence>
        {tapRipple > 0 ? (
          <motion.span
            key={tapRipple}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border border-white/40"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.55, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        ) : null}
      </AnimatePresence>
    </motion.span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={(event) => {
          event.stopPropagation();
          handleClick();
        }}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        className={`relative grid place-items-center border-0 bg-transparent p-0 ${className}`}
        style={{ width: Math.max(size, 44), height: Math.max(size, 44), ...style }}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    >
      {inner}
    </div>
  );
}
