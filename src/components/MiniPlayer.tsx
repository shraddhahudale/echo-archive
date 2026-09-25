import { Plus, SkipForward, Users } from "lucide-react";
import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import { accentForKind, contributorAvatarLabel, type NowPlayingItem } from "../data/playback";
import { tabBarHeight } from "./TabBar";

/** Outer height of the mini player card (art 44 + vertical padding). */
export const miniPlayerHeight = 60;

/** Space above the tab bar where the floating player sits. */
export const miniPlayerBottomGap = 8;

/** Scroll padding so the last row clears the mini player + tab bar. */
export const chromeBottomPad = miniPlayerHeight + tabBarHeight + 16;

type MiniPlayerProps = {
  item: NowPlayingItem;
  playing: boolean;
  progress: number;
  onTogglePlay: () => void;
  onSkip: () => void;
  onAdd?: () => void;
};

export function MiniPlayer({ item, playing, progress, onTogglePlay, onSkip, onAdd }: MiniPlayerProps) {
  const [failedId, setFailedId] = useState<string | null>(null);
  const artFailed = failedId === item.id;
  const accent = accentForKind(item.kind);
  const showAdd = item.kind === "song" && onAdd;

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--bg)] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 py-2 pr-4 pl-2">
        <Thumb item={item} artFailed={artFailed} onArtError={() => setFailedId(item.id)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] leading-5 font-semibold text-[var(--text-900)]">{item.title}</p>
          <p className="truncate text-[12px] leading-4 text-[var(--text-secondary)]">{item.subtitle}</p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-[18px] text-[var(--icon-control)]">
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
          {showAdd ? (
            <button
              type="button"
              aria-label="Add song"
              onClick={onAdd}
              className="-mx-[11px] grid h-11 w-11 cursor-pointer place-items-center border-0 bg-transparent p-0 text-inherit"
            >
              <Plus size={22} strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--line)]" aria-hidden="true">
        <div
          className="h-full origin-left transition-[width] duration-200 ease-linear"
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%`, background: accent }}
        />
      </div>
    </div>
  );
}

function Thumb({
  item,
  artFailed,
  onArtError,
}: {
  item: NowPlayingItem;
  artFailed: boolean;
  onArtError: () => void;
}) {
  const reduce = useReducedMotion();

  if (item.kind === "voice") {
    return (
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-[var(--purple-50)]">
        <span className="flex h-5 items-end gap-[2px]" aria-hidden="true">
          {[10, 16, 8, 14, 11].map((height, index) => (
            <span
              key={index}
              className={`w-[3px] rounded-full bg-[var(--purple-500)] ${!reduce && "echo-bar"}`}
              style={{ height, animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </span>
      </span>
    );
  }

  if (item.kind === "echo") {
    return (
      <span className="relative size-11 shrink-0">
        <span className="grid size-11 place-items-center overflow-hidden rounded-[8px] bg-[var(--amber-50)] text-[15px] font-semibold text-[var(--amber-600)]">
          {item.avatar ? (
            <img src={item.avatar} alt="" className="size-full object-cover" />
          ) : (
            contributorAvatarLabel(item.contributorName)
          )}
        </span>
        <span className="absolute -right-0.5 -bottom-0.5 grid size-3.5 place-items-center rounded-full bg-[var(--amber-500)] text-white">
          <Users size={8} strokeWidth={2.5} aria-hidden="true" />
        </span>
      </span>
    );
  }

  return (
    <span
      className="block size-11 shrink-0 overflow-hidden rounded-[8px] bg-cover bg-center"
      style={{
        backgroundImage: artFailed || !item.art ? item.gradient : undefined,
        backgroundColor: "var(--pink-50)",
      }}
    >
      {artFailed || !item.art ? null : (
        <img src={item.art} alt="" className="size-full object-cover" onError={onArtError} />
      )}
    </span>
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

/** Shared equaliser bars for row playing states. */
export function PlayingBars({
  color = "white",
  overlay = false,
  count = 4,
}: {
  color?: string;
  overlay?: boolean;
  count?: number;
}) {
  const reduce = useReducedMotion();
  const bars = (
    <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={`w-[3px] rounded-full ${reduce ? "" : "echo-bar"}`}
          style={{
            backgroundColor: color,
            height: reduce ? [8, 14, 10, 16][index % 4] : 14,
            animationDelay: `${index * 0.12}s`,
          }}
        />
      ))}
    </span>
  );
  if (!overlay) return bars;
  return <span className="absolute inset-0 grid place-items-center rounded-[10px] bg-black/35">{bars}</span>;
}
