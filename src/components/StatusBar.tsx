import { BatteryFull, Signal, Wifi } from "lucide-react";

type StatusBarProps = {
  /** `dark` = black icons (light screens). `light` = white icons (dark screens). */
  tone?: "dark" | "light";
};

export function StatusBar({ tone = "dark" }: StatusBarProps) {
  const color = tone === "light" ? "#FFFFFF" : "var(--text-900)";

  return (
    <header
      className="relative z-30 flex h-[47px] shrink-0 items-center justify-between px-5"
      style={{ color }}
    >
      <time className="text-[15px] leading-5 font-semibold" dateTime="09:41">
        9:41
      </time>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <Signal size={16} strokeWidth={2.25} />
        <Wifi size={16} strokeWidth={2.25} />
        <BatteryFull size={20} strokeWidth={2.25} />
      </div>
    </header>
  );
}
