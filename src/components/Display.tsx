import type { ElementType, ReactNode } from "react";

const sizes = {
  30: "text-[30px]",
  34: "text-[34px]",
  40: "text-[40px]",
  44: "text-[44px]",
  56: "text-[56px]",
} as const;

export type DisplaySize = keyof typeof sizes;

type DisplayProps = {
  children: ReactNode;
  size: DisplaySize;
  /** Dark screens (Breath, Wrapped) use light; Home / Archive / Timeline use dark. */
  tone?: "dark" | "light";
  /** 700 for names, page titles, Wrapped; 400 for Breath mode. */
  weight?: 400 | 700;
  as?: ElementType;
  className?: string;
};

/**
 * Display = serif italic, tracking -0.01em, line-height 1.1.
 * Bold (700) for names, page titles and Wrapped heroes; regular (400) in Breath mode.
 */
export function Display({
  children,
  size,
  tone = "dark",
  weight = 700,
  as: Tag = "p",
  className = "",
}: DisplayProps) {
  const color = tone === "light" ? "text-white" : "text-[var(--text-900)]";
  const weightClass = weight === 400 ? "font-normal" : "font-bold";
  return (
    <Tag
      className={`font-[family-name:var(--font-serif)] ${sizes[size]} leading-[1.1] ${weightClass} italic ${color} ${className}`}
      style={{ letterSpacing: "-0.01em" }}
    >
      {children}
    </Tag>
  );
}
