import { motion, useReducedMotion } from "framer-motion";

type OrbProps = {
  onClick?: () => void;
};

export function Orb({ onClick }: OrbProps) {
  const reduce = useReducedMotion();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Tap to record a moment"
      className="relative grid size-[148px] cursor-pointer place-items-center border-0 bg-transparent p-0"
    >
      <motion.span
        className="pointer-events-none absolute inset-0"
        animate={reduce ? { scale: 1 } : { scale: [1, 1.06, 1] }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 3, ease: "easeInOut", repeat: Infinity }
        }
      >
        <motion.span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-[260px] -ml-[130px] -mt-[130px] rounded-full"
          animate={reduce ? { opacity: 1 } : { opacity: [0.7, 1, 0.7] }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 3, ease: "easeInOut", repeat: Infinity }
          }
          style={{
            background:
              "radial-gradient(circle, rgba(178, 141, 236, 0.7) 0%, rgba(178, 141, 236, 0.22) 46%, transparent 72%)",
            filter: "blur(30px)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "rgba(178, 141, 236, 0.55)",
            border: "1.5px solid rgba(255, 255, 255, 0.7)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-[112px] -translate-x-1/2 -translate-y-1/2 rounded-full"
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
