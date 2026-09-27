import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type OnboardingOrbProps = {
  size: number;
  onClick?: () => void;
  ariaLabel?: string;
  /** Brief soft pulse when the user taps the wrong place on Meet the orb. */
  lookAtMe?: number;
  /** Expanding ring that fades every 1.6s (Meet the orb hint). */
  hintRing?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Soft light-variant orb for onboarding.
 * Stays fixed in place — no layoutId, no x-transform; only breathing + tap pulse.
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
    setNudge(1.04);
    const id = window.setTimeout(() => setNudge(1), 280);
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
    window.setTimeout(() => setSqueezed(false), 180);
    window.setTimeout(onClick, 280);
  }

  const inner = (
    <span
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
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

      {/* Breathing + tap pulse — scale only, transform-origin centre */}
      <motion.span
        className="absolute inset-0 origin-center"
        initial={false}
        animate={
          reduce
            ? { scale: 1 }
            : squeezed
              ? { scale: 0.96 }
              : nudge !== 1
                ? { scale: nudge }
                : { scale: [1, 1.025, 1] }
        }
        transition={
          reduce
            ? { duration: 0 }
            : squeezed || nudge !== 1
              ? { duration: 0.2, ease: "easeOut" }
              : { duration: 4, ease: "easeInOut", repeat: Infinity }
        }
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
            animate={{ scale: 1.45, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        ) : null}
      </AnimatePresence>
    </span>
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
