import { Plus, SkipForward } from "lucide-react";
import { useState } from "react";

export type Track = {
  id: string;
  title: string;
  artist: string;
  art?: string;
  gradient: string;
};

type MiniPlayerProps = {
  track: Track;
  playing: boolean;
  onTogglePlay: () => void;
  onSkip: () => void;
  onAdd: () => void;
};

export function MiniPlayer({ track, playing, onTogglePlay, onSkip, onAdd }: MiniPlayerProps) {
  const [failedId, setFailedId] = useState<string | null>(null);
  const artFailed = failedId === track.id;

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--bg)] py-2 pr-4 pl-2 shadow-[var(--shadow-card)]">
      <span
        className="block size-11 shrink-0 overflow-hidden rounded-[8px] bg-cover bg-center"
        style={{
          backgroundImage: artFailed || !track.art ? track.gradient : undefined,
          backgroundColor: "var(--pink-50)",
        }}
      >
        {artFailed || !track.art ? null : (
          <img
            src={track.art}
            alt=""
            className="size-full object-cover"
            onError={() => setFailedId(track.id)}
          />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] leading-5 font-semibold text-[var(--text-900)]">{track.title}</p>
        <p className="truncate text-[12px] leading-4 text-[var(--text-400)]">{track.artist}</p>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-[18px] text-[#3F3A4A]">
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={onTogglePlay}
          className="-mx-[11px] grid h-11 w-11 cursor-pointer place-items-center border-0 bg-transparent p-0 text-inherit"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          aria-label="Skip"
          onClick={onSkip}
          className="-mx-[11px] grid h-11 w-11 cursor-pointer place-items-center border-0 bg-transparent p-0 text-inherit"
        >
          <SkipForward size={22} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Add song"
          onClick={onAdd}
          className="-mx-[11px] grid h-11 w-11 cursor-pointer place-items-center border-0 bg-transparent p-0 text-inherit"
        >
          <Plus size={22} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <rect x="5" y="3" width="4" height="16" rx="1" fill="currentColor" />
      <rect x="13" y="3" width="4" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M7 4.2v13.6l11.2-6.8L7 4.2Z" fill="currentColor" />
    </svg>
  );
}
