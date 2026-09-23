import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Heart, Moon, Sun, type LucideIcon } from "lucide-react";
import { AlbumTile } from "../components/AlbumTile";
import { MiniPlayer } from "../components/MiniPlayer";
import { Orb } from "../components/Orb";
import { tabBarHeight } from "../components/TabBar";
import { useShallow } from "zustand/react/shallow";
import { selectCurrentTrack, selectRecentlyPlayed, trimesterName, useArchiveStore } from "../store/useArchiveStore";

const feelings: { label: string; icon: LucideIcon; color: string; iconColor: string }[] = [
  { label: "Calm nights", icon: Moon, color: "#C9B8FF", iconColor: "#9B7BF0" },
  { label: "Tender", icon: Heart, color: "#F7A8D0", iconColor: "#E86FAE" },
  { label: "Bright days", icon: Sun, color: "#FFD39A", iconColor: "#E89A5C" },
];

export function Home() {
  const user = useArchiveStore((state) => state.user);
  const current = useArchiveStore(selectCurrentTrack);
  const recentlyPlayed = useArchiveStore(useShallow(selectRecentlyPlayed));
  const playing = useArchiveStore((state) => state.playing);
  const togglePlay = useArchiveStore((state) => state.togglePlay);
  const skipTrack = useArchiveStore((state) => state.skipTrack);
  const selectTrack = useArchiveStore((state) => state.selectTrack);
  const openSheet = useArchiveStore((state) => state.openSheet);
  const playerRef = useRef<HTMLDivElement>(null);
  const [playerHeight, setPlayerHeight] = useState(0);

  useLayoutEffect(() => {
    const node = playerRef.current;
    if (!node) return;
    const update = () => setPlayerHeight(node.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-full">
    <section
      aria-label="Home"
      className="scroll-row h-full overflow-x-hidden overflow-y-auto px-5 pt-2"
      style={{ paddingBottom: playerHeight + tabBarHeight + 16 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] leading-5 font-normal text-[var(--text-400)]">Good evening,</p>
          <h1 className="mt-2 text-[34px] leading-10 font-bold text-[var(--text-900)]">{user.name}</h1>
        </div>
        <Avatar />
      </div>
      <p className="mt-2 text-[16px] leading-[22px] font-medium text-[var(--text-400)]">
        Week {user.week} · {trimesterName(user.trimester)} Trimester
      </p>

      <article className="mt-6 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--bg)] px-5 pt-6 pb-5 text-center shadow-[var(--shadow-card)]">
        <h2 className="text-[15px] leading-5 font-semibold text-[var(--text-900)]">
          How are you feeling today ?
        </h2>
        <div className="mt-4 flex justify-center">
          <Orb onClick={() => openSheet("choice")} />
        </div>
        <div className="mt-4 flex flex-col items-center">
          <p className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--green-100)] px-3.5 py-1.5 text-[12px] leading-4 font-medium text-[var(--green-600)]">
            <span className="size-2 rounded-full bg-[var(--green-600)]" aria-hidden="true" />
            Stone connected
          </p>
          <button
            type="button"
            onClick={() => openSheet("choice")}
            className="mt-3 border-0 bg-transparent p-0 text-[13px] leading-5 font-normal text-[#A1A5B0]"
          >
            Tap to record a moment
          </button>
        </div>
      </article>

      <section className="mt-8" aria-labelledby="browse-feeling">
        <h2 id="browse-feeling" className="text-[15px] leading-5 font-normal text-[var(--text-400)]">
          Browse by feeling
        </h2>
        <DragRow>
          {feelings.map((feeling) => (
            <li key={feeling.label} className="shrink-0 snap-start">
              <FeelingTile {...feeling} />
            </li>
          ))}
        </DragRow>
      </section>

      <section className="mt-8" aria-labelledby="recently-played">
        <h2 id="recently-played" className="text-[15px] leading-5 font-normal text-[var(--text-400)]">
          Recently played
        </h2>
        <DragRow className="pb-4">
          {recentlyPlayed.map((track) => (
            <li key={track.id} className="shrink-0 snap-start">
              <AlbumTile
                title={track.title}
                artist={track.artist}
                art={track.art}
                gradient={track.gradient}
                bordered={track.bordered}
                onSelect={() => selectTrack(track.id)}
              />
            </li>
          ))}
        </DragRow>
      </section>
    </section>
    <div ref={playerRef} className="absolute inset-x-5 z-10" style={{ bottom: tabBarHeight + 8 }}>
      <MiniPlayer track={current} playing={playing} onTogglePlay={togglePlay} onSkip={skipTrack} />
    </div>
    </div>
  );
}

function DragRow({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const drag = useRef({
    pointerId: -1,
    startX: 0,
    startScroll: 0,
    moved: false,
    suppressClick: false,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onWheel(event: WheelEvent) {
      if (!event.shiftKey || !el) return;
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      el.scrollLeft += delta;
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(event: ReactPointerEvent<HTMLUListElement>) {
    if (event.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    drag.current.pointerId = event.pointerId;
    drag.current.startX = event.clientX;
    drag.current.startScroll = el.scrollLeft;
    drag.current.moved = false;
    el.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLUListElement>) {
    const el = ref.current;
    if (!el || drag.current.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.current.startX;
    if (Math.abs(dx) > 5) drag.current.moved = true;
    if (drag.current.moved) el.scrollLeft = drag.current.startScroll - dx;
  }

  function onPointerUp(event: ReactPointerEvent<HTMLUListElement>) {
    const el = ref.current;
    if (!el || drag.current.pointerId !== event.pointerId) return;
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    drag.current.pointerId = -1;
    if (!drag.current.moved) return;
    drag.current.suppressClick = true;
    const item = el.querySelector<HTMLElement>(":scope > li");
    if (item) {
      const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 12;
      const stride = item.getBoundingClientRect().width + gap;
      const index = Math.round(el.scrollLeft / stride);
      const max = el.scrollWidth - el.clientWidth;
      const left = Math.min(Math.max(0, index * stride), max);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
    }
    window.setTimeout(() => {
      drag.current.suppressClick = false;
    }, 80);
  }

  function onClickCapture(event: ReactMouseEvent<HTMLUListElement>) {
    if (!drag.current.suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.suppressClick = false;
    drag.current.moved = false;
  }

  return (
    <ul
      ref={ref}
      className={`scroll-row -mx-5 mt-3 flex cursor-grab snap-x snap-mandatory scroll-pl-5 gap-3 overflow-x-auto px-5 select-none active:cursor-grabbing [&_button]:cursor-grab ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
      onDragStart={(event) => event.preventDefault()}
    >
      {children}
    </ul>
  );
}

function Avatar() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="size-16 shrink-0 rounded-full"
        style={{ background: "linear-gradient(135deg, var(--purple-100), var(--purple-300))" }}
        role="img"
        aria-label="Sarah"
      />
    );
  }

  return (
    <img
      src="/img/sarah.png"
      alt="Sarah"
      className="size-16 shrink-0 rounded-full object-cover object-top"
      onError={() => setFailed(true)}
    />
  );
}

function FeelingTile({
  label,
  icon: Icon,
  color,
  iconColor,
}: {
  label: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
}) {
  return (
    <div
      className="relative size-[120px] rounded-[20px]"
      style={{
        background: `linear-gradient(135deg, #FFFFFF 0%, ${color} 75%)`,
        border: "1px solid rgba(255, 255, 255, 0.6)",
      }}
    >
      <Icon
        className="absolute top-[14px] left-[14px]"
        size={32}
        strokeWidth={1.75}
        color={iconColor}
        aria-hidden="true"
      />
      <span className="absolute bottom-3 left-[14px] text-[15px] leading-5 font-semibold text-[var(--text-900)]">
        {label}
      </span>
    </div>
  );
}
