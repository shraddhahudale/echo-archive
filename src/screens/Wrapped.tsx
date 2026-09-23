import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { X } from "lucide-react";
import { useArchiveStore, wrappedStats } from "../store/useArchiveStore";

const TOTAL = 6;
const SPRING = { type: "spring" as const, damping: 30, stiffness: 280 };
const FLICK_VELOCITY = 560;

type CardModel = {
  gradient: string;
  top: string;
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

  const rootRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [settledIndex, setSettledIndex] = useState(index);
  const trackX = useMotionValue(0);
  const progress = useTransform(trackX, (value) => (width > 0 ? -value / width : 0));
  const pointer = useRef<{
    id: number;
    startX: number;
    startY: number;
    origin: number;
    time: number;
    dragging: boolean;
  } | null>(null);
  const animating = useRef(false);
  const indexRef = useRef(index);
  indexRef.current = index;

  const cards: CardModel[] = useMemo(
    () => [
      {
        gradient: "linear-gradient(135deg, var(--wrap-anxious-from), var(--wrap-anxious-to))",
        top: "Through your second trimester",
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
        body: (
          <>
            <p className="font-serif text-[36px] leading-[42px] text-white italic">
              {stats.journeyFrom} → {stats.journeyTo}
            </p>
            <p className="mt-3 text-[16px] leading-5 text-white/90">the shift Echo noticed</p>
          </>
        ),
      },
    ],
    [stats],
  );

  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const measure = () => {
      const next = node.offsetWidth || 390;
      setWidth((prev) => {
        if (prev === 0) trackX.set(-indexRef.current * next);
        else if (prev !== next) trackX.set((-trackX.get() / prev) * next);
        return next;
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [trackX]);

  function settleTo(next: number) {
    if (reduce || width <= 0) {
      setWrappedIndex(next);
      setSettledIndex(next);
      return;
    }
    animating.current = true;
    setWrappedIndex(next);
    animate(trackX, -next * width, {
      ...SPRING,
      onComplete: () => {
        animating.current = false;
        setSettledIndex(next);
      },
    });
  }

  function go(delta: number) {
    const current = indexRef.current;
    const next = current + delta;
    if (next < 0) {
      settleTo(0);
      return;
    }
    if (next >= TOTAL) {
      closeWrapped();
      return;
    }
    settleTo(next);
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
        go(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function rubberband(value: number) {
    const min = -(TOTAL - 1) * width;
    const max = 0;
    if (value > max) return max + (value - max) * 0.32;
    if (value < min) return min + (value - min) * 0.32;
    return value;
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || width <= 0 || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: trackX.get(),
      time: performance.now(),
      dragging: false,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = pointer.current;
    if (!state || state.id !== event.pointerId || reduce || width <= 0) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.dragging) {
      if (Math.hypot(dx, dy) < 6) return;
      state.dragging = true;
    }
    trackX.set(rubberband(state.origin + dx));
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const state = pointer.current;
    if (!state || state.id !== event.pointerId) return;
    pointer.current = null;
    if (reduce || width <= 0) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    const dt = Math.max(performance.now() - state.time, 1);
    const vx = (dx / dt) * 1000;
    const current = indexRef.current;

    if (dy > 120 && Math.abs(dy) > Math.abs(dx)) {
      closeWrapped();
      return;
    }

    if (!state.dragging && Math.hypot(dx, dy) < 8) {
      const bounds = event.currentTarget.getBoundingClientRect();
      go(event.clientX - bounds.left > bounds.width / 2 ? 1 : -1);
      return;
    }

    let target = current;
    if (dx < -width * 0.25 || vx < -FLICK_VELOCITY) target = current + 1;
    else if (dx > width * 0.25 || vx > FLICK_VELOCITY) target = current - 1;

    if (target < 0) {
      settleTo(0);
      return;
    }
    if (target >= TOTAL) {
      closeWrapped();
      return;
    }
    settleTo(target);
  }

  function onPointerCancel() {
    const state = pointer.current;
    pointer.current = null;
    if (!state || reduce || width <= 0) return;
    settleTo(indexRef.current);
  }

  if (reduce) {
    const card = cards[index];
    return (
      <div
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-label="Echo T2 Insights"
        className="absolute inset-0 z-50 overflow-hidden touch-none select-none"
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          go(event.clientX - bounds.left > bounds.width / 2 ? 1 : -1);
        }}
      >
        <motion.div
          key={index}
          className="absolute inset-0"
          style={{ backgroundImage: card.gradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        />
        <TopScrim />
        <CloseButton onClose={closeWrapped} />
        <Eyebrow />
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-[320px] rounded-[24px] border border-white/20 bg-white/15 px-6 py-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-[12px]"
          >
            <p className="text-[15px] leading-5 text-white/90">{card.top}</p>
            <div className="mt-5">{card.body}</div>
          </motion.div>
        </div>
        <StaticDots active={index} />
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Echo T2 Insights"
      className="absolute inset-0 z-50 overflow-hidden touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {cards.map((card, cardIndex) => (
        <BackgroundLayer key={card.gradient} gradient={card.gradient} cardIndex={cardIndex} progress={progress} />
      ))}

      <TopScrim />
      <CloseButton onClose={closeWrapped} />
      <Eyebrow />

      <motion.div
        className="absolute inset-y-0 left-0 z-[2] flex"
        style={{ x: trackX, width: Math.max(width, 1) * TOTAL }}
      >
        {cards.map((card, cardIndex) => (
          <Slide
            key={card.top}
            card={card}
            cardIndex={cardIndex}
            width={width || 390}
            trackX={trackX}
            settled={settledIndex === cardIndex}
          />
        ))}
      </motion.div>

      <MotionDots progress={progress} />
    </div>
  );
}

function TopScrim() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[40%] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10)_0%,transparent_100%)]"
    />
  );
}

function Eyebrow() {
  return (
    <p className="pointer-events-none absolute inset-x-0 top-14 z-10 text-center text-[11px] leading-4 font-medium tracking-[0.04em] text-white/80">
      Echo T2 Insights
    </p>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close insights"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      className="absolute top-3 right-4 z-20 flex size-11 min-h-11 min-w-11 items-center justify-center border-0 bg-transparent p-0"
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-white/25 text-white">
        <X size={16} strokeWidth={2.25} />
      </span>
    </button>
  );
}

function BackgroundLayer({
  gradient,
  cardIndex,
  progress,
}: {
  gradient: string;
  cardIndex: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, (value) => Math.max(0, 1 - Math.abs(value - cardIndex)));
  return <motion.div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: gradient, opacity }} />;
}

function Slide({
  card,
  cardIndex,
  width,
  trackX,
  settled,
}: {
  card: CardModel;
  cardIndex: number;
  width: number;
  trackX: MotionValue<number>;
  settled: boolean;
}) {
  const glassX = useTransform(trackX, (value) => {
    const local = value + cardIndex * width;
    return local * -0.15;
  });
  const glassOpacity = useTransform(trackX, (value) => {
    const current = width > 0 ? -value / width : cardIndex;
    const distance = Math.min(1, Math.abs(current - cardIndex));
    return 1 - distance * 0.4;
  });

  return (
    <div className="relative flex h-full shrink-0 items-center justify-center px-6" style={{ width }}>
      <motion.div
        style={{ x: glassX, opacity: glassOpacity }}
        className="w-full max-w-[320px] rounded-[24px] border border-white/20 bg-white/15 px-6 py-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-[12px]"
      >
        <p className="text-[15px] leading-5 text-white/90">{card.top}</p>
        <motion.div
          initial={false}
          animate={{ y: settled ? 0 : 12, opacity: settled ? 1 : 0 }}
          transition={{ duration: settled ? 0.28 : 0.14, ease: "easeOut" }}
          className="mt-5"
        >
          {card.body}
        </motion.div>
      </motion.div>
    </div>
  );
}

function MotionDots({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-1.5" aria-hidden="true">
      {Array.from({ length: TOTAL }, (_, index) => (
        <MotionDot key={index} index={index} progress={progress} />
      ))}
    </div>
  );
}

function MotionDot({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const width = useTransform(progress, (value) => {
    const active = Math.max(0, 1 - Math.abs(value - index));
    return 5 + 15 * active;
  });
  const opacity = useTransform(progress, (value) => {
    const active = Math.max(0, 1 - Math.abs(value - index));
    return 0.5 + 0.5 * active;
  });
  return <motion.span className="h-[5px] rounded-full bg-white" style={{ width, opacity }} />;
}

function StaticDots({ active }: { active: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-1.5" aria-hidden="true">
      {Array.from({ length: TOTAL }, (_, index) => {
        const amount = Math.max(0, 1 - Math.abs(active - index));
        return (
          <span
            key={index}
            className="h-[5px] rounded-full bg-white"
            style={{ width: 5 + 15 * amount, opacity: 0.5 + 0.5 * amount }}
          />
        );
      })}
    </div>
  );
}
