import type { ReactNode } from "react";

type DarkPillProps = {
  children: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
  className?: string;
};

export function DarkPill({ children, onClick, className = "", ...rest }: DarkPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rest["aria-label"]}
      className={`h-10 min-w-[160px] rounded-full border border-white/20 bg-white/[0.06] px-6 text-[13px] leading-4 font-medium text-white ${className}`}
    >
      {children}
    </button>
  );
}
