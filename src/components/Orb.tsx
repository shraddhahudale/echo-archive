import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type OrbProps = {
  onClick?: () => void;
  connected?: boolean;
  /** First-arrival guide from onboarding: brighter halo, ripple, tooltip. */
  guide?: boolean;
};

export function Orb({ onClick, connected = false, guide = false }: OrbProps) {
  const reduce = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const mountedConnected = useRef(connected);
  const fade = reduce ? 0.2 : 0.5;

  useEffect(() => {
    if (!connected || reduce) {
      setBreathing(false);
      return;
    }
    const wait = mountedConnected.current ? 0 : 500;
    const id = window.setTimeout(() => setBreathing(true), wait);
    return () => window.clearTimeout(id);
  }, [connected, reduce]);

  useEffect(() => {
    if (!guide) {
      setShowTip(false);
      return;
    }
    const id = window.setTimeout(() => setShowTip(true), reduce ? 0 : 600);
    return () => window.clearTimeout(id);
  }, [guide, reduce]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Tap to record a moment"
      aria-describedby={guide && showTip ? "orb-guide-tip" : undefined}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="relative grid size-[148px] cursor-pointer place-items-center border-0 bg-transparent p-0"
      style={
        reduce
          ? undefined
          : {
              transform: pressed ? "scale(0.96)" : undefined,
              transition: "transform 100ms ease-out",
            }
      }
    >
      <AnimatePresence>
        {guide && showTip ? (
          <motion.span
            id="orb-guide-tip"
            role="tooltip"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: reduce ? 0.15 : 0.25 }}
            className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-10 w-max max-w-[220px] -translate-x-1/2 rounded-[12px] bg-white px-3 py-2 text-[13px] leading-4 font-medium text-[var(--text-900)] shadow-[0_8px_24px_rgba(143,89,226,0.16)]"
          >
            Tap the orb to keep your first moment
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 -mt-px -translate-x-1/2 border-6 border-transparent border-t-white"
              style={{ borderWidth: 6 }}
            />
          </motion.span>
        ) : null}
      </AnimatePresence>

      <motion.span
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={breathing ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={
          breathing
            ? { duration: 3, ease: "easeInOut", repeat: Infinity }
            : { duration: 0 }
        }
      >
        <motion.span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-[260px] -ml-[130px] -mt-[130px] rounded-full"
          initial={false}
          animate={
            guide && !reduce
              ? { opacity: [0.7, 1, 0.7], scale: [1, 1.15, 1] }
              : guide && reduce
                ? { opacity: 0.95, scale: 1 }
                : breathing
                  ? { opacity: [1, 0.7, 1] }
                  : { opacity: connected ? 1 : 0.5 }
          }
          transition={
            guide && !reduce
              ? { duration: 2.4, ease: "easeInOut", repeat: Infinity }
              : breathing
                ? { duration: 3, ease: "easeInOut", repeat: Infinity }
                : { duration: fade, ease: "easeOut" }
          }
          style={{
            background:
              "radial-gradient(circle, rgba(178, 141, 236, 0.7) 0%, rgba(178, 141, 236, 0.22) 46%, transparent 72%)",
            filter: "blur(30px)",
          }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          initial={false}
          animate={{ filter: connected ? "saturate(1)" : "saturate(0.7)" }}
          transition={{ duration: fade, ease: "easeOut" }}
          style={{
            background: "rgba(178, 141, 236, 0.55)",
            border: "1.5px solid rgba(255, 255, 255, 0.7)",
          }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-[112px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          initial={false}
          animate={{ filter: connected ? "saturate(1)" : "saturate(0.7)" }}
          transition={{ duration: fade, ease: "easeOut" }}
          style={{
            background: "rgba(178, 141, 236, 0.75)",
            border: "1.5px solid rgba(255, 255, 255, 0.7)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-[76px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, #9E6BEA 0%, #8F59E2 100%)",
            boxShadow:
              "inset 0 6px 14px rgba(255, 255, 255, 0.35), inset 0 -8px 16px rgba(143, 89, 226, 0.45)",
          }}
        />
      </motion.span>

      {guide && !reduce ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 size-[148px] -ml-[74px] -mt-[74px] rounded-full"
          style={{ border: "1.5px solid var(--purple-300)" }}
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity }}
        />
      ) : null}
    </button>
  );
}
