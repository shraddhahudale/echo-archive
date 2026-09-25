import type { ReactNode } from "react";

/** Status bar height — Breath and Wrapped clear this before the eyebrow. */
export const STATUS_CLEARANCE = 47;

/** Space under the status bar before the eyebrow baseline (matches Breath `pt-2`). */
export const EYEBROW_PAD = 8;

type EyebrowProps = {
  children: ReactNode;
  /** Breath uses soft (50%); Wrapped uses strong (70%) on lighter gradients. */
  tone?: "soft" | "strong";
  /**
   * Absolute under the status bar at the same y as Breath.
   * Breath keeps the eyebrow in flow after `pt-[47px]` + `pt-2` instead.
   */
  absolute?: boolean;
  className?: string;
};

const typeClass =
  "text-center font-sans text-[10px] leading-3 font-medium tracking-[0.2em] uppercase";

/**
 * Shared screen eyebrow (Breath relief mode + T2 Wrapped).
 * Inter 10 / 500 / 0.2em tracking / uppercase / centred.
 */
export function Eyebrow({ children, tone = "soft", absolute = false, className = "" }: EyebrowProps) {
  const color = tone === "strong" ? "text-white/70" : "text-white/50";
  if (absolute) {
    return (
      <p
        className={`pointer-events-none absolute inset-x-0 z-10 ${typeClass} ${color} ${className}`}
        style={{ top: STATUS_CLEARANCE + EYEBROW_PAD }}
      >
        {children}
      </p>
    );
  }
  return <p className={`${typeClass} ${color} ${className}`}>{children}</p>;
}
