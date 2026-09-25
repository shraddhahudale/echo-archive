import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const ORB_SPRING = { type: "spring" as const, damping: 26, stiffness: 220 };

type OnboardingOrbProps = {
  size: number;
  onClick?: () => void;
  ariaLabel?: string;
  /** Brief 1 → 1.06 → 1 nudge when the user taps the wrong place on O2. */
  lookAtMe?: number;
  /** Expanding ring that fades every 1.6s (O2 hint). */
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
  const glow = size * 1.3;

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
      transition={reduce ? { duration: 0.15 } : ORB_SPRING}
    >
      {/* Soft close halo — 40% opacity, blur 24px, ≤1.3× orb */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: glow,
          height: glow,
          marginLeft: -glow / 2,
          marginTop: -glow / 2,
          background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 48%, transparent 72%)",
          filter: "blur(24px)",
        }}
      />

      {/* Breathing wrapper — subtle 1 → 1.03 */}
      <motion.span
        className="absolute inset-0"
        animate={reduce ? { scale: 1 } : { scale: [1, 1.03, 1] }}
        transition={reduce ? { duration: 0 } : { duration: 3, ease: "easeInOut", repeat: Infinity }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(255,255,255,0.22)",
            border: "1.5px solid rgba(255,255,255,0.55)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: ringMid,
            height: ringMid,
            background: "rgba(255,255,255,0.38)",
            border: "1.5px solid rgba(255,255,255,0.55)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: core,
            height: core,
            background: "radial-gradient(circle at 40% 35%, #F3EDFF 0%, #D6C6FF 100%)",
            border: "1.5px solid rgba(255,255,255,0.55)",
          }}
        />
      </motion.span>

      {hintRing && !reduce ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border border-white/50"
          initial={{ scale: 1, opacity: 0.45 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity }}
        />
      ) : null}

      <AnimatePresence>
        {tapRipple > 0 ? (
          <motion.span
            key={tapRipple}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/60"
            initial={{ scale: 1, opacity: 0.6 }}
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
