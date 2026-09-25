import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Check, Hand, Loader2, Mic, Music, Users } from "lucide-react";
import { Display } from "../components/Display";
import { Eyebrow } from "../components/Eyebrow";
import { OnboardingOrb } from "../components/OnboardingOrb";
import { PillButton } from "../components/PillButton";

export type OnboardingResult = { stoneConnected: boolean };
type StonePhase = "idle" | "connecting" | "connected";
const SLIDE_COUNT = 6; // O1–O6 (dots); splash is separate
const SPRING = { type: "spring" as const, damping: 30, stiffness: 280 };
const FLICK_VELOCITY = 560;
const SPLASH_MS = 2400;
const O2_FALLBACK_MS = 4000;

const GRADIENTS = [
  "linear-gradient(135deg, #B79BFA, #6D2BDB)", // O1
  "linear-gradient(135deg, #A385F7, #5A1FC4)", // O2
  "linear-gradient(135deg, #E7A6D6, #8B2BCB)", // O3
  "linear-gradient(135deg, #9FB8F7, #6D2BDB)", // O4
  "linear-gradient(135deg, #F6C99A, #C0508F)", // O5
  "linear-gradient(135deg, #5B4A8C, #241B3D)", // O6
] as const;

const SPLASH_GRADIENT = "linear-gradient(135deg, #3B2470, #1E1238)";

const ORB_SIZES = [180, 220, 140, 110, 80, 0] as const; // O1–O6; O6 fades out

const O4_CHIPS = ["calm", "hopeful", "anxious", "connected", "tearful", "don't know why"] as const;

const O3_ACTIONS = [
  {
    id: "voice",
    Icon: Mic,
    color: "var(--purple-500)",
    label: "Voice note",
    line: "Say it out loud. Your voice, today.",
    angle: -140,
  },
  {
    id: "song",
    Icon: Music,
    color: "var(--pink-500)",
    label: "Song",
    line: "The song holding you this week.",
    angle: -40,
  },
  {
    id: "echo",
    Icon: Users,
    color: "var(--amber-500)",
    label: "Echo",
    line: "Voices from the people who love you.",
    angle: 90,
  },
] as const;

type OnboardingProps = {
  onComplete: (result: OnboardingResult) => void;
};

export function Onboarding({ onComplete }: OnboardingProps) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"splash" | "slides">("splash");
  const [index, setIndex] = useState(0);
  const [settledIndex, setSettledIndex] = useState(0);
  const [splashReady, setSplashReady] = useState(false);
  const [lookAtMe, setLookAtMe] = useState(0);
  const [showO2Next, setShowO2Next] = useState(false);
  const [o3Highlight, setO3Highlight] = useState<string | null>(null);
  const [o4Feeling, setO4Feeling] = useState<string | null>(null);
  const [stonePhase, setStonePhase] = useState<StonePhase>("idle");
  const [exiting, setExiting] = useState(false);
  const finishing = useRef(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
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
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  function finish(result: OnboardingResult) {
    if (finishing.current) return;
    finishing.current = true;
    setExiting(true);
    onComplete(result);
  }

  function startConnect() {
    if (stonePhase !== "idle" || finishing.current) return;
    setStonePhase("connecting");
    const connectMs = reduce ? 150 : 2000;
    const holdMs = reduce ? 150 : 1000;
    window.setTimeout(() => {
      setStonePhase("connected");
      window.setTimeout(() => finish({ stoneConnected: true }), holdMs);
    }, connectMs);
  }

  function enterSlides() {
    if (phaseRef.current !== "splash") return;
    setPhase("slides");
    setIndex(0);
    setSettledIndex(0);
    if (width > 0) trackX.set(0);
  }

  // Splash: name delay + auto-advance
  useEffect(() => {
    if (phase !== "splash") return;
    const nameId = window.setTimeout(() => setSplashReady(true), reduce ? 0 : 400);
    const advanceId = window.setTimeout(enterSlides, reduce ? 150 : SPLASH_MS);
    return () => {
      window.clearTimeout(nameId);
      window.clearTimeout(advanceId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduce]);

  // O2 fallback "Next" after 4s
  useEffect(() => {
    if (phase !== "slides" || index !== 1) {
      setShowO2Next(false);
      return;
    }
    setShowO2Next(false);
    const id = window.setTimeout(() => setShowO2Next(true), O2_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [phase, index]);

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
    if (next < 0 || next >= SLIDE_COUNT) return;
    if (reduce || width <= 0) {
      setIndex(next);
      setSettledIndex(next);
      trackX.set(-next * Math.max(width, 1));
      return;
    }
    animating.current = true;
    setIndex(next);
    animate(trackX, -next * width, {
      ...SPRING,
      onComplete: () => {
        animating.current = false;
        setSettledIndex(next);
      },
    });
  }

  function go(delta: number) {
    if (phaseRef.current !== "slides") return;
    const current = indexRef.current;

    // O6: half-taps don't navigate; swipe back handled separately
    if (current === 5 && delta > 0) return;

    // O2: right-half tap doesn't advance — nudge the orb instead
    if (current === 1 && delta > 0) {
      setLookAtMe((n) => n + 1);
      return;
    }

    const next = current + delta;
    if (next < 0) {
      settleTo(0);
      return;
    }
    if (next >= SLIDE_COUNT) return;
    settleTo(next);
  }

  function goNextFromO2() {
    settleTo(2);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (phaseRef.current === "splash") {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          enterSlides();
        }
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (indexRef.current === 1) goNextFromO2();
        else go(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, reduce]);

  function rubberband(value: number) {
    const min = -(SLIDE_COUNT - 1) * width;
    const max = 0;
    if (value > max) return max + (value - max) * 0.32;
    if (value < min) return min + (value - min) * 0.32;
    return value;
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (phase !== "slides" || reduce || width <= 0 || event.button !== 0) return;
    if (indexRef.current === 5 && stonePhase !== "idle") return;
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
    if (phase !== "slides" || reduce || width <= 0) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    const dt = Math.max(performance.now() - state.time, 1);
    const vx = (dx / dt) * 1000;
    const current = indexRef.current;

    if (!state.dragging && Math.hypot(dx, dy) < 8) {
      // O6: taps on halves don't navigate
      if (current === 5) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const rightHalf = event.clientX - bounds.left > bounds.width / 2;
      if (current === 1 && rightHalf) {
        setLookAtMe((n) => n + 1);
        return;
      }
      if (current === 1 && !rightHalf) {
        go(-1);
        return;
      }
      go(rightHalf ? 1 : -1);
      return;
    }

    let target = current;
    if (dx < -width * 0.25 || vx < -FLICK_VELOCITY) target = current + 1;
    else if (dx > width * 0.25 || vx > FLICK_VELOCITY) target = current - 1;

    // O2: swipe left (forward) still works
    if (target === current) {
      settleTo(current);
      return;
    }
    if (target < 0) {
      settleTo(0);
      return;
    }
    if (target >= SLIDE_COUNT) {
      settleTo(current);
      return;
    }
    // O6 forward blocked
    if (current === 5 && target > current) {
      settleTo(5);
      return;
    }
    settleTo(target);
  }

  function onPointerCancel() {
    const state = pointer.current;
    pointer.current = null;
    if (!state || reduce || width <= 0 || phase !== "slides") return;
    settleTo(indexRef.current);
  }

  const orbSize = phase === "splash" ? 96 : ORB_SIZES[index];
  const showOrb = phase === "splash" || (phase === "slides" && index < 5);
  const titleLive =
    phase === "splash"
      ? "Echo Archive"
      : [
          "Hi, Sarah",
          "It breathes with you",
          "Keep a moment",
          "How are you feeling?",
          "Look back, week by week",
          "Meet your Companion Stone",
        ][index];

  return (
    <motion.div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Echo Archive"
      className="absolute inset-0 z-50 overflow-hidden touch-none select-none"
      initial={false}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: reduce ? 0.15 : 0.4, ease: "easeOut" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClick={
        phase === "splash"
          ? (event) => {
              event.preventDefault();
              enterSlides();
            }
          : undefined
      }
    >
      {/* Gradient layers */}
      <AnimatePresence>
        {phase === "splash" ? (
          <motion.div
            key="splash-bg"
            aria-hidden="true"
            className="absolute inset-0"
            style={{ backgroundImage: SPLASH_GRADIENT }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.4 }}
          />
        ) : null}
      </AnimatePresence>

      {phase === "slides"
        ? GRADIENTS.map((gradient, i) => (
            <BackgroundLayer key={gradient} gradient={gradient} cardIndex={i} progress={progress} />
          ))
        : null}

      <TopScrim />

      <div className="sr-only" aria-live="polite">
        {titleLive}
      </div>

      {/* Skip — O1 to O5 */}
      {phase === "slides" && index < 5 ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            settleTo(5);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          className="absolute top-3 right-4 z-20 min-h-11 min-w-11 border-0 bg-transparent px-2 text-[13px] text-white/80"
        >
          Skip
        </button>
      ) : null}

      {/* Shared orb (upper half) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] flex h-[52%] items-center justify-center">
        <div className="pointer-events-auto relative flex items-center justify-center">
          <AnimatePresence>
            {showOrb && orbSize > 0 ? (
              <motion.div
                key="shared-orb"
                initial={phase === "splash" && !reduce ? { opacity: 0 } : false}
                animate={{ opacity: index === 5 ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.15 : 0.35 }}
              >
                <OnboardingOrb
                  size={orbSize}
                  lookAtMe={lookAtMe}
                  hintRing={phase === "slides" && index === 1}
                  onClick={phase === "slides" && index === 1 ? goNextFromO2 : undefined}
                  ariaLabel="Tap the orb to continue"
                />
                {/* O2 tap hint */}
                {phase === "slides" && index === 1 ? (
                  <div className="pointer-events-none absolute top-full left-1/2 mt-3 flex -translate-x-1/2 flex-col items-center gap-1">
                    <span className="flex items-center gap-1.5 text-[13px] text-white">
                      <Hand size={14} strokeWidth={2} aria-hidden="true" />
                      Tap the orb
                    </span>
                    {showO2Next ? (
                      <button
                        type="button"
                        className="pointer-events-auto min-h-11 border-0 bg-transparent px-3 text-[13px] text-white/80 underline underline-offset-2"
                        onClick={(event) => {
                          event.stopPropagation();
                          goNextFromO2();
                        }}
                        onPointerDown={(event) => event.stopPropagation()}
                        onPointerUp={(event) => event.stopPropagation()}
                      >
                        Next
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {/* O3 fan-out icons around orb */}
                {phase === "slides" && index === 2 ? (
                  <O3Fan
                    settled={settledIndex === 2}
                    reduce={!!reduce}
                    highlight={o3Highlight}
                    onHighlight={setO3Highlight}
                  />
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* O6 Companion Stone */}
          {phase === "slides" && index === 5 ? (
            <CompanionStone phase={stonePhase} reduce={!!reduce} />
          ) : null}
        </div>
      </div>

      {/* Splash copy */}
      {phase === "splash" ? (
        <div className="pointer-events-none absolute inset-x-0 top-[52%] z-10 flex flex-col items-center px-6 text-center">
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: splashReady || reduce ? 1 : 0, y: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.4 }}
          >
            <Display size={40} tone="light">
              Echo Archive
            </Display>
            <p className="mt-3 text-[14px] leading-5 tracking-[0.02em] text-white/70">
              a sound diary for pregnancy
            </p>
          </motion.div>
        </div>
      ) : null}

      {/* Sliding glass cards O1–O6 */}
      {phase === "slides" ? (
        reduce ? (
          <ReducedSlide
            index={index}
            o3Highlight={o3Highlight}
            o4Feeling={o4Feeling}
            onFeeling={(label) => {
              setO4Feeling(label);
              setLookAtMe((n) => n + 1);
            }}
            stonePhase={stonePhase}
            onLater={() => finish({ stoneConnected: false })}
            onConnect={startConnect}
          />
        ) : (
          <motion.div
            className="absolute inset-y-0 left-0 z-[2] flex"
            style={{ x: trackX, width: Math.max(width, 1) * SLIDE_COUNT }}
          >
            {Array.from({ length: SLIDE_COUNT }, (_, i) => (
              <Slide
                key={i}
                slideIndex={i}
                width={width || 390}
                trackX={trackX}
                settled={settledIndex === i}
                o3Highlight={o3Highlight}
                o4Feeling={o4Feeling}
                onFeeling={(label) => {
                  setO4Feeling(label);
                  setLookAtMe((n) => n + 1);
                }}
                stonePhase={stonePhase}
                onLater={() => finish({ stoneConnected: false })}
                onConnect={startConnect}
              />
            ))}
          </motion.div>
        )
      ) : null}

      {phase === "slides" ? (
        reduce ? <StaticDots active={index} /> : <MotionDots progress={progress} />
      ) : null}
    </motion.div>
  );
}

function CompanionStone({ phase, reduce }: { phase: StonePhase; reduce: boolean }) {
  const fast = phase === "connecting";
  const glowDuration = reduce ? 0 : fast ? 0.55 : 2.8;

  return (
    <motion.div
      className="relative grid place-items-center"
      initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduce ? 0.15 : 0.4 }}
      aria-hidden={phase === "idle"}
    >
      <motion.span
        className="absolute top-1/2 left-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(143,89,226,0.5) 0%, rgba(143,89,226,0.15) 45%, transparent 72%)",
          filter: "blur(16px)",
        }}
        animate={
          reduce
            ? { opacity: fast ? 1 : 0.75, scale: 1 }
            : {
                opacity: fast ? [0.55, 1, 0.55] : [0.55, 0.9, 0.55],
                scale: fast ? [1, 1.12, 1] : [1, 1.06, 1],
              }
        }
        transition={
          reduce
            ? { duration: 0.15 }
            : { duration: glowDuration, ease: "easeInOut", repeat: Infinity }
        }
      />
      <span
        className="relative block size-[120px] rounded-[48%_52%_45%_55%/55%_45%_55%_45%]"
        style={{
          background: "linear-gradient(160deg, #EDE7F6 0%, #CFC4E6 100%)",
          boxShadow:
            "inset 0 4px 12px rgba(255,255,255,0.55), inset 0 -6px 14px rgba(90,60,140,0.22), 0 8px 24px rgba(36,27,61,0.25)",
        }}
      >
        <AnimatePresence>
          {phase === "connected" ? (
            <motion.span
              key="check"
              className="absolute inset-0 grid place-items-center"
              initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduce ? 0.15 : 0.28, ease: "easeOut" }}
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-[var(--ok-green)] text-white shadow-[0_4px_12px_rgba(48,164,108,0.45)]">
                <Check size={22} strokeWidth={2.75} aria-hidden="true" />
              </span>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
      {phase === "connected" ? <span className="sr-only">Companion Stone connected</span> : null}
    </motion.div>
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

function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`w-full max-w-[320px] rounded-[24px] border border-white/20 bg-white/15 p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-[12px] ${className}`}
    >
      {children}
    </div>
  );
}

function StaggerText({
  settled,
  eyebrow,
  title,
  body,
  children,
}: {
  settled: boolean;
  eyebrow: string;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const item = (delay: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1 }, transition: { duration: 0.15 } }
      : {
          initial: { opacity: 0, y: 8 },
          animate: settled ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
          transition: { duration: 0.28, ease: "easeOut" as const, delay: settled ? delay : 0 },
        };

  return (
    <>
      <motion.div {...item(0)}>
        <Eyebrow tone="strong">{eyebrow}</Eyebrow>
      </motion.div>
      <motion.div {...item(0.06)} className="mt-3">
        <Display size={30} tone="light">
          {title}
        </Display>
      </motion.div>
      {body ? (
        <motion.p
          {...item(0.12)}
          className="mx-auto mt-3 max-w-[280px] text-[15px] leading-5 text-white/85"
        >
          {body}
        </motion.p>
      ) : null}
      {children ? (
        <motion.div {...item(0.18)} className="mt-4">
          {children}
        </motion.div>
      ) : null}
    </>
  );
}

type SlideContentProps = {
  slideIndex: number;
  settled: boolean;
  o3Highlight: string | null;
  o4Feeling: string | null;
  onFeeling: (label: string) => void;
  stonePhase: StonePhase;
  onLater: () => void;
  onConnect: () => void;
};

function SlideBody({
  slideIndex,
  settled,
  o3Highlight,
  o4Feeling,
  onFeeling,
  stonePhase,
  onLater,
  onConnect,
}: SlideContentProps) {
  switch (slideIndex) {
    case 0:
      return (
        <StaggerText
          settled={settled}
          eyebrow="WELCOME"
          title="Hi, Sarah"
          body="A sound diary for the weeks in between. The songs, voices and feelings that carry you to meeting your baby."
        />
      );
    case 1:
      return (
        <StaggerText
          settled={settled}
          eyebrow="THIS IS YOUR ORB"
          title="It breathes with you"
          body="Whenever something feels worth keeping, a song, a thought, a voice, just tap the orb."
        />
      );
    case 2:
      return (
        <StaggerText settled={settled} eyebrow="TAP THE ORB TO…" title="Keep a moment">
          <ul className="space-y-3 text-left">
            {O3_ACTIONS.map((action) => (
              <li key={action.id} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white ${
                    o3Highlight === action.id ? "ring-2 ring-white/80" : ""
                  }`}
                  style={{ background: action.color }}
                  aria-hidden="true"
                >
                  <action.Icon size={14} className="text-white" strokeWidth={2.25} />
                </span>
                <span>
                  <span className="block text-[14px] font-semibold text-white">{action.label}</span>
                  <span className="block text-[13px] leading-4 text-white/80">{action.line}</span>
                </span>
              </li>
            ))}
          </ul>
        </StaggerText>
      );
    case 3:
      return (
        <StaggerText
          settled={settled}
          eyebrow="EVERY MOMENT HAS A FEELING"
          title="How are you feeling?"
          body="Add a feeling when you save something. Over the weeks, Echo gently notices the patterns."
        >
          <div className="flex flex-wrap justify-center gap-2">
            {O4_CHIPS.map((label) => {
              const selected = o4Feeling === label;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={selected}
                  onClick={(event) => {
                    event.stopPropagation();
                    onFeeling(label);
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  onPointerUp={(event) => event.stopPropagation()}
                  className="min-h-11 rounded-full border border-white/30 px-3.5 py-1.5 text-[12px] leading-4"
                  style={
                    selected
                      ? { background: "#FFFFFF", color: "var(--purple-500)", borderColor: "#FFFFFF" }
                      : { background: "rgba(255,255,255,0.18)", color: "#FFFFFF" }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </StaggerText>
      );
    case 4:
      return (
        <StaggerText settled={settled} eyebrow="IT ALL ADDS UP" title="Look back, week by week">
          <O5Previews settled={settled} />
        </StaggerText>
      );
    case 5:
    default:
      return (
        <StaggerText
          settled={settled}
          eyebrow="ONE LAST THING"
          title="Meet your Companion Stone"
          body={
            stonePhase === "connected"
              ? undefined
              : "Hold it when you want to breathe or record. It glows along with your orb."
          }
        >
          <div
            className="flex flex-col items-center gap-3"
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            {stonePhase === "connected" ? (
              <p className="text-[15px] leading-5 font-medium text-white" aria-live="polite">
                Connected. You're all set.
              </p>
            ) : (
              <>
                <PillButton
                  className="inline-flex w-full items-center justify-center gap-2"
                  onClick={stonePhase === "idle" ? onConnect : undefined}
                >
                  {stonePhase === "connecting" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      Connecting…
                    </>
                  ) : (
                    "Connect"
                  )}
                </PillButton>
                {stonePhase === "idle" ? (
                  <button
                    type="button"
                    className="min-h-11 border-0 bg-transparent px-3 text-[13px] text-white/80 underline underline-offset-2"
                    onClick={onLater}
                  >
                    I'll do this later
                  </button>
                ) : null}
              </>
            )}
          </div>
        </StaggerText>
      );
  }
}

function Slide({
  slideIndex,
  width,
  trackX,
  settled,
  o3Highlight,
  o4Feeling,
  onFeeling,
  stonePhase,
  onLater,
  onConnect,
}: SlideContentProps & { width: number; trackX: MotionValue<number> }) {
  const glassX = useTransform(trackX, (value) => {
    const local = value + slideIndex * width;
    return local * -0.15;
  });
  const glassOpacity = useTransform(trackX, (value) => {
    const current = width > 0 ? -value / width : slideIndex;
    const distance = Math.min(1, Math.abs(current - slideIndex));
    return 1 - distance * 0.4;
  });

  return (
    <div className="relative flex h-full shrink-0 items-end justify-center px-6 pb-24" style={{ width }}>
      <motion.div style={{ x: glassX, opacity: glassOpacity }} className="w-full max-w-[320px]">
        <GlassCard>
          <SlideBody
            slideIndex={slideIndex}
            settled={settled}
            o3Highlight={o3Highlight}
            o4Feeling={o4Feeling}
            onFeeling={onFeeling}
            stonePhase={stonePhase}
            onLater={onLater}
            onConnect={onConnect}
          />
        </GlassCard>
      </motion.div>
    </div>
  );
}

function ReducedSlide({
  index,
  o3Highlight,
  o4Feeling,
  onFeeling,
  stonePhase,
  onLater,
  onConnect,
}: {
  index: number;
  o3Highlight: string | null;
  o4Feeling: string | null;
  onFeeling: (label: string) => void;
  stonePhase: StonePhase;
  onLater: () => void;
  onConnect: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center px-6 pb-24">
      <motion.div
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="pointer-events-auto w-full max-w-[320px]"
      >
        <GlassCard>
          <SlideBody
            slideIndex={index}
            settled
            o3Highlight={o3Highlight}
            o4Feeling={o4Feeling}
            onFeeling={onFeeling}
            stonePhase={stonePhase}
            onLater={onLater}
            onConnect={onConnect}
          />
        </GlassCard>
      </motion.div>
    </div>
  );
}

function O3Fan({
  settled,
  reduce,
  highlight,
  onHighlight,
}: {
  settled: boolean;
  reduce: boolean;
  highlight: string | null;
  onHighlight: (id: string) => void;
}) {
  const radius = 96;
  return (
    <div className="pointer-events-none absolute inset-0">
      {O3_ACTIONS.map((action, i) => {
        const rad = (action.angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const selected = highlight === action.id;
        return (
          <motion.button
            key={action.id}
            type="button"
            aria-label={action.label}
            aria-pressed={selected}
            className="pointer-events-auto absolute top-1/2 left-1/2 flex size-12 -ml-6 -mt-6 items-center justify-center rounded-full border-2 border-white"
            style={{ background: action.color }}
            initial={reduce ? false : { x: 0, y: 0, opacity: 0, scale: 0.6 }}
            animate={
              settled
                ? {
                    x,
                    y,
                    opacity: 1,
                    scale: selected ? 1.08 : 1,
                    boxShadow: selected ? "0 0 0 4px rgba(255,255,255,0.55)" : "0 0 0 0 rgba(255,255,255,0)",
                  }
                : { x: 0, y: 0, opacity: 0, scale: 0.6 }
            }
            transition={
              reduce
                ? { duration: 0.15 }
                : { type: "spring", damping: 18, stiffness: 220, delay: settled ? i * 0.12 : 0 }
            }
            onClick={(event) => {
              event.stopPropagation();
              onHighlight(action.id);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
          >
            <action.Icon size={20} className="text-white" strokeWidth={2.25} />
          </motion.button>
        );
      })}
    </div>
  );
}

function O5Previews({ settled }: { settled: boolean }) {
  const reduce = useReducedMotion();
  const rows = [
    {
      key: "weeks",
      content: (
        <>
          <span className="flex gap-1" aria-hidden="true">
            {["#F472B6", "#8F59E2", "#F2A541", "#F472B6", "#8F59E2", "#F2A541", "#8F59E2"].map((c, i) => (
              <span key={i} className="size-1.5 rounded-full" style={{ background: c }} />
            ))}
          </span>
          <span className="text-[13px] leading-4 text-white/90">See your weeks fill up with moments.</span>
        </>
      ),
    },
    {
      key: "wrapped",
      content: (
        <>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium italic text-white"
            style={{ background: "linear-gradient(135deg, #A385F7, #6D2BDB)" }}
          >
            Anxious → Hopeful
          </span>
          <span className="text-[13px] leading-4 text-white/90">Get your trimester, wrapped.</span>
        </>
      ),
    },
    {
      key: "breathe",
      content: (
        <>
          <span className="relative flex size-6 items-center justify-center rounded-full bg-[#1A1A1A]">
            <span
              className="size-3 rounded-full"
              style={{
                background: "radial-gradient(circle, #B28DEC 0%, #7B579D 100%)",
                boxShadow: "0 0 8px rgba(178,141,236,0.8)",
              }}
            />
          </span>
          <span className="text-[13px] leading-4 text-white/90">Need a moment? Breathe along with the glow.</span>
        </>
      ),
    },
  ];

  return (
    <ul className="space-y-2.5 text-left">
      {rows.map((row, i) => (
        <motion.li
          key={row.key}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={settled ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={
            reduce
              ? { duration: 0.15 }
              : { duration: 0.3, ease: "easeOut", delay: settled ? 0.12 + i * 0.12 : 0 }
          }
          className="flex items-center gap-3 rounded-[14px] border border-white/20 bg-white/15 px-3 py-2.5 backdrop-blur-[8px]"
        >
          {row.content}
        </motion.li>
      ))}
    </ul>
  );
}

function MotionDots({ progress }: { progress: MotionValue<number> }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-10 flex items-center justify-center gap-1.5"
      style={{ bottom: 32 }}
      aria-hidden="true"
    >
      {Array.from({ length: SLIDE_COUNT }, (_, i) => (
        <MotionDot key={i} index={i} progress={progress} />
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
    <div
      className="pointer-events-none absolute inset-x-0 z-10 flex items-center justify-center gap-1.5"
      style={{ bottom: 32 }}
      aria-hidden="true"
    >
      {Array.from({ length: SLIDE_COUNT }, (_, i) => {
        const amount = Math.max(0, 1 - Math.abs(active - i));
        return (
          <span
            key={i}
            className="h-[5px] rounded-full bg-white"
            style={{ width: 5 + 15 * amount, opacity: 0.5 + 0.5 * amount }}
          />
        );
      })}
    </div>
  );
}
