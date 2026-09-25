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
 * Light-variant orb for onboarding gradients: white rings, soft core,
 * white glow. Shares `layoutId="orb"` so size/position morph between screens.
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
  const glow = size * 1.75;

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
      {/* Soft white glow */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: glow,
          height: glow,
          marginLeft: -glow / 2,
          marginTop: -glow / 2,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 42%, transparent 70%)",
          filter: "blur(22px)",
        }}
        animate={reduce ? { opacity: 0.85 } : { opacity: [0.75, 1, 0.75], scale: [1, 1.04, 1] }}
        transition={reduce ? { duration: 0 } : { duration: 3, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Breathing wrapper */}
      <motion.span
        className="absolute inset-0"
        animate={reduce ? { scale: 1 } : { scale: [1, 1.04, 1] }}
        transition={reduce ? { duration: 0 } : { duration: 3, ease: "easeInOut", repeat: Infinity }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2 border-white/35"
          style={{ background: "rgba(255,255,255,0.12)" }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/55"
          style={{
            width: ringMid,
            height: ringMid,
            background: "rgba(255,255,255,0.22)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{
            width: core,
            height: core,
            background: "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #E9DDFF 100%)",
            boxShadow: "inset 0 4px 10px rgba(255,255,255,0.55), 0 4px 16px rgba(255,255,255,0.25)",
          }}
        />
      </motion.span>

      {hintRing && !reduce ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border border-white"
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity }}
        />
      ) : null}

      <AnimatePresence>
        {tapRipple > 0 ? (
          <motion.span
            key={tapRipple}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-white"
            initial={{ scale: 1, opacity: 0.7 }}
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
