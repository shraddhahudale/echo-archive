import type { PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

export const STORY_SPRING = { type: "spring" as const, damping: 30, stiffness: 280 };
export const STORY_FLICK = 560;

/** Exact glass card chrome used by T2 Wrapped slides. */
export const storyGlassClass =
  "w-full max-w-[320px] rounded-[24px] border border-white/20 bg-white/15 px-6 py-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-[12px]";

export function StoryTopScrim() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[40%] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10)_0%,transparent_100%)]"
    />
  );
}

export function StoryBackgroundLayer({
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

/**
 * Wrapped slide cell: full-height column, centred glass with neighbour peek.
 * Optional `above` sits in the same peeking column (orb / stone / previews).
 * `top` mirrors Wrapped's card lead line; `body` fades in when settled.
 */
export function StorySlide({
  width,
  trackX,
  cardIndex,
  settled,
  above,
  top,
  body,
}: {
  width: number;
  trackX: MotionValue<number>;
  cardIndex: number;
  settled: boolean;
  above?: ReactNode;
  top?: ReactNode;
  body: ReactNode;
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
        className="flex w-full max-w-[320px] flex-col items-center"
      >
        {above}
        <div className={storyGlassClass}>
          {top}
          <motion.div
            initial={false}
            animate={{ y: settled ? 0 : 12, opacity: settled ? 1 : 0 }}
            transition={{ duration: settled ? 0.28 : 0.14, ease: "easeOut" }}
            className={top ? "mt-5" : undefined}
          >
            {body}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/** Reduced-motion single card (no track peek). */
export function StorySlideStatic({
  above,
  top,
  body,
}: {
  above?: ReactNode;
  top?: ReactNode;
  body: ReactNode;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="pointer-events-auto flex w-full max-w-[320px] flex-col items-center"
      >
        {above}
        <div className={storyGlassClass}>
          {top}
          <div className={top ? "mt-5" : undefined}>{body}</div>
        </div>
      </motion.div>
    </div>
  );
}

export function StoryMotionDots({
  progress,
  count,
}: {
  progress: MotionValue<number>;
  count: number;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-1.5"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <StoryMotionDot key={index} index={index} progress={progress} />
      ))}
    </div>
  );
}

function StoryMotionDot({ index, progress }: { index: number; progress: MotionValue<number> }) {
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

export function StoryStaticDots({ active, count }: { active: number; count: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-1.5"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => {
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

type PagerOptions = {
  count: number;
  index: number;
  setIndex: (next: number) => void;
  /** Called when the user tries to go past the last slide (Wrapped closes). */
  onPastEnd?: () => void;
  /** Vertical drag dismiss (Wrapped). */
  onSwipeDown?: () => void;
  /** Return false to block a navigation attempt (e.g. O6 forward). */
  canGo?: (from: number, to: number, via: "tap" | "swipe" | "key") => boolean;
  /** Optional: tap on right half while blocked (e.g. O2 look-at-me). */
  onBlockedForwardTap?: (from: number) => void;
  enabled?: boolean;
};

export function useStoryPager({
  count,
  index,
  setIndex,
  onPastEnd,
  onSwipeDown,
  canGo,
  onBlockedForwardTap,
  enabled = true,
}: PagerOptions) {
  const reduce = useReducedMotion();
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
    if (next < 0 || next >= count) return;
    if (reduce || width <= 0) {
      setIndex(next);
      setSettledIndex(next);
      trackX.set(-next * Math.max(width, 1));
      return;
    }
    animating.current = true;
    setIndex(next);
    animate(trackX, -next * width, {
      ...STORY_SPRING,
      onComplete: () => {
        animating.current = false;
        setSettledIndex(next);
      },
    });
  }

  function tryGo(delta: number, via: "tap" | "swipe" | "key") {
    if (!enabled) return;
    const current = indexRef.current;
    const next = current + delta;
    if (next < 0) {
      settleTo(0);
      return;
    }
    if (next >= count) {
      onPastEnd?.();
      return;
    }
    if (canGo && !canGo(current, next, via)) {
      if (delta > 0 && via === "tap") onBlockedForwardTap?.(current);
      else settleTo(current);
      return;
    }
    settleTo(next);
  }

  function rubberband(value: number) {
    const min = -(count - 1) * width;
    const max = 0;
    if (value > max) return max + (value - max) * 0.32;
    if (value < min) return min + (value - min) * 0.32;
    return value;
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!enabled || reduce || width <= 0 || event.button !== 0) return;
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
    if (!state || state.id !== event.pointerId || !enabled || reduce || width <= 0) return;
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
    if (!enabled || reduce || width <= 0) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    const dt = Math.max(performance.now() - state.time, 1);
    const vx = (dx / dt) * 1000;
    const current = indexRef.current;

    if (dy > 120 && Math.abs(dy) > Math.abs(dx)) {
      onSwipeDown?.();
      if (onSwipeDown) return;
    }

    if (!state.dragging && Math.hypot(dx, dy) < 8) {
      const bounds = event.currentTarget.getBoundingClientRect();
      tryGo(event.clientX - bounds.left > bounds.width / 2 ? 1 : -1, "tap");
      return;
    }

    let target = current;
    if (dx < -width * 0.25 || vx < -STORY_FLICK) target = current + 1;
    else if (dx > width * 0.25 || vx > STORY_FLICK) target = current - 1;

    if (target === current) {
      settleTo(current);
      return;
    }
    if (target < 0) {
      settleTo(0);
      return;
    }
    if (target >= count) {
      onPastEnd?.();
      settleTo(current);
      return;
    }
    if (canGo && !canGo(current, target, "swipe")) {
      settleTo(current);
      return;
    }
    settleTo(target);
  }

  function onPointerCancel() {
    const state = pointer.current;
    pointer.current = null;
    if (!state || !enabled || reduce || width <= 0) return;
    settleTo(indexRef.current);
  }

  return {
    rootRef: rootRef as RefObject<HTMLDivElement>,
    width,
    trackX,
    progress,
    settledIndex,
    setSettledIndex,
    settleTo,
    tryGo,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    reduce,
  };
}
