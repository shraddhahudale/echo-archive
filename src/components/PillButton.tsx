import type { ReactNode } from "react";

const tones = {
  purple: "var(--purple-500)",
  pink: "var(--pink-500)",
  amber: "var(--amber-600)",
} as const;

type PillButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  tone?: keyof typeof tones;
  className?: string;
};

export function PillButton({ children, onClick, tone = "purple", className = "" }: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-full border border-[var(--line)] bg-white px-4 text-[13px] leading-4 font-medium ${className}`}
      style={{ color: tones[tone] }}
    >
      {children}
    </button>
  );
}
