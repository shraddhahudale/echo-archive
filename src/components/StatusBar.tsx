import { BatteryFull, Signal, Wifi } from "lucide-react";

export function StatusBar() {
  return (
    <header className="flex h-[47px] shrink-0 items-center justify-between px-5 text-[var(--text-900)]">
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
