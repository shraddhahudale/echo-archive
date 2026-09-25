import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

const SLIDE_COUNT = 6;
const SPLASH_MS = 2400;
const O2_FALLBACK_MS = 4000;
const SPLASH_GRADIENT = "linear-gradient(135deg, #A385F7, #6D2BDB)";

/** Sized to fit 390×844 between eyebrow and dots with ≥24px clearance. */
const ORB_SIZES = [132, 148, 112, 96, 0, 0] as const;

const GRADIENTS = [
  "linear-gradient(135deg, #B79BFA, #6D2BDB)",
  "linear-gradient(135deg, #A385F7, #5A1FC4)",
  "linear-gradient(135deg, #E7A6D6, #8B2BCB)",
  "linear-gradient(135deg, #9FB8F7, #6D2BDB)",
  "linear-gradient(135deg, #F6C99A, #C0508F)",
  "linear-gradient(135deg, #5B4A8C, #241B3D)",
] as const;

const EYEBROWS = [
  "WELCOME",
  "THIS IS YOUR ORB",
  "TAP THE ORB TO…",
  "EVERY MOMENT HAS A FEELING",
  "IT ALL ADDS UP",
  "ONE LAST THING",
] as const;

const TITLES = [
  "Hi, Sarah",
  "It breathes with you",
  "Keep a moment",
  "How are you feeling?",
  "Look back, week by week",
  "Meet your Companion Stone",
] as const;

const O4_CHIPS = ["calm", "hopeful", "anxious", "connected", "tearful", "don't know why"] as const;

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

export function Onboarding({ onComplete }: OnboardingProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"splash" | "slides">("splash");
  const [index, setIndex] = useState(0);
  const [taglineReady, setTaglineReady] = useState(false);
  const [lookAtMe, setLookAtMe] = useState(0);
  const [o2Unlocked, setO2Unlocked] = useState(false);
  const [o3Highlight, setO3Highlight] = useState<string | null>(null);
  const [o4Feeling, setO4Feeling] = useState<string | null>(null);
  const [stonePhase, setStonePhase] = useState<StonePhase>("idle");
  const [exiting, setExiting] = useState(false);
  const finishing = useRef(false);
  const o2UnlockedRef = useRef(false);
  o2UnlockedRef.current = o2Unlocked;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const pager = useStoryPager({
    count: SLIDE_COUNT,
    index,
    setIndex,
    enabled: phase === "slides" && stonePhase === "idle",
    canGo: (from, to) => {
      if (from === 5 && to > from) return false;
      // O2: forward locked until 4s unlock (orb tap still advances via settleTo)
      if (from === 1 && to > from && !o2UnlockedRef.current) return false;
      return true;
    },
    onBlockedForwardTap: (from) => {
      if (from === 1 && !o2UnlockedRef.current) setLookAtMe((n) => n + 1);
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

  function goNextFromO2() {
    pager.settleTo(2);
  }

  useEffect(() => {
    if (phase !== "splash") return;
    const taglineId = window.setTimeout(() => setTaglineReady(true), reduceMotion ? 0 : 200);
    const advanceId = window.setTimeout(enterSlides, reduceMotion ? 150 : SPLASH_MS);
    return () => {
      window.clearTimeout(taglineId);
      window.clearTimeout(advanceId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (phase !== "slides" || index !== 1) {
      setO2Unlocked(false);
      return;
    }
    setO2Unlocked(false);
    const id = window.setTimeout(() => setO2Unlocked(true), O2_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [phase, index]);

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
        pager.tryGo(1, "key");
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        pager.tryGo(-1, "key");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const slides = useMemo(
    () =>
      TITLES.map((title, i) => ({
        gradient: GRADIENTS[i],
        eyebrow: EYEBROWS[i],
        title,
      })),
    [],
  );

  /**
   * Column above the glass card:
   * visual → (O2 only: 20px + hint) → 24px → card
   */
  function renderAbove(i: number, settled: boolean): ReactNode {
    let visual: ReactNode = null;

    if (i === 5) {
      visual = <CompanionStone phase={stonePhase} reduce={!!reduceMotion} />;
    } else if (i === 4) {
      visual = <O5Previews settled={settled} />;
    } else {
      const size = ORB_SIZES[i];
      if (size > 0) {
        visual = (
          <div className="relative flex flex-col items-center">
            <OnboardingOrb
              size={size}
              lookAtMe={i === 1 || i === 3 ? lookAtMe : 0}
              hintRing={i === 1}
              onClick={i === 1 ? goNextFromO2 : undefined}
              ariaLabel="Tap the orb to continue"
            />
            {i === 2 ? (
              <O3IconRow
                settled={settled}
                reduce={!!reduceMotion}
                highlight={o3Highlight}
                onHighlight={setO3Highlight}
              />
            ) : null}
          </div>
        );
      }
    }

    if (!visual && i !== 1) return null;

    return (
      <div className="flex w-full flex-col items-center pb-6">
        {visual}
        {i === 1 ? (
          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[13px] text-white">
            <Hand size={14} strokeWidth={2} aria-hidden="true" className="shrink-0" />
            <span>{o2Unlocked ? "Tap the orb, or swipe to continue" : "Tap the orb"}</span>
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
            <Display size={30} tone="light">
              {TITLES[0]}
            </Display>
            <p className="mx-auto mt-3 max-w-[280px] text-[15px] leading-[1.5] text-white/90">
              A sound diary for the weeks in between. The songs, voices and feelings that carry you to meeting your
              baby.
            </p>
          </>
        );
      case 1:
        return (
          <>
            <Display size={30} tone="light">
              {TITLES[1]}
            </Display>
            <p className="mx-auto mt-3 max-w-[280px] text-[15px] leading-[1.5] text-white/90">
              Whenever something feels worth keeping, a song, a thought, a voice, just tap the orb.
            </p>
          </>
        );
      case 2:
        return (
          <>
            <Display size={30} tone="light">
              {TITLES[2]}
            </Display>
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
      case 3:
        return (
          <>
            <Display size={30} tone="light">
              {TITLES[3]}
            </Display>
            <p className="mx-auto mt-3 max-w-[280px] text-[15px] leading-[1.5] text-white/90">
              Add a feeling when you save something. Over the weeks, Echo gently notices the patterns.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {O4_CHIPS.map((label) => {
                const selected = o4Feeling === label;
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={selected}
                    onClick={(event) => {
                      event.stopPropagation();
                      setO4Feeling(label);
                      setLookAtMe((n) => n + 1);
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
          </>
        );
      case 4:
        return (
          <Display size={30} tone="light">
            {TITLES[4]}
          </Display>
        );
      case 5:
      default:
        return (
          <>
            <Display size={30} tone="light">
              {TITLES[5]}
            </Display>
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
      onPointerDown={phase === "slides" ? pager.onPointerDown : undefined}
      onPointerMove={phase === "slides" ? pager.onPointerMove : undefined}
      onPointerUp={phase === "slides" ? pager.onPointerUp : undefined}
      onPointerCancel={phase === "slides" ? pager.onPointerCancel : undefined}
      onClick={
        phase === "splash"
          ? (event) => {
              event.preventDefault();
              enterSlides();
            }
          : undefined
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

      {phase === "slides" && index < 5 ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            pager.settleTo(5);
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
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.4 }}
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
        ) : null}
      </AnimatePresence>

      {phase === "slides" ? (
        reduceMotion || pager.reduce ? (
          <StorySlideStatic above={renderAbove(index, true)} body={renderBody(index)} />
        ) : (
          <motion.div
            className="absolute inset-y-0 left-0 z-[2] flex"
            style={{ x: pager.trackX, width: Math.max(pager.width, 1) * SLIDE_COUNT }}
          >
            {slides.map((_, i) => (
              <StorySlide
                key={EYEBROWS[i]}
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
    <ul className="w-full space-y-2.5 text-left">
      {rows.map((row, i) => (
        <motion.li
          key={row.key}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={settled ? { opacity: 1, y: 0 } : { opacity: 0.85, y: 0 }}
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
