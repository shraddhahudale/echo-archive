import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type WaveformProps = {
  mode: "ready" | "recording" | "finished" | "compact";
  bars: number[];
  progress: number;
};

const PAD = 8;
const BAR = 2;
const GAP = 2;
const PITCH = BAR + GAP;

function capacityFor(width: number) {
  const inner = Math.max(0, width - PAD * 2);
  return Math.max(1, Math.floor((inner + GAP) / PITCH));
}

function fitBars(bars: number[], capacity: number) {
  if (bars.length <= capacity) return bars;
  return Array.from({ length: capacity }, (_, index) => {
    const start = Math.floor((index * bars.length) / capacity);
    const end = Math.max(start + 1, Math.floor(((index + 1) * bars.length) / capacity));
    let total = 0;
    for (let cursor = start; cursor < end; cursor += 1) total += bars[cursor] ?? 0;
    return total / (end - start);
  });
}

function WaveBar({ level, boxHeight, grow }: { level: number; boxHeight: number; grow: boolean }) {
  const target = Math.max(BAR, Math.round(level * boxHeight));
  const [height, setHeight] = useState(grow ? 0 : target);

  useEffect(() => {
    if (!grow) {
      setHeight(target);
      return;
    }
    const id = requestAnimationFrame(() => setHeight(target));
    return () => cancelAnimationFrame(id);
  }, [grow, target]);

  return (
    <span
      className="w-[2px] shrink-0 rounded-full bg-[var(--purple-500)]"
      style={{ height, transition: grow ? "height 150ms ease-out" : undefined }}
    />
  );
}

export function Waveform({ mode, bars, progress }: WaveformProps) {
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const compact = mode === "compact";
  const clamped = Math.min(1, Math.max(0, progress));

  useLayoutEffect(() => {
    const node = boxRef.current;
    if (!node) return;
    const update = () => setSize({ width: node.clientWidth, height: node.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const capacity = capacityFor(size.width);
  const visible =
    mode === "ready"
      ? []
      : mode === "recording"
        ? bars.slice(-capacity)
        : fitBars(bars, capacity);
  const playIndex =
    mode === "recording" ? visible.length - 1 : Math.round(clamped * Math.max(0, visible.length - 1));
  const showPlayhead = (mode === "recording" || compact) && visible.length > 0;

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden rounded-[16px] bg-[var(--purple-100)] ${compact ? "h-11 flex-1" : "h-[128px]"}`}
    >
      <div className="absolute inset-y-0 right-2 left-2 flex items-center gap-[2px]">
        {mode === "ready"
          ? Array.from({ length: size.width === 0 ? 0 : capacity }, (_, index) => (
              <span key={index} className="size-[2px] shrink-0 rounded-full bg-[#C7C7CC]" />
            ))
          : visible.map((level, index) => (
              <WaveBar
                key={bars.length - visible.length + index}
                level={level}
                boxHeight={size.height}
                grow={mode === "recording" && !reduce && index === visible.length - 1}
              />
            ))}
      </div>
      {showPlayhead ? (
        <span
          className="absolute top-2 bottom-2 w-px bg-[var(--purple-500)]"
          style={{
            left: PAD + playIndex * PITCH + BAR / 2,
            transform: "translateX(-50%)",
            transition: mode === "recording" && !reduce ? "left 150ms ease-out" : undefined,
          }}
        >
          <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-[var(--purple-500)]" />
        </span>
      ) : null}
    </div>
  );
}
