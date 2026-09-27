type StatusBarProps = {
  /** Kept for call-site compatibility; content is empty (safe-area spacer only). */
  tone?: "dark" | "light";
};

/** Empty top safe-area spacer (47px). No time / signal / wifi / battery. */
export function StatusBar(_props: StatusBarProps = {}) {
  return <header className="relative z-30 h-[47px] shrink-0" aria-hidden="true" />;
}
