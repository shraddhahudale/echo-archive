import type { ReactNode } from "react";

type DarkPillProps = {
  children: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
  className?: string;
};

/** Shared Breath action button — rounded rectangle, dark-mode surface. */
export function DarkPill({ children, onClick, className = "", ...rest }: DarkPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rest["aria-label"]}
      className={`h-11 w-[160px] rounded-[12px] border border-white/20 bg-white/[0.06] font-sans text-[13px] leading-4 font-medium text-white ${className}`}
    >
      {children}
    </button>
  );
}
