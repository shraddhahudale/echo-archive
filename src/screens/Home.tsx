import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, Mic, Moon, Music, Sun, type LucideIcon } from "lucide-react";
import { AlbumTile } from "../components/AlbumTile";
import { MiniPlayer } from "../components/MiniPlayer";
import { Orb } from "../components/Orb";
import { tabBarHeight } from "../components/TabBar";
import type { Entry } from "../data/types";
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
  const openSongDetails = useArchiveStore((state) => state.openSongDetails);
  const entries = useArchiveStore((state) => state.entries);
  const stoneConnected = useArchiveStore((state) => state.stoneConnected);
  const reduce = useReducedMotion();
  const fade = reduce ? 0.2 : 0.5;
  const sawDisconnected = useRef(!stoneConnected);
  const [dotPop, setDotPop] = useState(false);

  useEffect(() => {
    if (!stoneConnected || reduce || !sawDisconnected.current) return;
    setDotPop(true);
  }, [stoneConnected, reduce]);
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
          <Orb connected={stoneConnected} onClick={() => openSheet("choice")} />
        </div>
        <div className="mt-4 flex flex-col items-center">
          <motion.p
            initial={false}
            animate={{
              backgroundColor: stoneConnected ? "#d9eeb3" : "#F2F2F4",
              color: stoneConnected ? "#5e9a2c" : "#8E8E93",
              boxShadow: stoneConnected ? "inset 0 0 0 0px #D1D1D6" : "inset 0 0 0 1.5px #D1D1D6",
            }}
            transition={{ duration: fade, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-3.5 py-1.5 text-[12px] leading-4 font-medium"
          >
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{
                backgroundColor: stoneConnected ? "#5e9a2c" : "#AEAEB2",
                scale: dotPop ? [1, 1.4, 1] : 1,
              }}
              transition={{
                backgroundColor: { duration: fade, ease: "easeOut" },
                scale: dotPop ? { duration: 0.5, ease: "easeOut", times: [0, 0.4, 1] } : { duration: fade },
              }}
              onAnimationComplete={() => {
                if (dotPop) setDotPop(false);
              }}
              className="size-2 rounded-full"
            />
            {stoneConnected ? "Stone connected" : "Stone not connected"}
          </motion.p>
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

      <section className="mt-8" aria-labelledby="this-week">
        <h2 id="this-week" className="text-[15px] leading-5 font-normal text-[var(--text-400)]">
          This week
        </h2>
        {entries.filter((entry) => entry.week === user.week).length === 0 ? (
          <p className="mt-3 text-[13px] leading-5 text-[var(--text-400)]">
            Nothing saved this week yet. Tap the orb to start.
          </p>
        ) : (
          <DragRow className="pb-4">
            {entries
              .filter((entry) => entry.week === user.week)
              .map((entry) => (
                <li key={entry.id} className="shrink-0 snap-start">
                  <WeekCard entry={entry} />
                </li>
              ))}
          </DragRow>
        )}
      </section>
    </section>
    <div ref={playerRef} className="absolute inset-x-5 z-10" style={{ bottom: tabBarHeight + 8 }}>
      <MiniPlayer
        track={current}
        playing={playing}
        onTogglePlay={togglePlay}
        onSkip={skipTrack}
        onAdd={() => openSongDetails(current.id)}
      />
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

function formatToday(iso: string) {
  const date = new Date(iso);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  const time = `${hours}:${minutes} ${suffix}`;
  return date.toDateString() === new Date().toDateString() ? `Today, ${time}` : time;
}

function WeekCard({ entry }: { entry: Entry }) {
  return (
    <article className="flex w-[200px] items-center gap-3 rounded-[16px] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-card)]">
      <WeekMark entry={entry} />
      <div className="min-w-0">
        <p className="truncate text-[15px] leading-5 font-semibold text-[var(--text-900)]">{entry.title}</p>
        <p className="truncate text-[12px] leading-4 text-[var(--text-400)]">
          {entry.kind === "voice" && entry.number
            ? `#${String(entry.number).padStart(2, "0")} / W ${entry.week}`
            : formatToday(entry.createdAt)}
        </p>
      </div>
    </article>
  );
}

function SongWeekArt({ art }: { art: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className="size-11 shrink-0 rounded-[8px]"
        style={{ background: "linear-gradient(145deg, var(--pink-200), var(--pink-500))" }}
      />
    );
  }

  return <img src={art} alt="" className="size-11 shrink-0 rounded-[8px] object-cover" onError={() => setFailed(true)} />;
}

function WeekMark({ entry }: { entry: Entry }) {
  if (entry.kind === "song" && entry.art) {
    return <SongWeekArt art={entry.art} />;
  }
  if (entry.kind === "song") {
    return (
      <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[var(--pink-50)] text-[var(--pink-500)]">
        <Music size={20} strokeWidth={2} aria-hidden="true" />
      </span>
    );
  }
  if (entry.kind === "echo") {
    return (
      <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-[var(--amber-100)] text-[13px] font-semibold text-[var(--amber-500)]">
        {(entry.title[0] ?? "E").toUpperCase()}
        <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-[var(--amber-500)]" />
      </span>
    );
  }
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[var(--purple-100)] text-[var(--purple-500)]">
      <Mic size={20} strokeWidth={2} aria-hidden="true" />
    </span>
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
