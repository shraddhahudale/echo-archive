import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Mic, Music, Users, type LucideIcon } from "lucide-react";
import { AlbumTile } from "../components/AlbumTile";
import { tabBarHeight } from "../components/TabBar";
import { timelineFirstMonth, timelineLastMonth, timelineToday } from "../data/timeline";
import type { TimelineEntry } from "../data/types";
import { entriesByDate, heavyRotations, monthDots, useArchiveStore } from "../store/useArchiveStore";

const insightDots = ["#A385F7", "#5DA4F4", "#E064A0", "#B98352", "#F2A541", "#D14FC4"];
const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dotColor: Record<TimelineEntry["kind"], string> = {
  song: "var(--pink-500)",
  voice: "var(--purple-500)",
  echo: "var(--amber-500)",
};

const legend = [
  { label: "Music", color: "var(--pink-500)" },
  { label: "Voice note", color: "var(--purple-500)" },
  { label: "Echo", color: "var(--amber-500)" },
];

export function Timeline() {
  const user = useArchiveStore((state) => state.user);
  const entries = useArchiveStore((state) => state.timelineEntries);
  const selectedDate = useArchiveStore((state) => state.selectedDate);
  const visibleMonth = useArchiveStore((state) => state.visibleMonth);
  const selectDate = useArchiveStore((state) => state.selectDate);
  const setVisibleMonth = useArchiveStore((state) => state.setVisibleMonth);
  const openWrapped = useArchiveStore((state) => state.openWrapped);
  const selectTrack = useArchiveStore((state) => state.selectTrack);
  const songs = useArchiveStore((state) => state.songs);
  const rotations = useMemo(() => heavyRotations(songs), [songs]);
  const reduce = useReducedMotion();
  const [direction, setDirection] = useState(1);
  const trimester = String(user.trimester).padStart(2, "0");
  const [year, month] = visibleMonth.split("-").map(Number);
  const dots = useMemo(() => monthDots(entries, year, month), [entries, year, month]);

  function shiftMonth(delta: number) {
    const nextDate = new Date(year, month - 1 + delta, 1);
    const next = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
    if (next < timelineFirstMonth || next > timelineLastMonth) return;
    setDirection(delta);
    setVisibleMonth(next);
  }

  return (
    <section
      aria-label="Timeline"
      className="scroll-row h-full overflow-x-hidden overflow-y-auto px-5 pt-2"
      style={{ paddingBottom: tabBarHeight + 16 }}
    >
      <p className="text-[15px] leading-5 font-normal text-[var(--text-400)]">Good evening,</p>
      <h1 className="mt-1 text-[34px] leading-10 font-bold text-[var(--text-900)]">{user.name}</h1>
      <p className="mt-1 text-[15px] leading-5 font-normal text-[var(--text-400)]">Your pregnancy journey</p>
      <p className="mt-6 text-center text-[17px] leading-[22px]">
        <span className="font-bold text-[var(--text-900)]">Trimester {trimester}</span>
        <span className="font-normal text-[var(--text-400)]"> / W{user.week}</span>
      </p>

      <motion.button
        type="button"
        aria-label="See your T2 Wrapped"
        whileTap={reduce ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onClick={openWrapped}
        className="mt-4 w-full cursor-pointer rounded-[24px] border border-[#EDE4FB] bg-[var(--purple-50)] p-5 text-left font-[inherit]"
      >
        <p className="text-[12px] leading-4 font-medium tracking-[0.08em] text-[#6E6E73] uppercase">T2 Insights</p>
        <h2 className="mt-2 text-[24px] leading-[30px] font-bold text-[var(--text-900)]">See your T2 Wrapped</h2>
        <p className="mt-1 text-[15px] leading-5 font-normal text-[#6E6E73]">
          Your second trimester in music and feeling
        </p>
        <div className="mt-4 flex gap-1.5" aria-hidden="true">
          {insightDots.map((color) => (
            <span key={color} className="size-[10px] rounded-full" style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[15px] leading-5 font-normal text-[#6E6E73]">12 insights ready</p>
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full bg-[var(--purple-500)] text-white"
          >
            <ArrowRight size={16} strokeWidth={2.25} />
          </span>
        </div>
      </motion.button>

      <article className="mt-4 rounded-[24px] border border-[var(--line)] bg-[var(--bg)] p-4">
        <div className="grid grid-cols-[44px_1fr_44px] items-center">
          <MonthButton
            label="Previous month"
            disabled={visibleMonth <= timelineFirstMonth}
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft size={18} strokeWidth={2.25} />
          </MonthButton>
          <h2 className="text-center text-[20px] leading-6 font-medium text-[var(--text-900)]">
            {monthNames[month - 1]} {year}
          </h2>
          <MonthButton
            label="Next month"
            disabled={visibleMonth >= timelineLastMonth}
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight size={18} strokeWidth={2.25} />
          </MonthButton>
        </div>

        <div className="mt-3 grid grid-cols-7 justify-items-center" aria-hidden="true">
          {weekdays.map((day) => (
            <span
              key={day}
              className="flex h-4 w-11 items-center justify-center text-[12px] leading-4 tracking-[0.04em] text-[#8E8E93]"
            >
              {day}
            </span>
          ))}
        </div>

        <div className="relative mt-2 grid overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={visibleMonth}
              className="col-start-1 row-start-1 w-full self-start"
              initial={{ opacity: 0, x: reduce ? 0 : direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduce ? 0 : direction * -24 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <DayGrid
                year={year}
                month={month}
                dots={dots}
                selectedDate={selectedDate}
                onSelect={selectDate}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-center gap-5">
          {legend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5 text-[14px] leading-5 text-[#6E6E73]">
              <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>

        <DayPanel selectedDate={selectedDate} reduce={reduce} />
      </article>

      <section className="mt-5" aria-labelledby="heavy-rotations">
        <h2 id="heavy-rotations" className="text-[17px] leading-5 font-normal text-[#A1A5B0]">
          Heavy rotations
        </h2>
        <div className="mt-5 flex justify-between gap-2">
          {rotations.map(({ song, plays, title }) => (
            <AlbumTile
              key={song.id}
              title={title}
              artist={song.artist}
              art={song.art}
              gradient={song.gradient}
              bordered={song.bordered}
              size={96}
              titleClassName="relative z-[1] mt-2 block truncate text-[15px] leading-5 font-semibold text-[var(--text-900)]"
              artistClassName="relative z-[1] block truncate text-[13px] leading-4 text-[#8E8E93]"
              meta={
                <span className="relative z-[1] mt-1.5 inline-flex rounded-[var(--radius-pill)] bg-[var(--pink-50)] px-2 py-0.5 text-[12px] leading-4 text-[var(--pink-500)]">
                  {plays} plays
                </span>
              }
              onSelect={() => selectTrack(song.id)}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

function MonthButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex size-11 items-center justify-center border-0 bg-transparent p-0 text-[var(--purple-500)] ${
        disabled ? "cursor-default opacity-30" : "cursor-pointer"
      }`}
    >
      <span className="flex size-8 items-center justify-center rounded-[10px] bg-[var(--purple-50)]">{children}</span>
    </button>
  );
}

function DayGrid({
  year,
  month,
  dots,
  selectedDate,
  onSelect,
}: {
  year: number;
  month: number;
  dots: Record<number, TimelineEntry["kind"][]>;
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  const start = new Date(year, month - 1, 1).getDay();
  const count = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: start }, () => null),
    ...Array.from({ length: count }, (_, index) => index + 1),
  ];
  const monthLabel = monthNames[month - 1];

  return (
    <div className="grid grid-cols-7 justify-items-center gap-y-1" aria-label={`${monthLabel} ${year}`}>
      {cells.map((day, index) => {
        if (day === null) return <span key={`empty-${index}`} className="h-[52px] w-11" />;
        const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const kinds = dots[day] ?? [];
        const today = date === timelineToday;
        const future = date > timelineToday;
        const selected = date === selectedDate;
        const kindLabel = kinds
          .map((kind) => (kind === "song" ? "music" : kind === "voice" ? "voice note" : "echo"))
          .join(", ");
        return (
          <button
            key={date}
            type="button"
            data-date={date}
            disabled={future}
            aria-pressed={selected}
            aria-current={today ? "date" : undefined}
            aria-label={`${day} ${monthLabel}${today ? ", today" : ""}${kindLabel ? `, ${kindLabel}` : ""}`}
            onClick={() => onSelect(date)}
            className={`flex h-[52px] w-11 min-h-11 flex-col items-center rounded-[12px] border-0 pt-px font-[inherit] ${
              selected && !today ? "bg-[var(--pink-50)]" : "bg-transparent"
            } ${future ? "cursor-default" : "cursor-pointer"}`}
          >
            <span
              className={`flex size-9 items-center justify-center text-[16px] leading-none ${
                today
                  ? "rounded-full bg-[var(--pink-500)] text-white"
                  : future
                    ? "text-[#C7C7CC]"
                    : "text-[var(--text-900)]"
              }`}
            >
              {day}
            </span>
            <span className="mt-[6px] flex h-[5px] gap-[3px]" aria-hidden="true">
              {kinds.map((kind, dotIndex) => (
                <span
                  key={`${date}-${dotIndex}`}
                  data-kind={kind}
                  className="size-[5px] rounded-full"
                  style={{ backgroundColor: dotColor[kind] }}
                />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const rowStyle: Record<TimelineEntry["kind"], { icon: LucideIcon; tile: string; iconColor: string; tint: string }> = {
  song: { icon: Music, tile: "var(--pink-50)", iconColor: "var(--pink-500)", tint: "bg-white" },
  voice: { icon: Mic, tile: "var(--purple-50)", iconColor: "var(--purple-500)", tint: "bg-[var(--purple-50)]" },
  echo: { icon: Users, tile: "var(--amber-50)", iconColor: "var(--amber-600)", tint: "bg-[var(--amber-50)]" },
};

function formatDayLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${monthNames[month - 1]} ${year}`;
}

function formatClock(time: string) {
  const [hourValue, minute] = time.split(":").map(Number);
  const suffix = hourValue >= 12 ? "pm" : "am";
  const hour = hourValue % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function DayPanel({ selectedDate, reduce }: { selectedDate: string; reduce: boolean | null }) {
  const entries = useArchiveStore((state) => state.timelineEntries);
  const contributors = useArchiveStore((state) => state.contributors);
  const currentTrackId = useArchiveStore((state) => state.currentTrackId);
  const playing = useArchiveStore((state) => state.playing);
  const selectTrack = useArchiveStore((state) => state.selectTrack);
  const togglePlay = useArchiveStore((state) => state.togglePlay);
  const dayEntries = useMemo(() => entriesByDate(entries, selectedDate), [entries, selectedDate]);
  const [inlineId, setInlineId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const [motionReady, setMotionReady] = useState(false);
  const label = formatDayLabel(selectedDate);

  useEffect(() => {
    setInlineId(null);
  }, [selectedDate]);

  useEffect(() => {
    setMotionReady(true);
  }, []);

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    const measure = () => setHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [selectedDate, dayEntries]);

  function onRow(entry: TimelineEntry) {
    if (entry.kind === "song") {
      if (!entry.songId) return;
      setInlineId(null);
      if (currentTrackId === entry.songId && playing) togglePlay();
      else selectTrack(entry.songId);
      return;
    }
    setInlineId((current) => (current === entry.id ? null : entry.id));
  }

  return (
    <motion.div
      className="mt-3 overflow-hidden"
      initial={false}
      animate={{ height }}
      transition={{ duration: reduce || !motionReady ? 0 : 0.28, ease: "easeOut" }}
    >
      <div
        ref={contentRef}
        data-day-panel
        className="rounded-[16px] border border-[#EFEFF4] bg-[#FAFAFC] p-3"
        aria-label={label}
      >
        <p className="text-[14px] leading-5 text-[#8E8E93]">{label}</p>
        {dayEntries.length === 0 ? (
          <p className="mt-1 px-2 py-3 text-center text-[14px] leading-5 text-[#8E8E93]">
            Nothing saved on this day.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {dayEntries.map((entry, index) => {
                const style = rowStyle[entry.kind];
                const Icon = style.icon;
                const active =
                  entry.kind === "song"
                    ? !inlineId && playing && entry.songId === currentTrackId
                    : inlineId === entry.id;
                const title =
                  entry.kind === "echo"
                    ? `${contributors.find((person) => person.id === entry.contributorId)?.name ?? "Echo"}: ${entry.title}`
                    : entry.title;
                const clock = formatClock(entry.time);
                return (
                  <motion.button
                    key={`${selectedDate}-${entry.id}`}
                    type="button"
                    data-entry-id={entry.id}
                    data-kind={entry.kind}
                    data-title={title}
                    data-time={clock}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduce ? undefined : { opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.2, delay: reduce ? 0 : index * 0.03 }}
                    onClick={() => onRow(entry)}
                    aria-pressed={active}
                    aria-label={`${active ? "Pause" : "Play"} ${title}, ${clock}`}
                    className={`flex h-12 min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-pill)] border border-[#ECECF1] px-2 text-left font-[inherit] ${
                      active && entry.kind !== "song" ? style.tint : "bg-white"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-[8px]"
                      style={{ backgroundColor: style.tile, color: style.iconColor }}
                    >
                      {active ? (
                        <PlayingBars color={style.iconColor} reduce={reduce} />
                      ) : (
                        <Icon size={15} strokeWidth={2.25} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[15px] leading-5 text-[var(--text-900)]">
                      {title}
                    </span>
                    <span className="shrink-0 text-[14px] leading-5 text-[#8E8E93]">{clock}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PlayingBars({ color, reduce }: { color: string; reduce: boolean | null }) {
  return (
    <span className="flex h-3 items-end gap-[2px]">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={`w-[2px] rounded-full ${reduce ? "" : "echo-bar"}`}
          style={{
            backgroundColor: color,
            height: reduce ? [6, 12, 8][index] : 12,
            animationDelay: `${index * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}
