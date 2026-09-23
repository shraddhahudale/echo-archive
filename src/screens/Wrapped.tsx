import { useEffect, useMemo, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useArchiveStore, wrappedStats } from "../store/useArchiveStore";

const TOTAL = 6;

type CardModel = {
  gradient: string;
  top: string;
  footer: string;
  overlay?: boolean;
  body: ReactNode;
};

export function Wrapped() {
  const reduce = useReducedMotion();
  const index = useArchiveStore((state) => state.wrappedIndex);
  const setWrappedIndex = useArchiveStore((state) => state.setWrappedIndex);
  const closeWrapped = useArchiveStore((state) => state.closeWrapped);
  const songs = useArchiveStore((state) => state.songs);
  const contributors = useArchiveStore((state) => state.contributors);
  const stats = useMemo(() => wrappedStats(songs, contributors), [songs, contributors]);
  const startX = useRef<number | null>(null);
  const duration = reduce ? 0.15 : 0.35;

  const cards: CardModel[] = [
    {
      gradient: "linear-gradient(135deg, var(--wrap-anxious-from), var(--wrap-anxious-to))",
      top: "Through your second trimester",
      footer: "You're not alone in feeling this way",
      body: (
        <>
          <p className="font-serif text-[44px] leading-[48px] font-bold text-white italic">{stats.mood}</p>
          <p className="mt-3 text-[16px] leading-5 text-white/90">Mixed with happiness and excitement</p>
        </>
      ),
    },
    {
      gradient: "linear-gradient(135deg, var(--wrap-3am-from), var(--wrap-3am-to))",
      top: "In the quiet hours of night",
      footer: "T2 unfolds when the world sleeps",
      body: (
        <>
          <p className="font-serif text-[44px] leading-[48px] font-bold text-white italic">{stats.activeHour}</p>
          <p className="mt-3 text-[16px] leading-5 text-white/90">is your most active hour</p>
        </>
      ),
    },
    {
      gradient: "linear-gradient(135deg, var(--wrap-holocene-from), var(--wrap-holocene-to))",
      top: "When one song said it all",
      footer: "No voice note. Just this song capturing the moments it held",
      overlay: true,
      body: (
        <>
          <p className="font-serif text-[44px] leading-[48px] font-bold text-white italic">{stats.topSong.title}</p>
          {stats.topSong.art ? (
            <img
              src={stats.topSong.art}
              alt=""
              className="mx-auto mt-4 size-14 rounded-[10px] object-cover shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
            />
          ) : null}
          <p className="mt-3 text-[16px] leading-5 text-white/90 italic">{stats.topSong.artist}</p>
        </>
      ),
    },
    {
      gradient: "linear-gradient(135deg, var(--wrap-times-from), var(--wrap-times-to))",
      top: "You've turned to music",
      footer: "Every song held space for you",
      overlay: true,
      body: (
        <>
          <p className="font-serif text-[44px] leading-[48px] text-white">
            <span className="font-bold not-italic">{stats.songMoments}</span> <span className="italic">times</span>
          </p>
          <p className="mt-3 text-[16px] leading-5 text-white/90">seeking comfort and release</p>
        </>
      ),
    },
    {
      gradient: "linear-gradient(135deg, var(--wrap-echo-from), var(--wrap-echo-to))",
      top: "The voices around you",
      footer: `${stats.echoes.top.name} left the most: ${stats.echoes.top.count} voice notes`,
      overlay: true,
      body: (
        <>
          <p className="font-serif text-[44px] leading-[48px] text-white">
            <span className="font-bold not-italic">{stats.echoes.total}</span> <span className="italic">echoes</span>
          </p>
          <div className="mt-4 flex justify-center pl-2.5" aria-label="Contributors">
            {stats.echoes.people.map((person) => (
              <span
                key={person.id}
                title={person.name}
                className="-ml-2.5 flex size-9 items-center justify-center rounded-full border-2 border-white bg-[var(--amber-50)] text-[14px] font-semibold text-[var(--amber-600)]"
              >
                {person.name.trim().charAt(0).toUpperCase()}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[16px] leading-5 text-white/90">from four people who love you</p>
        </>
      ),
    },
    {
      gradient: "linear-gradient(135deg, var(--wrap-shift-from), var(--wrap-shift-to))",
      top: "Your emotional journey",
      footer: "Look how far you've come",
      body: (
        <>
          <p className="font-serif text-[36px] leading-[42px] text-white italic">
            {stats.journeyFrom} → {stats.journeyTo}
          </p>
          <p className="mt-3 text-[16px] leading-5 text-white/90">the shift Echo noticed</p>
        </>
      ),
    },
  ];

  function go(delta: number) {
    const next = index + delta;
    if (next < 0) return;
    if (next >= TOTAL) {
      closeWrapped();
      return;
    }
    setWrappedIndex(next);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeWrapped();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const next = index + 1;
        if (next >= TOTAL) closeWrapped();
        else setWrappedIndex(next);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (index > 0) setWrappedIndex(index - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, closeWrapped, setWrappedIndex]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    startX.current = event.clientX;
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (startX.current === null) return;
    const delta = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(delta) >= 40) {
      go(delta < 0 ? 1 : -1);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    go(event.clientX - bounds.left > bounds.width / 2 ? 1 : -1);
  }

  const card = cards[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Echo T2 Insights"
      className="absolute inset-0 z-50 overflow-hidden touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        startX.current = null;
      }}
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={`bg-${index}`}
          className="absolute inset-0"
          style={{ backgroundImage: card.gradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        />
      </AnimatePresence>
      {card.overlay ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[rgba(0,0,0,0.08)]" />
      ) : null}

      <button
        type="button"
        aria-label="Close insights"
        onClick={(event) => {
          event.stopPropagation();
          closeWrapped();
        }}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        className="absolute top-3 right-4 z-20 flex size-11 min-h-11 min-w-11 items-center justify-center border-0 bg-transparent p-0"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-white/25 text-white">
          <X size={16} strokeWidth={2.25} />
        </span>
      </button>

      <div className="pointer-events-none relative z-10 flex h-full flex-col px-6 pt-14 pb-8">
        <p className="text-center text-[11px] leading-4 font-medium tracking-[0.04em] text-white/80">
          Echo T2 Insights
        </p>

        <div className="flex flex-1 items-center justify-center">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
              transition={{ duration }}
              className="w-full max-w-[320px] rounded-[24px] border border-white/20 bg-white/15 px-6 py-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-[12px]"
            >
              <p className="text-[15px] leading-5 text-white/90">{card.top}</p>
              <div className="mt-5">{card.body}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mb-5 text-center text-[14px] leading-5 text-white/85">{card.footer}</p>

        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] leading-3 tracking-[0.08em] text-white/70 uppercase">
            {index + 1} OF {TOTAL} · TAP OR SWIPE
          </p>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: TOTAL }, (_, dot) => (
              <span
                key={dot}
                className={`h-[5px] rounded-full ${dot === index ? "w-5 bg-white" : "w-[5px] bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
