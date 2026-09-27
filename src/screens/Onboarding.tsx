import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Hand, Loader2, Mic, Music, Users } from "lucide-react";
import { Display } from "../components/Display";
import { Eyebrow } from "../components/Eyebrow";
import { OnboardingOrb } from "../components/OnboardingOrb";
import { PillButton } from "../components/PillButton";
import {
  StoryBackgroundLayer,
  StoryMotionDots,
  StorySlide,
  StorySlideStatic,
  StoryStaticDots,
  StoryTopScrim,
  useStoryPager,
} from "../components/StoryShell";

export type OnboardingResult = { stoneConnected: boolean };
type StonePhase = "idle" | "connecting" | "connected";

/** Story slides only (splash is separate). Meet the orb → … → Stone. */
const SLIDE_COUNT = 4;
const O2_FALLBACK_MS = 4000;
const SPLASH_LIFT_MS = 1200;
const SPLASH_CTA_AFTER_NOTE_MS = 1000;
const SPLASH_GRADIENT = "linear-gradient(135deg, #A385F7, #6D2BDB)";

const CONCEPT_NOTE =
  "Pregnancy is a time in between. Echo Archive is a sound diary for those weeks: the songs you play, the thoughts you say out loud, and the voices of the people who love you. Kept week by week, so you can listen back to how you became a mother.";

/** Meet the orb → Keep a moment → Look back → Stone. */
const ORB_SIZES = [148, 112, 110, 0] as const;

const GRADIENTS = [
  "linear-gradient(135deg, #A385F7, #5A1FC4)", // Meet the orb
  "linear-gradient(135deg, #E7A6D6, #8B2BCB)", // Keep a moment
  "linear-gradient(135deg, #F6C99A, #C0508F)", // Look back
  "linear-gradient(135deg, #5B4A8C, #241B3D)", // Stone
] as const;

const EYEBROWS = ["THIS IS YOUR ORB", "TAP THE ORB TO…", "IT ALL ADDS UP", "ONE LAST THING"] as const;

const TITLES = [
  "It breathes with you",
  "Keep a moment",
  "Look back, week by week",
  "Your Companion Stone",
] as const;

const O3_ACTIONS = [
  {
    id: "voice",
    Icon: Mic,
    color: "var(--purple-500)",
    label: "Voice note",
    line: "Say it out loud. Your voice, today.",
  },
  {
    id: "song",
    Icon: Music,
    color: "var(--pink-500)",
    label: "Song",
    line: "The song holding you this week.",
  },
  {
    id: "echo",
    Icon: Users,
    color: "var(--amber-500)",
    label: "Echo",
    line: "Voices from the people who love you.",
  },
] as const;

type OnboardingProps = {
  onComplete: (result: OnboardingResult) => void;
};

function FitTitle({ children }: { children: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState(26);
  const [allowWrap, setAllowWrap] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      const parent = el.parentElement;
      if (!parent) return;
      const maxWidth = parent.clientWidth;
      if (maxWidth <= 0) return;

      setAllowWrap(false);
      let size = 26;
      el.style.whiteSpace = "nowrap";
      el.style.fontSize = `${size}px`;

      while (size > 22 && el.scrollWidth > maxWidth) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }

      if (el.scrollWidth > maxWidth) {
        setAllowWrap(true);
        el.style.whiteSpace = "normal";
      }
      setFontSize(size);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement ?? el);
    return () => ro.disconnect();
  }, [children]);

  return (
    <p
      ref={ref}
      className={`w-full max-w-full text-center font-[family-name:var(--font-serif)] leading-[1.1] font-bold italic text-white ${
        allowWrap ? "" : "whitespace-nowrap"
      }`}
      style={{ fontSize, letterSpacing: "-0.01em" }}
    >
      {children}
    </p>
  );
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"splash" | "slides">("splash");
  const [index, setIndex] = useState(0);
  const [taglineReady, setTaglineReady] = useState(false);
  const [splashLifted, setSplashLifted] = useState(false);
  const [showConceptNote, setShowConceptNote] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const [lookAtMe, setLookAtMe] = useState(0);
  const [orbUnlocked, setOrbUnlocked] = useState(false);
  const [o3Highlight, setO3Highlight] = useState<string | null>(null);
  const [stonePhase, setStonePhase] = useState<StonePhase>("idle");
  const [exiting, setExiting] = useState(false);
  const finishing = useRef(false);
  const orbUnlockedRef = useRef(false);
  orbUnlockedRef.current = orbUnlocked;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const splashPointer = useRef<{ x: number; y: number } | null>(null);

  const pager = useStoryPager({
    count: SLIDE_COUNT,
    index,
    setIndex,
    enabled: phase === "slides" && stonePhase === "idle",
    canGo: (from, to) => {
      if (from === 3 && to > from) return false; // Companion Stone
      if (from === 0 && to > from && !orbUnlockedRef.current) return false;
      return true;
    },
    onBlockedForwardTap: (from) => {
      if (from === 0 && !orbUnlockedRef.current) setLookAtMe((n) => n + 1);
    },
  });

  function finish(result: OnboardingResult) {
    if (finishing.current) return;
    finishing.current = true;
    setExiting(true);
    onComplete(result);
  }

  function startConnect() {
    if (stonePhase !== "idle" || finishing.current) return;
    setStonePhase("connecting");
    const connectMs = reduceMotion ? 150 : 2000;
    const holdMs = reduceMotion ? 150 : 1000;
    window.setTimeout(() => {
      setStonePhase("connected");
      window.setTimeout(() => finish({ stoneConnected: true }), holdMs);
    }, connectMs);
  }

  function enterSlides() {
    if (phaseRef.current !== "splash") return;
    setPhase("slides");
    setIndex(0);
    pager.setSettledIndex(0);
    if (pager.width > 0) pager.trackX.set(0);
  }

  function goNextFromOrb() {
    pager.settleTo(1);
  }

  useEffect(() => {
    if (phase !== "splash") return;

    if (reduceMotion) {
      setTaglineReady(true);
      setSplashLifted(true);
      setShowConceptNote(true);
      setShowTapHint(true);
      return;
    }

    const taglineId = window.setTimeout(() => setTaglineReady(true), 200);
    const liftId = window.setTimeout(() => {
      setSplashLifted(true);
      setShowConceptNote(true);
    }, SPLASH_LIFT_MS);
    const ctaId = window.setTimeout(
      () => setShowTapHint(true),
      SPLASH_LIFT_MS + SPLASH_CTA_AFTER_NOTE_MS,
    );

    return () => {
      window.clearTimeout(taglineId);
      window.clearTimeout(liftId);
      window.clearTimeout(ctaId);
    };
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (phase !== "slides" || index !== 0) {
      setOrbUnlocked(false);
      return;
    }
    setOrbUnlocked(false);
    const id = window.setTimeout(() => setOrbUnlocked(true), O2_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [phase, index]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (phaseRef.current === "splash") {
        if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
          event.preventDefault();
          enterSlides();
        }
        return;
      }
      if (event.key === "ArrowRight") {
        pager.tryGo(1, "key");
      } else if (event.key === "ArrowLeft") {
        pager.tryGo(-1, "key");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const slides = useMemo(
    () => TITLES.map((_, i) => ({ gradient: GRADIENTS[i], eyebrow: EYEBROWS[i] })),
    [],
  );

  function renderAbove(i: number, settled: boolean): ReactNode {
    if (i === 3) {
      return <CompanionStone phase={stonePhase} reduce={!!reduceMotion} />;
    }

    const size = ORB_SIZES[i];
    if (size <= 0) return null;

    const orb = (
      <OnboardingOrb
        size={size}
        lookAtMe={i === 0 ? lookAtMe : 0}
        hintRing={i === 0}
        onClick={i === 0 ? goNextFromOrb : undefined}
        ariaLabel="Tap the orb to continue"
      />
    );

    return (
      <div className="flex flex-col items-center">
        {i === 0 ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {orb}
          </motion.div>
        ) : (
          orb
        )}
        {i === 1 ? (
          <O3IconRow
            settled={settled}
            reduce={!!reduceMotion}
            highlight={o3Highlight}
            onHighlight={setO3Highlight}
          />
        ) : null}
        {i === 0 ? (
          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[13px] text-white">
            <Hand size={14} strokeWidth={2} aria-hidden="true" className="shrink-0" />
            <span>{orbUnlocked ? "Tap the orb, or swipe to continue" : "Tap the orb"}</span>
          </p>
        ) : null}
      </div>
    );
  }

  function renderBody(i: number): ReactNode {
    switch (i) {
      case 0:
        return (
          <>
            <FitTitle>{TITLES[0]}</FitTitle>
            <p className="mx-auto mt-3 max-w-[280px] text-[15px] leading-[1.5] text-white/90">
              Whenever something feels worth keeping, a song, a thought, a voice, just tap the orb.
            </p>
          </>
        );
      case 1:
        return (
          <>
            <FitTitle>{TITLES[1]}</FitTitle>
            <ul className="mt-4 space-y-3 text-left">
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
          </>
        );
      case 2:
        return (
          <>
            <FitTitle>{TITLES[2]}</FitTitle>
            <p className="mx-auto mt-3 max-w-[280px] text-[15px] leading-[1.5] text-white/90">
              See your weeks fill up, get your trimester wrapped, and breathe along with the glow whenever you need a
              moment.
            </p>
          </>
        );
      case 3:
      default:
        return (
          <>
            <FitTitle>{TITLES[3]}</FitTitle>
            {stonePhase === "connected" ? (
              <p className="mt-4 text-[15px] leading-5 font-medium text-white" aria-live="polite">
                Connected. You're all set.
              </p>
            ) : (
              <>
                <p className="mx-auto mt-3 max-w-[280px] text-[15px] leading-[1.5] text-white/90">
                  Hold it when you want to breathe or record. It glows along with your orb.
                </p>
                <div
                  className="mt-4 flex flex-col items-center gap-3"
                  onPointerDown={(event) => event.stopPropagation()}
                  onPointerUp={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                >
                  <PillButton
                    className="inline-flex w-full items-center justify-center gap-2"
                    onClick={stonePhase === "idle" ? startConnect : undefined}
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
                      onClick={() => finish({ stoneConnected: false })}
                    >
                      I'll do this later
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </>
        );
    }
  }

  return (
    <motion.div
      ref={pager.rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Echo Archive"
      className="absolute inset-0 z-50 overflow-hidden touch-none select-none"
      initial={false}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.4, ease: "easeOut" }}
      onPointerDown={
        phase === "splash"
          ? (event) => {
              splashPointer.current = { x: event.clientX, y: event.clientY };
            }
          : pager.onPointerDown
      }
      onPointerMove={phase === "slides" ? pager.onPointerMove : undefined}
      onPointerUp={
        phase === "splash"
          ? (event) => {
              const start = splashPointer.current;
              splashPointer.current = null;
              if (!start) {
                enterSlides();
                return;
              }
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              const dist = Math.hypot(dx, dy);
              // Tap or intentional swipe
              if (dist < 12 || dist >= 40) enterSlides();
            }
          : pager.onPointerUp
      }
      onPointerCancel={
        phase === "splash"
          ? () => {
              splashPointer.current = null;
            }
          : pager.onPointerCancel
      }
    >
      <AnimatePresence>
        {phase === "splash" ? (
          <motion.div
            key="splash-bg"
            aria-hidden="true"
            className="absolute inset-0"
            style={{ backgroundImage: SPLASH_GRADIENT }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.4 }}
          />
        ) : null}
      </AnimatePresence>

      {phase === "slides"
        ? GRADIENTS.map((gradient, i) => (
            <StoryBackgroundLayer
              key={gradient}
              gradient={gradient}
              cardIndex={i}
              progress={pager.progress}
            />
          ))
        : null}

      <StoryTopScrim />

      <div className="sr-only" aria-live="polite">
        {phase === "splash" ? "Echo Archive" : TITLES[index]}
      </div>

      {phase === "slides" ? (
        <Eyebrow absolute tone="strong">
          {EYEBROWS[index]}
        </Eyebrow>
      ) : null}

      {phase === "slides" && index < 3 ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            pager.settleTo(3);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          className="absolute top-3 right-4 z-20 border-0 bg-transparent p-3 text-[13px] text-white/[0.85]"
        >
          Skip
        </button>
      ) : null}

      <AnimatePresence>
        {phase === "splash" ? (
          <motion.div
            key="splash-copy"
            className="pointer-events-none absolute inset-0 z-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.4 }}
          >
            <motion.div
              className="absolute inset-x-0 flex flex-col items-center px-5 text-center"
              initial={false}
              animate={
                splashLifted
                  ? { top: "30%", y: 0, x: 0 }
                  : { top: "50%", y: "-50%", x: 0 }
              }
              transition={{ duration: reduceMotion ? 0.15 : 0.5, ease: "easeOut" }}
            >
              <motion.div
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0.15 : 0.5, ease: "easeOut" }}
              >
                <Display size={40} tone="light">
                  Echo Archive
                </Display>
              </motion.div>
              <motion.p
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: taglineReady || reduceMotion ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0.15 : 0.4, ease: "easeOut" }}
                className="mt-2 text-[14px] leading-5 text-white/80"
              >
                a sound diary for pregnancy
              </motion.p>
            </motion.div>

            <AnimatePresence>
              {showConceptNote ? (
                <motion.p
                  key="concept-note"
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0.15 : 0.6, ease: "easeOut" }}
                  className="absolute top-[42%] left-1/2 w-full max-w-[300px] -translate-x-1/2 px-5 text-center text-[16px] leading-[1.6] text-white/90"
                >
                  {CONCEPT_NOTE}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {showTapHint ? (
                <motion.p
                  key="tap-hint"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduceMotion ? 0.15 : 0.4, ease: "easeOut" }}
                  className="absolute bottom-10 left-0 right-0 text-center text-[12px] text-white/70"
                >
                  Tap to begin
                </motion.p>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {phase === "slides" ? (
        reduceMotion || pager.reduce ? (
          <StorySlideStatic
            layout="fixedCard"
            above={renderAbove(index, true)}
            body={renderBody(index)}
          />
        ) : (
          <motion.div
            className="absolute inset-y-0 left-0 z-[2] flex"
            style={{ x: pager.trackX, width: Math.max(pager.width, 1) * SLIDE_COUNT }}
          >
            {slides.map((_, i) => (
              <StorySlide
                key={EYEBROWS[i]}
                layout="fixedCard"
                cardIndex={i}
                width={pager.width || 390}
                trackX={pager.trackX}
                settled={pager.settledIndex === i}
                above={renderAbove(i, pager.settledIndex === i)}
                body={renderBody(i)}
              />
            ))}
          </motion.div>
        )
      ) : null}

      {phase === "slides" ? (
        reduceMotion || pager.reduce ? (
          <StoryStaticDots active={index} count={SLIDE_COUNT} />
        ) : (
          <StoryMotionDots progress={pager.progress} count={SLIDE_COUNT} />
        )
      ) : null}
    </motion.div>
  );
}

function O3IconRow({
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
  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      {O3_ACTIONS.map((action, i) => {
        const selected = highlight === action.id;
        return (
          <motion.button
            key={action.id}
            type="button"
            aria-label={action.label}
            aria-pressed={selected}
            className="flex size-12 items-center justify-center rounded-full border-2 border-white"
            style={{ background: action.color }}
            initial={reduce ? false : { opacity: 0, scale: 0.6, y: 8 }}
            animate={
              settled
                ? {
                    opacity: 1,
                    scale: selected ? 1.08 : 1,
                    y: 0,
                    boxShadow: selected ? "0 0 0 4px rgba(255,255,255,0.55)" : "0 0 0 0 rgba(255,255,255,0)",
                  }
                : { opacity: 0, scale: 0.6, y: 8 }
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
        className="absolute top-1/2 left-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full"
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
          reduce ? { duration: 0.15 } : { duration: glowDuration, ease: "easeInOut", repeat: Infinity }
        }
      />
      <span
        className="relative block size-[100px] rounded-[48%_52%_45%_55%/55%_45%_55%_45%]"
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
              <span className="flex size-10 items-center justify-center rounded-full bg-[var(--ok-green)] text-white shadow-[0_4px_12px_rgba(48,164,108,0.45)]">
                <Check size={20} strokeWidth={2.75} aria-hidden="true" />
              </span>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
      {phase === "connected" ? <span className="sr-only">Companion Stone connected</span> : null}
    </motion.div>
  );
}
