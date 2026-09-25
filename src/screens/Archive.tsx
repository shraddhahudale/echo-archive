import { useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronLeft, Search } from "lucide-react";
import { MomentRow, TypeDots, TypeFilterChips } from "../components/MomentRow";
import { tabBarHeight } from "../components/TabBar";
import {
  ALL_FEELINGS,
  ARCHIVE_CURRENT_WEEK,
  countByKind,
  dominantFeeling,
  entriesByWeek,
  feelingSummaries,
  filterEntries,
  formatDayLabel,
  formatDuration,
  formatTotalLength,
  formatWeekRange,
  playlistArts,
  playlistTracks,
  PLAYLISTS,
  recentMoments,
  searchArchive,
  weekSummaries,
  type ArchiveFilter,
  type PlaylistId,
} from "../data/archiveHelpers";
import type { ArchiveSegment, Contributor, TimelineEntry } from "../data/types";
import { useArchiveStore } from "../store/useArchiveStore";

const pushMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

export function Archive() {
  const screen = useArchiveStore((state) => state.archiveScreen);
  const reduce = useReducedMotion();
  const transition = reduce
    ? { duration: 0.15 }
    : { duration: 0.25, ease: "easeOut" as const };
  const fadeOnly = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
  const motionProps = reduce ? fadeOnly : pushMotion;

  return (
    <div className="relative h-full overflow-hidden" aria-label="Archive" data-flow="voice">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={screenKey(screen)}
          className="h-full"
          initial={motionProps.initial}
          animate={motionProps.animate}
          exit={motionProps.exit}
          transition={transition}
        >
          {screen.name === "home" ? <ArchiveHome /> : null}
          {screen.name === "week" ? <WeekDetail week={screen.week} /> : null}
          {screen.name === "feeling" ? (
            <FeelingResults feelings={screen.feelings} title={screen.title} />
          ) : null}
          {screen.name === "person" ? <PersonDetail contributorId={screen.contributorId} /> : null}
          {screen.name === "playlist" ? <PlaylistDetail playlistId={screen.playlistId as PlaylistId} /> : null}
          {screen.name === "search" ? <SearchResults /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function screenKey(screen: { name: string; week?: number; feelings?: string[]; contributorId?: string; playlistId?: string }) {
  if (screen.name === "week") return `week-${screen.week}`;
  if (screen.name === "feeling") return `feeling-${(screen.feelings ?? []).join("+")}`;
  if (screen.name === "person") return `person-${screen.contributorId}`;
  if (screen.name === "playlist") return `playlist-${screen.playlistId}`;
  return screen.name;
}

function ArchiveHome() {
  const entries = useArchiveStore((state) => state.timelineEntries);
  const segment = useArchiveStore((state) => state.archiveSegment);
  const setArchiveSegment = useArchiveStore((state) => state.setArchiveSegment);
  const pushArchive = useArchiveStore((state) => state.pushArchive);
  const reduce = useReducedMotion();
  const [type, setType] = useState<ArchiveFilter["type"]>("all");
  const [feelings, setFeelings] = useState<string[]>([]);
  const filter: ArchiveFilter = useMemo(() => ({ type, feelings }), [type, feelings]);
  const filtered = useMemo(() => filterEntries(entries, filter), [entries, filter]);
  const weeks = useMemo(() => weekSummaries(entries, filter), [entries, filter]);
  const feelingCards = useMemo(() => feelingSummaries(entries, filter), [entries, filter]);
  const recent = useMemo(() => recentMoments(filtered, 8), [filtered]);
  const hasFilter = type !== "all" || feelings.length > 0;

  return (
    <section
      className="scroll-row h-full overflow-x-hidden overflow-y-auto px-5 pt-2"
      style={{ paddingBottom: tabBarHeight + 16 }}
    >
      <p className="text-[15px] leading-5 text-[var(--text-400)]">Your archive,</p>
      <h1 className="mt-1 font-[family-name:var(--font-serif)] text-[36px] leading-10 font-bold text-[var(--text-900)]">
        Echo <span className="italic font-normal">Archive</span>
      </h1>
      <p className="mt-1 text-[15px] leading-5 text-[var(--text-400)]">Your journey from day one</p>

      <button
        type="button"
        onClick={() => pushArchive({ name: "search" })}
        className="mt-5 flex h-11 w-full items-center gap-2 rounded-full bg-[var(--chip-inactive)] px-3 text-left"
      >
        <Search size={18} strokeWidth={2} className="shrink-0 text-[var(--text-400)]" aria-hidden="true" />
        <span className="text-[15px] leading-5 text-[var(--text-400)]">Search songs, notes, people, feelings</span>
      </button>

      <div className="mt-4">
        <TypeFilterChips value={type} onChange={setType} />
        <div className="scroll-row -mx-5 mt-2 flex gap-2 overflow-x-auto px-5">
          {ALL_FEELINGS.map((feeling) => {
            const selected = feelings.includes(feeling);
            return (
              <button
                key={feeling}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  setFeelings((current) =>
                    current.includes(feeling)
                      ? current.filter((item) => item !== feeling)
                      : [...current, feeling],
                  )
                }
                className="h-11 shrink-0 rounded-full border px-3.5 text-[12px] leading-4"
                style={
                  selected
                    ? { background: "var(--text-900)", color: "white", borderColor: "var(--text-900)" }
                    : { background: "transparent", borderColor: "var(--line)", color: "var(--text-900)" }
                }
              >
                {feeling}
              </button>
            );
          })}
        </div>
        {hasFilter ? (
          <button
            type="button"
            onClick={() => {
              setType("all");
              setFeelings([]);
            }}
            className="mt-2 border-0 bg-transparent p-0 text-[13px] text-[var(--purple-500)]"
          >
            Clear
          </button>
        ) : null}
      </div>

      <p className="mt-6 text-[11px] leading-4 font-medium tracking-[0.06em] text-[#8E8E93] uppercase">
        Recently saved
      </p>
      <ul className="scroll-row -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
        {recent.map((entry) => (
          <li key={entry.id} className="w-[72px] shrink-0">
            <RecentTile entry={entry} />
          </li>
        ))}
      </ul>

      <SegmentedControl value={segment} onChange={setArchiveSegment} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={segment}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.12 : 0.15 }}
          className="mt-4"
        >
          {segment === "weeks" ? <WeeksSegment weeks={weeks} /> : null}
          {segment === "feelings" ? <FeelingsSegment cards={feelingCards} /> : null}
          {segment === "people" ? <PeopleSegment filter={filter} /> : null}
        </motion.div>
      </AnimatePresence>

      <PlaylistsRow entries={entries} />
    </section>
  );
}

function SegmentedControl({
  value,
  onChange,
}: {
  value: ArchiveSegment;
  onChange: (value: ArchiveSegment) => void;
}) {
  const options: ArchiveSegment[] = ["weeks", "feelings", "people"];
  const index = options.indexOf(value);
  const reduce = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label="Browse archive"
      className="relative mt-6 grid h-9 grid-cols-3 rounded-full bg-[var(--surface)] p-1"
    >
      <motion.span
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-white shadow-sm"
        animate={{ x: `calc(${index} * 100%)` }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
      />
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={value === option}
          onClick={() => onChange(option)}
          className="relative z-[1] rounded-full border-0 bg-transparent text-[13px] font-medium capitalize text-[var(--text-900)]"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function WeeksSegment({
  weeks,
}: {
  weeks: ReturnType<typeof weekSummaries>;
}) {
  const pushArchive = useArchiveStore((state) => state.pushArchive);
  const reduce = useReducedMotion();
  const [openT2, setOpenT2] = useState(true);
  const [openT1, setOpenT1] = useState(false);
  const t2 = weeks.filter((item) => item.trimester === 2);
  const t1 = weeks.filter((item) => item.trimester === 1);

  return (
    <div className="flex flex-col gap-3">
      <TrimesterGroup
        title="Trimester 2 · weeks 14 to 27"
        open={openT2}
        onToggle={() => setOpenT2((value) => !value)}
        reduce={reduce}
      >
        {t2.map((week) => (
          <WeekRow key={week.week} week={week} onOpen={() => pushArchive({ name: "week", week: week.week })} />
        ))}
      </TrimesterGroup>
      {t1.length > 0 ? (
        <TrimesterGroup
          title="Trimester 1 · weeks 1 to 13"
          open={openT1}
          onToggle={() => setOpenT1((value) => !value)}
          reduce={reduce}
        >
          {t1.map((week) => (
            <WeekRow key={week.week} week={week} onOpen={() => pushArchive({ name: "week", week: week.week })} />
          ))}
        </TrimesterGroup>
      ) : null}
    </div>
  );
}

function TrimesterGroup({
  title,
  open,
  onToggle,
  children,
  reduce,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  reduce: boolean | null;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between border-0 bg-transparent px-0 text-left"
      >
        <span className="text-[15px] leading-5 font-semibold text-[var(--text-900)]">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>
          <ChevronDown size={18} strokeWidth={2} className="text-[#8E8E93]" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 pb-1">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function WeekRow({
  week,
  onOpen,
}: {
  week: ReturnType<typeof weekSummaries>[number];
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-[72px] w-full items-center gap-3 rounded-[16px] border border-[var(--line)] bg-white px-4 text-left shadow-[var(--shadow-card)]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[15px] leading-5 font-semibold text-[var(--text-900)]">Week {week.week}</p>
          {week.isCurrent ? (
            <span className="rounded-full bg-[var(--purple-50)] px-2 py-0.5 text-[11px] font-medium text-[var(--purple-500)]">
              This week
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-[13px] leading-4 text-[#8E8E93]">
          {formatWeekRange(week.week)} · {week.count} {week.count === 1 ? "moment" : "moments"}
        </p>
      </div>
      <TypeDots kinds={week.kinds} />
    </button>
  );
}

function FeelingsSegment({
  cards,
}: {
  cards: ReturnType<typeof feelingSummaries>;
}) {
  const pushArchive = useArchiveStore((state) => state.pushArchive);
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <button
          key={card.feeling}
          type="button"
          onClick={() => pushArchive({ name: "feeling", feelings: [card.feeling] })}
          className="flex h-[88px] flex-col justify-between rounded-[16px] border border-[var(--line)] bg-white p-3 text-left shadow-[var(--shadow-card)]"
        >
          <div>
            <p className="text-[15px] leading-5 font-semibold capitalize text-[var(--text-900)]">{card.feeling}</p>
            <p className="mt-1 text-[13px] leading-4 text-[#8E8E93]">
              {card.count} {card.count === 1 ? "moment" : "moments"}
            </p>
          </div>
          <TypeDots kinds={card.kinds} />
        </button>
      ))}
    </div>
  );
}

function PeopleSegment({ filter }: { filter: ArchiveFilter }) {
  const contributors = useArchiveStore((state) => state.contributors);
  const entries = useArchiveStore((state) => state.timelineEntries);
  const pushArchive = useArchiveStore((state) => state.pushArchive);
  const openEchoInvite = useArchiveStore((state) => state.openEchoInvite);
  const filtered = filterEntries(entries, filter);

  return (
    <div className="flex flex-col gap-3">
      {contributors.map((person) => {
        const personMoments = filtered.filter((entry) => entry.contributorId === person.id);
        if (filter.type !== "all" || filter.feelings.length > 0) {
          if (personMoments.length === 0 && person.status === "active") return null;
        }
        const unseen = person.notes.filter((note) => !note.seen).length;
        return (
          <button
            key={person.id}
            type="button"
            onClick={() => pushArchive({ name: "person", contributorId: person.id })}
            className="flex h-[72px] w-full items-center gap-3 rounded-[16px] border border-[var(--line)] bg-white px-3 text-left shadow-[var(--shadow-card)]"
          >
            <PersonAvatar name={person.name} size={48} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] leading-5 font-semibold text-[var(--text-900)]">{person.name}</p>
              <p className="truncate text-[13px] leading-4 text-[#8E8E93]">
                {person.status === "invited" ? (
                  "Invite sent"
                ) : (
                  <>
                    {person.totalCount} voice notes
                    {unseen > 0 ? (
                      <>
                        {" · "}
                        <span className="inline-flex items-center gap-1">
                          <span className="inline-block size-1.5 rounded-full bg-[var(--amber-500)]" />
                          {unseen} new
                        </span>
                      </>
                    ) : null}
                  </>
                )}
              </p>
            </div>
          </button>
        );
      })}
      <button
        type="button"
        onClick={openEchoInvite}
        className="flex h-11 w-full items-center justify-center rounded-full border border-[var(--line)] bg-white text-[13px] font-medium text-[var(--amber-600)]"
      >
        Invite someone
      </button>
    </div>
  );
}

function PlaylistsRow({ entries }: { entries: TimelineEntry[] }) {
  const pushArchive = useArchiveStore((state) => state.pushArchive);
  return (
    <section className="mt-8">
      <p className="text-[15px] leading-5 font-semibold text-[var(--text-900)]">Playlists</p>
      <ul className="scroll-row -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
        {PLAYLISTS.map((playlist) => {
          const tracks = playlistTracks(entries, playlist.id);
          const songCount = tracks.filter((item) => item.kind === "song").length;
          const arts = playlistArts(tracks);
          return (
            <li key={playlist.id}>
              <button
                type="button"
                onClick={() => pushArchive({ name: "playlist", playlistId: playlist.id })}
                className="relative h-[88px] w-[160px] overflow-hidden rounded-[16px] border border-[var(--line)] bg-white text-left shadow-[var(--shadow-card)]"
              >
                <span className="absolute inset-0 opacity-40">
                  {arts[0] ? (
                    <img src={arts[0]} alt="" className="absolute top-2 left-2 size-14 rounded-[8px] object-cover" />
                  ) : null}
                  {arts[1] ? (
                    <img src={arts[1]} alt="" className="absolute top-5 left-8 size-14 rounded-[8px] object-cover" />
                  ) : null}
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/90 to-transparent px-3 pt-6 pb-2">
                  <span className="block truncate text-[13px] font-semibold text-[var(--text-900)]">{playlist.name}</span>
                  <span className="block text-[12px] text-[#8E8E93]">
                    {songCount} {songCount === 1 ? "song" : "songs"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RecentTile({ entry }: { entry: TimelineEntry }) {
  const contributors = useArchiveStore((state) => state.contributors);
  const playMoment = usePlayMoment();
  const playingId = useArchiveStore((state) => state.archivePlayingId);
  const currentTrackId = useArchiveStore((state) => state.currentTrackId);
  const playing = useArchiveStore((state) => state.playing);
  const contributor = contributors.find((item) => item.id === entry.contributorId);
  const isPlaying =
    entry.kind === "song"
      ? playing && entry.songId === currentTrackId
      : playingId === entry.id;

  return (
    <button type="button" onClick={() => playMoment(entry)} className="w-full border-0 bg-transparent p-0 text-left">
      <span className="block size-[72px] overflow-hidden rounded-[12px]">
        <RecentThumb entry={entry} contributor={contributor} playing={isPlaying} />
      </span>
      <span className="mt-1 block truncate text-[12px] leading-4 text-[var(--text-900)]">{entry.title}</span>
    </button>
  );
}

function RecentThumb({
  entry,
  contributor,
  playing,
}: {
  entry: TimelineEntry;
  contributor?: Contributor;
  playing?: boolean;
}) {
  if (entry.kind === "song" && entry.art) {
    return <img src={entry.art} alt="" className={`size-full object-cover ${playing ? "opacity-80" : ""}`} />;
  }
  if (entry.kind === "echo") {
    return (
      <span className="grid size-full place-items-center bg-[var(--amber-50)] text-[18px] font-semibold text-[var(--amber-600)]">
        {(contributor?.name ?? "E").charAt(0)}
      </span>
    );
  }
  return (
    <span className="flex size-full items-end justify-center gap-[3px] bg-[var(--purple-50)] pb-4">
      {[14, 22, 10, 20, 16].map((height, index) => (
        <span key={index} className="w-[3px] rounded-full bg-[var(--purple-500)]" style={{ height }} />
      ))}
    </span>
  );
}

function BackHeader({ title, eyebrow, onBack }: { title: React.ReactNode; eyebrow?: string; onBack: () => void }) {
  return (
    <div className="px-5 pt-2">
      <button
        type="button"
        onClick={onBack}
        className="-ml-2 inline-flex h-11 items-center gap-0.5 border-0 bg-transparent px-2 text-[15px] text-[var(--text-900)]"
      >
        <ChevronLeft size={22} strokeWidth={2} />
        Archive
      </button>
      {eyebrow ? <p className="mt-1 text-[13px] leading-4 text-[#8E8E93]">{eyebrow}</p> : null}
      <div className="mt-1">{title}</div>
    </div>
  );
}

function WeekDetail({ week }: { week: number }) {
  const entries = useArchiveStore((state) => state.timelineEntries);
  const popArchive = useArchiveStore((state) => state.popArchive);
  const openTimelineWeek = useArchiveStore((state) => state.openTimelineWeek);
  const [type, setType] = useState<"all" | TimelineEntry["kind"]>("all");
  const moments = useMemo(() => {
    const list = entriesByWeek(entries, week);
    return type === "all" ? list : list.filter((item) => item.kind === type);
  }, [entries, week, type]);
  const all = useMemo(() => entriesByWeek(entries, week), [entries, week]);
  const counts = countByKind(all);
  const feeling = dominantFeeling(all);
  const isCurrent = week === ARCHIVE_CURRENT_WEEK;
  const playMoment = usePlayMoment();
  const [playWeekIndex, setPlayWeekIndex] = useState<number | null>(null);
  const queueRef = useRef(all);
  queueRef.current = all;

  useEffect(() => {
    if (playWeekIndex == null) return;
    const item = queueRef.current[playWeekIndex];
    if (!item) {
      setPlayWeekIndex(null);
      return;
    }
    playMoment(item);
    const duration = Math.min((item.durationSec ?? 30) * 40, 2500);
    const id = window.setTimeout(() => setPlayWeekIndex((current) => (current == null ? null : current + 1)), duration);
    return () => window.clearTimeout(id);
  }, [playWeekIndex, playMoment]);

  const grouped = groupByDay(moments);
  const playingId = useArchiveStore((state) => state.archivePlayingId);
  const currentTrackId = useArchiveStore((state) => state.currentTrackId);
  const playing = useArchiveStore((state) => state.playing);
  const contributors = useArchiveStore((state) => state.contributors);

  function isPlaying(entry: TimelineEntry) {
    if (entry.kind === "song") return playing && entry.songId === currentTrackId;
    return playingId === entry.id;
  }

  return (
    <section className="scroll-row h-full overflow-y-auto" style={{ paddingBottom: tabBarHeight + 16 }}>
      <BackHeader
        onBack={popArchive}
        eyebrow={formatWeekRange(week)}
        title={
          <h1 className="font-[family-name:var(--font-serif)] text-[36px] leading-10 font-bold text-[var(--text-900)]">
            Week {week}
          </h1>
        }
      />
      <div className="px-5">
        <div
          className="mt-4 flex items-center gap-3 rounded-[20px] border border-[var(--line)] p-4 shadow-[var(--shadow-card)]"
          style={{ background: isCurrent ? "var(--purple-50)" : "white" }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[15px] leading-5 font-semibold text-[var(--text-900)]">
              {all.length} moments · mostly {feeling}
            </p>
            <p className="mt-1 text-[13px] leading-4 text-[#8E8E93]">
              {counts.voice} voice notes · {counts.song} songs · {counts.echo} echoes
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPlayWeekIndex((current) => (current == null ? 0 : null))}
            className="h-11 shrink-0 rounded-full border border-[var(--line)] bg-white px-4 text-[13px] font-medium text-[var(--purple-500)]"
          >
            {playWeekIndex == null ? "Play week" : "Stop"}
          </button>
        </div>
        <div className="mt-4">
          <TypeFilterChips value={type} onChange={setType} />
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {grouped.map((group) => (
            <div key={group.date}>
              <p className="mb-2 text-[12px] font-medium tracking-[0.04em] text-[#8E8E93] uppercase">
                {formatDayLabel(group.date)}
              </p>
              <div className="flex flex-col gap-3">
                {group.items.map((entry) => (
                  <MomentRow
                    key={entry.id}
                    entry={entry}
                    contributor={contributors.find((item) => item.id === entry.contributorId)}
                    playing={isPlaying(entry) || (playWeekIndex != null && all[playWeekIndex]?.id === entry.id)}
                    onPlay={() => {
                      setPlayWeekIndex(null);
                      playMoment(entry);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => openTimelineWeek(week)}
          className="mt-6 mb-2 border-0 bg-transparent p-0 text-[14px] text-[var(--purple-500)]"
        >
          See this week on the Timeline →
        </button>
      </div>
    </section>
  );
}

function FeelingResults({ feelings, title }: { feelings: string[]; title?: string }) {
  const entries = useArchiveStore((state) => state.timelineEntries);
  const popArchive = useArchiveStore((state) => state.popArchive);
  const contributors = useArchiveStore((state) => state.contributors);
  const playMoment = usePlayMoment();
  const [type, setType] = useState<"all" | TimelineEntry["kind"]>("all");
  const label = title ?? (feelings.length === 1 ? capitalize(feelings[0]) : feelings.map(capitalize).join(" & "));
  const anyMode = feelings.length > 1;
  const matched = useMemo(() => {
    return entries
      .filter((entry) => {
        if (type !== "all" && entry.kind !== type) return false;
        const tags = entry.feelings ?? [];
        return anyMode ? feelings.some((feeling) => tags.includes(feeling)) : tags.includes(feelings[0]);
      })
      .slice()
      .sort((a, b) => (b.week ?? 0) - (a.week ?? 0) || `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
  }, [entries, feelings, type, anyMode]);

  const byWeek = groupByWeek(matched);
  const playingId = useArchiveStore((state) => state.archivePlayingId);
  const currentTrackId = useArchiveStore((state) => state.currentTrackId);
  const playing = useArchiveStore((state) => state.playing);

  return (
    <section className="scroll-row h-full overflow-y-auto" style={{ paddingBottom: tabBarHeight + 16 }}>
      <BackHeader
        onBack={popArchive}
        title={
          <h1 className="font-[family-name:var(--font-serif)] text-[36px] leading-10 italic font-normal text-[var(--text-900)]">
            {label}
          </h1>
        }
      />
      <div className="px-5">
        <p className="mt-1 text-[15px] leading-5 text-[#8E8E93]">
          {matched.length} {matched.length === 1 ? "moment" : "moments"}
        </p>
        <div className="mt-4">
          <TypeFilterChips value={type} onChange={setType} />
        </div>
        <div className="mt-4 flex flex-col gap-5">
          {byWeek.map((group) => (
            <div key={group.week}>
              <p className="mb-2 text-[15px] font-semibold text-[var(--text-900)]">Week {group.week}</p>
              <div className="flex flex-col gap-3">
                {group.items.map((entry) => (
                  <MomentRow
                    key={entry.id}
                    entry={entry}
                    contributor={contributors.find((item) => item.id === entry.contributorId)}
                    playing={
                      entry.kind === "song"
                        ? playing && entry.songId === currentTrackId
                        : playingId === entry.id
                    }
                    onPlay={() => playMoment(entry)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PersonDetail({ contributorId }: { contributorId: string }) {
  const contributors = useArchiveStore((state) => state.contributors);
  const popArchive = useArchiveStore((state) => state.popArchive);
  const openEchoAddNote = useArchiveStore((state) => state.openEchoAddNote);
  const person = contributors.find((item) => item.id === contributorId);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<number | null>(null);

  if (!person) {
    return (
      <section className="px-5 pt-2">
        <button type="button" onClick={popArchive} className="h-11 border-0 bg-transparent">
          Back
        </button>
        <p className="mt-6 text-[15px] text-[#8E8E93]">This person is no longer in your archive.</p>
      </section>
    );
  }

  function remind() {
    setToast(true);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 2000);
  }

  return (
    <section className="scroll-row h-full overflow-y-auto" style={{ paddingBottom: tabBarHeight + 16 }}>
      <BackHeader
        onBack={popArchive}
        title={
          <div className="mt-2 flex items-center gap-3">
            <PersonAvatar name={person.name} size={64} />
            <div>
              <h1 className="text-[22px] leading-7 font-semibold text-[var(--text-900)]">{person.name}</h1>
              <p className="mt-1 text-[13px] leading-4 text-[#8E8E93]">
                {capitalize(person.relationship)} · {person.totalCount} voice notes
                {person.since != null ? ` · since week ${person.since}` : ""}
              </p>
            </div>
          </div>
        }
      />
      <div className="mt-6 px-5">
        {person.notes.length === 0 ? (
          <div className="pt-8 text-center">
            <p className="text-[15px] leading-5 text-[#8E8E93]">{person.name} hasn't left a voice note yet.</p>
            <button
              type="button"
              onClick={remind}
              className="mx-auto mt-6 flex h-11 items-center rounded-full border border-[var(--line)] bg-white px-4 text-[13px] font-medium text-[#D98A1F]"
            >
              Send a reminder
            </button>
            {toast ? (
              <p role="status" className="mx-auto mt-4 w-fit rounded-full bg-[#1A1A1A] px-4 py-2 text-[13px] text-white">
                Reminder sent
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {person.notes.map((note) => (
              <div
                key={note.id}
                className="flex h-[72px] items-center gap-3 rounded-[16px] border border-[var(--line)] bg-white px-3 shadow-[var(--shadow-card)]"
              >
                <span className="grid size-12 place-items-center rounded-[10px] bg-[var(--amber-50)] text-[15px] font-semibold text-[var(--amber-600)]">
                  {person.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-[var(--text-900)]">{note.title}</p>
                  <p className="text-[13px] text-[#8E8E93]">{formatDuration(note.durationSec)}</p>
                </div>
                {note.inArchive ? (
                  <span className="rounded-full bg-[var(--amber-50)] px-2 py-1 text-[12px] text-[#8E8E93]">In archive</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEchoAddNote(person.id, note.id)}
                    className="h-11 rounded-full border border-[var(--amber-500)] bg-white px-4 text-[13px] font-medium text-[var(--amber-600)]"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PlaylistDetail({ playlistId }: { playlistId: PlaylistId }) {
  const entries = useArchiveStore((state) => state.timelineEntries);
  const popArchive = useArchiveStore((state) => state.popArchive);
  const setPlaybackQueue = useArchiveStore((state) => state.setPlaybackQueue);
  const playMoment = usePlayMoment();
  const playlist = PLAYLISTS.find((item) => item.id === playlistId);
  const tracks = useMemo(() => playlistTracks(entries, playlistId), [entries, playlistId]);
  const songs = tracks.filter((item) => item.kind === "song" && item.songId);
  const arts = playlistArts(tracks);
  const total = tracks.reduce((sum, item) => sum + (item.durationSec ?? 0), 0);
  const playingId = useArchiveStore((state) => state.archivePlayingId);
  const currentTrackId = useArchiveStore((state) => state.currentTrackId);
  const playing = useArchiveStore((state) => state.playing);
  const contributors = useArchiveStore((state) => state.contributors);
  const songCount = songs.length;

  return (
    <section className="scroll-row h-full overflow-y-auto" style={{ paddingBottom: tabBarHeight + 16 }}>
      <BackHeader
        onBack={popArchive}
        title={
          <div className="mt-2">
            <div className="relative h-[120px] w-[120px]">
              {arts[0] ? (
                <img src={arts[0]} alt="" className="absolute top-0 left-0 size-[88px] rounded-[12px] object-cover" />
              ) : (
                <span className="absolute top-0 left-0 size-[88px] rounded-[12px] bg-[var(--pink-50)]" />
              )}
              {arts[1] ? (
                <img src={arts[1]} alt="" className="absolute right-0 bottom-0 size-[88px] rounded-[12px] object-cover" />
              ) : null}
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-serif)] text-[28px] leading-8 font-bold text-[var(--text-900)]">
              {playlist?.name ?? "Playlist"}
            </h1>
            <p className="mt-1 text-[13px] text-[#8E8E93]">
              {songCount} {songCount === 1 ? "song" : "songs"} · {formatTotalLength(total)}
            </p>
            <button
              type="button"
              onClick={() => {
                const ids = songs.map((item) => item.songId!).filter(Boolean);
                setPlaybackQueue(ids);
              }}
              className="mt-4 h-11 rounded-full border border-[var(--line)] bg-white px-5 text-[13px] font-medium text-[var(--pink-500)]"
            >
              Play all
            </button>
          </div>
        }
      />
      <div className="mt-6 flex flex-col gap-3 px-5">
        {tracks.map((entry) => (
          <MomentRow
            key={entry.id}
            entry={entry}
            contributor={contributors.find((item) => item.id === entry.contributorId)}
            playing={
              entry.kind === "song"
                ? playing && entry.songId === currentTrackId
                : playingId === entry.id
            }
            onPlay={() => playMoment(entry)}
          />
        ))}
      </div>
    </section>
  );
}

function SearchResults() {
  const entries = useArchiveStore((state) => state.timelineEntries);
  const contributors = useArchiveStore((state) => state.contributors);
  const popArchive = useArchiveStore((state) => state.popArchive);
  const pushArchive = useArchiveStore((state) => state.pushArchive);
  const playMoment = usePlayMoment();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const playingId = useArchiveStore((state) => state.archivePlayingId);
  const currentTrackId = useArchiveStore((state) => state.currentTrackId);
  const playing = useArchiveStore((state) => state.playing);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  const results = useMemo(
    () => searchArchive(entries, contributors, debounced),
    [entries, contributors, debounced],
  );
  const total =
    results.voice.length + results.song.length + results.echo.length + results.people.length;
  const suggestions = ["Mom", "hopeful", "Holocene"];

  function highlight(text: string) {
    const q = debounced.trim();
    if (!q) return text;
    const index = text.toLowerCase().indexOf(q.toLowerCase());
    if (index < 0) return text;
    return (
      <>
        {text.slice(0, index)}
        <mark className="rounded-[2px] bg-[var(--purple-50)] text-inherit">{text.slice(index, index + q.length)}</mark>
        {text.slice(index + q.length)}
      </>
    );
  }

  return (
    <section className="scroll-row h-full overflow-y-auto" style={{ paddingBottom: tabBarHeight + 16 }}>
      <div className="flex items-center gap-2 px-5 pt-2">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-[var(--chip-inactive)] px-3">
          <Search size={18} className="shrink-0 text-[var(--text-400)]" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search songs, notes, people, feelings"
            aria-label="Search archive"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[var(--text-900)] placeholder:text-[var(--text-400)]"
          />
        </label>
        <button type="button" onClick={popArchive} className="h-11 shrink-0 border-0 bg-transparent px-1 text-[15px] text-[var(--purple-500)]">
          Cancel
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {debounced.trim() ? `${total} results` : ""}
      </p>

      {!debounced.trim() ? (
        <div className="mt-6 px-5">
          <p className="text-[15px] text-[#8E8E93]">Try a search</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setQuery(chip)}
                className="h-11 rounded-full border border-[var(--line)] bg-white px-3.5 text-[12px] text-[var(--text-900)]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      ) : total === 0 ? (
        <p className="mt-8 px-5 text-center text-[15px] leading-5 text-[#8E8E93]">
          Nothing matches "{debounced.trim()}". Try a song, a person or a feeling.
        </p>
      ) : (
        <div className="mt-6 space-y-6 px-5">
          <SearchGroup
            title="Voice notes"
            items={results.voice}
            render={(entry) => (
              <MomentRow
                key={entry.id}
                entry={entry}
                playing={playingId === entry.id}
                onPlay={() => playMoment(entry)}
                titleOverride={highlight(entry.title)}
              />
            )}
          />
          <SearchGroup
            title="Songs"
            items={results.song}
            render={(entry) => (
              <MomentRow
                key={entry.id}
                entry={entry}
                playing={playing && entry.songId === currentTrackId}
                onPlay={() => playMoment(entry)}
                titleOverride={highlight(entry.title)}
              />
            )}
          />
          <SearchGroup
            title="Echoes"
            items={results.echo}
            render={(entry) => {
              const person = contributors.find((item) => item.id === entry.contributorId);
              const full = person ? `${person.name}: ${entry.title}` : entry.title;
              return (
                <MomentRow
                  key={entry.id}
                  entry={entry}
                  contributor={person}
                  playing={playingId === entry.id}
                  onPlay={() => playMoment(entry)}
                  titleOverride={highlight(full)}
                />
              );
            }}
          />
          {results.people.length > 0 ? (
            <div>
              <p className="mb-2 text-[15px] font-semibold">People</p>
              <div className="flex flex-col gap-3">
                {results.people.slice(0, 5).map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => pushArchive({ name: "person", contributorId: person.id })}
                    className="flex h-[72px] items-center gap-3 rounded-[16px] border border-[var(--line)] bg-white px-3 text-left shadow-[var(--shadow-card)]"
                  >
                    <PersonAvatar name={person.name} size={48} />
                    <div>
                      <p className="text-[15px] font-semibold">{highlight(person.name)}</p>
                      <p className="text-[13px] text-[#8E8E93]">{person.totalCount} voice notes</p>
                    </div>
                  </button>
                ))}
                {results.people.length > 5 ? (
                  <p className="text-[13px] text-[var(--purple-500)]">See all ({results.people.length})</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function SearchGroup({
  title,
  items,
  render,
}: {
  title: string;
  items: TimelineEntry[];
  render: (entry: TimelineEntry) => ReactNode;
}) {
  if (items.length === 0) return null;
  const shown = items.slice(0, 5);
  return (
    <div>
      <p className="mb-2 text-[15px] font-semibold text-[var(--text-900)]">{title}</p>
      <div className="flex flex-col gap-3">{shown.map(render)}</div>
      {items.length > 5 ? (
        <p className="mt-2 text-[13px] text-[var(--purple-500)]">See all ({items.length})</p>
      ) : null}
    </div>
  );
}

function PersonAvatar({ name, size }: { name: string; size: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-[var(--amber-50)] font-semibold text-[var(--amber-600)]"
      style={{ width: size, height: size, fontSize: size > 56 ? 22 : 15 }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function usePlayMoment() {
  return useCallback((entry: TimelineEntry) => {
    const state = useArchiveStore.getState();
    if (entry.kind === "song" && entry.songId) {
      state.selectTrack(entry.songId);
      return;
    }
    state.setArchivePlaying(state.archivePlayingId === entry.id ? null : entry.id);
  }, []);
}

function groupByDay(moments: TimelineEntry[]) {
  const map = new Map<string, TimelineEntry[]>();
  for (const moment of moments) {
    const list = map.get(moment.date) ?? [];
    list.push(moment);
    map.set(moment.date, list);
  }
  return [...map.entries()].map(([date, items]) => ({ date, items }));
}

function groupByWeek(moments: TimelineEntry[]) {
  const map = new Map<number, TimelineEntry[]>();
  for (const moment of moments) {
    const week = moment.week ?? 0;
    const list = map.get(week) ?? [];
    list.push(moment);
    map.set(week, list);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([week, items]) => ({ week, items }));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
