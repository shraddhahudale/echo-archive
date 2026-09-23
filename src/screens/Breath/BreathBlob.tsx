import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { lerp, lerpColor, type BreathPhase } from "../../data/breathPatterns";

type BreathBlobProps = {
  breath: number;
  phase?: BreathPhase | "idle" | "paused";
  dimmed?: boolean;
  className?: string;
};

type Ripple = { id: number; born: number };

export function BreathBlob({ breath, phase = "idle", dimmed = false, className = "" }: BreathBlobProps) {
  const reduce = useReducedMotion();
  const [shimmer, setShimmer] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const prevPhase = useRef<BreathPhase | "idle" | "paused" | null>(null);
  const rippleId = useRef(0);

  useEffect(() => {
    if (reduce || phase !== "hold") {
      setShimmer(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = ((now - start) % 2000) / 2000;
      setShimmer(Math.sin(t * Math.PI * 2) * 0.04);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, reduce]);

  useEffect(() => {
    if (reduce) return;
    const prev = prevPhase.current;
    prevPhase.current = phase;
    if (prev == null) return;
    if ((phase === "inhale" || phase === "exhale") && phase !== prev) {
      const id = ++rippleId.current;
      const born = performance.now();
      setRipples((list) => [...list, { id, born }]);
      const timer = window.setTimeout(() => {
        setRipples((list) => list.filter((r) => r.id !== id));
      }, 600);
      return () => window.clearTimeout(timer);
    }
  }, [phase, reduce]);

  const t = Math.min(1, Math.max(0, breath));
  const dim = dimmed ? 0.6 : 1;

  if (reduce) {
    const opacity = lerp(0.5, 0.9, t) * dim;
    return (
      <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 h-[440px] w-[240px] rounded-full"
          style={{
            opacity,
            transformOrigin: "center center",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(ellipse at center, #8A62B8 0%, #7B579D 45%, rgba(123,87,157,0) 75%)",
            filter: "blur(40px)",
          }}
        />
      </div>
    );
  }

  const outerScaleX = lerp(0.78, 1.18, t);
  const outerScaleY = lerp(0.88, 1.1, t);
  const outerOpacity = lerp(0.45, 1, t) * dim;
  const outerBlur = lerp(48, 36, t);
  const innerScale = lerp(0.6, 1.15, t);
  const innerOpacity = (lerp(0.25, 0.9, t) + shimmer) * dim;
  const coreColor = lerpColor("#7B579D", "#A983DA", t);

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <div
        className="absolute top-1/2 left-1/2 h-[440px] w-[240px] rounded-full"
        style={{
          opacity: outerOpacity,
          transformOrigin: "center center",
          transform: `translate(-50%, -50%) scale(${outerScaleX}, ${outerScaleY})`,
          background:
            "radial-gradient(ellipse at center, #8A62B8 0%, #7B579D 45%, rgba(123,87,157,0) 75%)",
          filter: `blur(${outerBlur}px)`,
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[320px] w-[160px] rounded-full"
        style={{
          opacity: Math.min(1, Math.max(0, innerOpacity)),
          transformOrigin: "center center",
          transform: `translate(-50%, -50%) scale(${innerScale})`,
          background: `radial-gradient(ellipse at center, ${coreColor} 0%, rgba(123,87,157,0) 70%)`,
          filter: "blur(30px)",
        }}
      />
      {ripples.map((ripple) => (
        <RippleRing key={ripple.id} born={ripple.born} />
      ))}
    </div>
  );
}

function RippleRing({ born }: { born: number }) {
  const [frame, setFrame] = useState({ scale: 1, opacity: 0.35 });

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - born) / 600);
      setFrame({
        scale: 1 + p * 0.45,
        opacity: 0.35 * (1 - p),
      });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [born]);

  return (
    <div
      className="absolute top-1/2 left-1/2 h-[440px] w-[240px] rounded-full border border-white/30"
      style={{
        transformOrigin: "center center",
        transform: `translate(-50%, -50%) scale(${frame.scale})`,
        opacity: frame.opacity,
      }}
    />
  );
}

/** Soft vignette that lifts slightly as breath fills. */
export function BreathVignette({ breath }: { breath: number }) {
  const edge = lerp(0.55, 0.45, Math.min(1, Math.max(0, breath)));
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background: `radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${edge}) 100%)`,
      }}
    />
  );
}
