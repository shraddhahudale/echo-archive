import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type OrbProps = {
  onClick?: () => void;
  connected?: boolean;
};

export function Orb({ onClick, connected = false }: OrbProps) {
  const reduce = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const [breathing, setBreathing] = useState(false);
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

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Tap to record a moment"
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
            breathing
              ? { opacity: [1, 0.7, 1] }
              : { opacity: connected ? 1 : 0.5 }
          }
          transition={
            breathing
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
    </button>
  );
}
