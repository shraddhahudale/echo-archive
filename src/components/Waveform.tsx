type WaveformProps = {
  mode: "ready" | "recording" | "finished" | "compact";
  bars: number[];
  progress: number;
};

const TICKS = 36;

export function Waveform({ mode, bars, progress }: WaveformProps) {
  const compact = mode === "compact";
  const showPlayhead = mode === "recording" || compact;
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <div className={`relative overflow-hidden rounded-[16px] bg-[var(--purple-100)] ${compact ? "h-11 flex-1" : "h-[128px]"}`}>
      <div className={`absolute inset-x-3 flex items-center justify-between ${compact ? "inset-y-2" : "top-7 right-3 bottom-5 left-3"}`}>
        {mode === "ready"
          ? Array.from({ length: TICKS }, (_, index) => (
              <span key={index} className="h-3.5 w-0.5 rounded-full bg-[var(--chip-inactive)]" />
            ))
          : bars.map((height, index) => {
              const filled = mode === "finished" || compact || index / bars.length <= clamped;
              return (
                <span
                  key={index}
                  className="w-[3px] rounded-full"
                  style={{
                    height: `${Math.round(height * 100)}%`,
                    background: filled ? "var(--purple-500)" : "var(--chip-inactive)",
                  }}
                />
              );
            })}
      </div>
      {showPlayhead ? (
        <span
          className="absolute top-2 bottom-2 w-px bg-[var(--purple-500)]"
          style={{ left: `calc(12px + (100% - 24px) * ${clamped})` }}
        >
          <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-[var(--purple-500)]" />
        </span>
      ) : null}
    </div>
  );
}
