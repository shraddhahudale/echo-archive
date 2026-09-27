import type { PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { EYEBROW_PAD, STATUS_CLEARANCE } from "./Eyebrow";

export const STORY_SPRING = { type: "spring" as const, damping: 30, stiffness: 280 };
/** Mellow settle used by onboarding only (Wrapped keeps STORY_SPRING). */
export const ONBOARD_STORY_SPRING = {
  type: "spring" as const,
  damping: 34,
  stiffness: 150,
  mass: 1,
};
export const STORY_FLICK = 560;
/** Drag past this cancels tap (onboarding + Wrapped). */
export const STORY_DRAG_SLOP = 8;

/** Exact glass card chrome used by T2 Wrapped slides / active onboarding card. */
export const storyGlassClass =
  "w-full max-w-[320px] rounded-[24px] border border-white/20 bg-white/15 px-6 py-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-[12px]";

/** Onboarding neighbour peek: flat fill, no backdrop-blur (avoids edge stripe). */
export const storyGlassPeekClass =
  "w-full max-w-[320px] rounded-[24px] border border-white/20 bg-white/40 px-6 py-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.12)]";

/** Onboarding: shared card top + min-height so every slide's card sits on one line. */
export const ONBOARD_CARD_TOP = "58%";
export const ONBOARD_CARD_MIN_H = 280;

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
 * Story slide cell with neighbour peek.
 * - `center` (Wrapped): column centred vertically; visuals ride with the card
 * - `fixedCard` (Onboarding): glass only — orb / icons / Stone live outside the track
 */
export function StorySlide({
  width,
  trackX,
  cardIndex,
  settled,
  above,
  top,
  body,
  layout = "center",
}: {
  width: number;
  trackX: MotionValue<number>;
  cardIndex: number;
  settled: boolean;
  above?: ReactNode;
  top?: ReactNode;
  body: ReactNode;
  layout?: "center" | "fixedCard";
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
  // Onboarding: active card full + blur; neighbour peek flat 40% (no blur, no x-parallax)
  const activeGlassOpacity = useTransform(trackX, (value) => {
    const current = width > 0 ? -value / width : cardIndex;
    return Math.abs(current - cardIndex) < 0.5 ? 1 : 0;
  });
  const peekGlassOpacity = useTransform(trackX, (value) => {
    const current = width > 0 ? -value / width : cardIndex;
    const distance = Math.abs(current - cardIndex);
    // Flat bg-white/40 card; layer opacity 1 while peeking (never blur)
    if (distance < 0.5 || distance >= 1) return 0;
    return 1;
  });

  if (layout === "fixedCard") {
    return (
      <div className="relative h-full shrink-0 overflow-hidden" style={{ width }}>
        <motion.div
          className="absolute inset-x-6 z-[1] flex justify-center"
          style={{
            top: ONBOARD_CARD_TOP,
            opacity: peekGlassOpacity,
            pointerEvents: "none",
            willChange: "opacity",
          }}
          aria-hidden="true"
        >
          <div
            className={`${storyGlassPeekClass} flex flex-col justify-center overflow-hidden`}
            style={{ minHeight: ONBOARD_CARD_MIN_H }}
          />
        </motion.div>
        <motion.div
          className="absolute inset-x-6 z-[2] flex justify-center"
          style={{
            top: ONBOARD_CARD_TOP,
            opacity: activeGlassOpacity,
            pointerEvents: settled ? "auto" : "none",
            willChange: "opacity",
          }}
        >
          <div
            className={`${storyGlassClass} flex flex-col justify-center overflow-hidden`}
            style={{ minHeight: ONBOARD_CARD_MIN_H }}
          >
            {top}
            <div className={top ? "mt-5" : undefined}>{body}</div>
          </div>
        </motion.div>
      </div>
    );
  }

  const cardInner = (
    <>
      {top}
      <motion.div
        initial={false}
        animate={{ y: settled ? 0 : 12, opacity: settled ? 1 : 0 }}
        transition={{ duration: settled ? 0.28 : 0.14, ease: "easeOut" }}
        className={top ? "mt-5" : undefined}
      >
        {body}
      </motion.div>
    </>
  );

  return (
    <div className="relative flex h-full shrink-0 items-center justify-center px-6" style={{ width }}>
      <motion.div
        style={{ x: glassX, opacity: glassOpacity, willChange: "transform, opacity" }}
        className="flex w-full max-w-[320px] flex-col items-center"
      >
        {above}
        <div className={storyGlassClass}>{cardInner}</div>
      </motion.div>
    </div>
  );
}

/** Reduced-motion single card (no track peek). */
export function StorySlideStatic({
  above,
  top,
  body,
  layout = "center",
}: {
  above?: ReactNode;
  top?: ReactNode;
  body: ReactNode;
  layout?: "center" | "fixedCard";
}) {
  const cardInner = (
    <>
      {top}
      <div className={top ? "mt-5" : undefined}>{body}</div>
    </>
  );

  if (layout === "fixedCard") {
    return (
      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          className="absolute inset-x-6 flex flex-col items-center justify-center"
          style={{
            top: STATUS_CLEARANCE + EYEBROW_PAD + 8,
            bottom: "calc(42% + 20px)",
          }}
        >
          {above}
        </div>
        <div className="pointer-events-auto absolute inset-x-6 flex justify-center" style={{ top: ONBOARD_CARD_TOP }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className={`${storyGlassClass} flex flex-col justify-center overflow-hidden`}
            style={{ minHeight: ONBOARD_CARD_MIN_H }}
          >
            {cardInner}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="pointer-events-auto flex w-full max-w-[320px] flex-col items-center"
      >
        {above}
        <div className={storyGlassClass}>{cardInner}</div>
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

/** Onboarding dots: width + opacity ease over 400ms (settled index, not drag). */
export function StorySoftDots({ active, count }: { active: number; count: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-1.5"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => {
        const on = index === active;
        return (
          <span
            key={index}
            className="h-[5px] rounded-full bg-white transition-[width,opacity] duration-[400ms] ease-in-out"
            style={{ width: on ? 20 : 5, opacity: on ? 1 : 0.5 }}
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
  /** Settle spring; defaults to STORY_SPRING (Wrapped). */
  spring?: typeof STORY_SPRING & { mass?: number };
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
  spring = STORY_SPRING,
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
  const springRef = useRef(spring);
  springRef.current = spring;

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
      ...springRef.current,
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
      if (Math.hypot(dx, dy) < STORY_DRAG_SLOP) return;
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

    // Drag past slop cancels tap
    if (state.dragging || Math.hypot(dx, dy) >= STORY_DRAG_SLOP) {
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
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    tryGo(event.clientX - bounds.left > bounds.width / 2 ? 1 : -1, "tap");
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
