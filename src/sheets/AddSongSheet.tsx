import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, Mic, Plus, Search, SkipForward } from "lucide-react";
import { sheetRecentlyPlayedIds } from "../data/mock";
import type { Song } from "../data/types";
import { AnythingToAdd } from "./AnythingToAdd";
import { SavedMoment } from "./SavedMoment";
import { useArchiveStore } from "../store/useArchiveStore";

type AddSongSheetProps = {
  titleId: string;
};

type Phase = "search" | "details" | "saved";

const FEELINGS = ["calm", "hopeful", "tearful", "anxious", "connected", "don't know why"];

export function AddSongSheet({ titleId }: AddSongSheetProps) {
  const reduce = useReducedMotion();
  const week = useArchiveStore((state) => state.user.week);
  const songs = useArchiveStore((state) => state.songs);
  const currentId = useArchiveStore((state) => state.currentTrackId);
  const playing = useArchiveStore((state) => state.playing);
  const togglePlay = useArchiveStore((state) => state.togglePlay);
  const skipTrack = useArchiveStore((state) => state.skipTrack);
  const saveSong = useArchiveStore((state) => state.saveSong);
  const closeSheet = useArchiveStore((state) => state.closeSheet);
  const [phase, setPhase] = useState<Phase>(() => (useArchiveStore.getState().songDraftId ? "details" : "search"));
  const [songId, setSongId] = useState<string | null>(() => useArchiveStore.getState().songDraftId);
  const [query, setQuery] = useState("");
  const [feelings, setFeelings] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const savedOnce = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = songs.find((song) => song.id === currentId) ?? songs[0];
  const picked = songs.find((song) => song.id === songId) ?? null;
  const recent = sheetRecentlyPlayedIds
    .map((id) => songs.find((song) => song.id === id))
    .filter((song): song is Song => Boolean(song));
  const trimmed = query.trim();
  const results = songs.filter((song) => {
    const haystack = `${song.title} ${song.artist}`.toLowerCase();
    return haystack.includes(trimmed.toLowerCase());
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const active = document.activeElement;
    if (active instanceof Node && root.contains(active)) return;
    const back = root.querySelector<HTMLButtonElement>('button[aria-label="Back"]');
    (back ?? root.querySelector<HTMLElement>("button, input, textarea"))?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase !== "saved") return;
    const id = window.setTimeout(closeSheet, 2500);
    return () => window.clearTimeout(id);
  }, [phase, closeSheet]);

  function choose(id: string) {
    setSongId(id);
    setPhase("details");
  }

  function commit() {
    if (!picked || savedOnce.current) return;
    savedOnce.current = true;
    saveSong({ songId: picked.id, feelings, note: note.trim() || undefined });
    setPhase("saved");
  }

  function toggleFeeling(feeling: string) {
    setFeelings((currentFeelings) =>
      currentFeelings.includes(feeling) ? currentFeelings.filter((item) => item !== feeling) : [...currentFeelings, feeling],
    );
  }

  const showBack = phase === "details";
  const title = phase === "details" ? "Anything to add?" : "Add a song";

  return (
    <div ref={rootRef} className="px-5 pb-8" data-flow="song">
      {phase === "saved" ? null : (
        <div className="flex items-center gap-1">
          {showBack ? (
            <button
              type="button"
              aria-label="Back"
              onClick={() => setPhase("search")}
              className="-ml-2 grid size-11 shrink-0 place-items-center border-0 bg-transparent p-0 text-[var(--text-900)]"
            >
              <ChevronLeft size={22} strokeWidth={2} />
            </button>
          ) : null}
          <h2 id={titleId} className="text-[17px] leading-[22px] font-semibold text-[var(--text-900)]">
            {title}
          </h2>
        </div>
      )}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={phase}
          data-phase={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.22 }}
        >
          {phase === "search" ? (
            <div className="pt-5">
              <label className="sheet-search flex h-11 items-center gap-2 rounded-full bg-[var(--chip-inactive)] px-3">
                <Search size={18} strokeWidth={2} className="shrink-0 text-[var(--text-400)]" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search for a song"
                  placeholder="Search for a song..."
                  className="h-full min-h-11 min-w-0 flex-1 border-0 bg-transparent text-[15px] leading-5 text-[var(--text-900)] placeholder:text-[var(--text-400)]"
                />
                <Mic size={18} strokeWidth={2} className="shrink-0 text-[var(--text-400)]" aria-hidden="true" />
              </label>
              {trimmed ? (
                <div className="mt-4">
                  {results.length === 0 ? (
                    <p className="px-1 text-[15px] leading-5 text-[var(--text-400)]">
                      No songs match "{trimmed}". Try a different title or artist.
                    </p>
                  ) : (
                    results.map((song, index) => (
                      <SongRow key={song.id} song={song} divider={index < results.length - 1} onAdd={() => choose(song.id)} />
                    ))
                  )}
                </div>
              ) : (
                <>
                  <p className="mt-4 text-[11px] leading-4 font-medium tracking-[0.06em] text-[#8E8E93] uppercase">Playing now</p>
                  {current ? (
                    <div className="mt-2 flex items-center gap-3 rounded-[16px] bg-[var(--pink-50)] py-2 pr-4 pl-2">
                      <SongArt song={current} size={56} radius={8} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[17px] leading-[22px] font-semibold text-[#111111]">{current.title}</p>
                        <p className="truncate text-[14px] leading-[18px] text-[#8E8E93]">{current.artist}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-6 text-[#3F3A4A]">
                        <button
                          type="button"
                          aria-label={playing ? "Pause" : "Play"}
                          onClick={togglePlay}
                          className="relative -mx-[11px] grid h-11 w-11 place-items-center border-0 bg-transparent p-0 text-inherit"
                        >
                          {playing ? <PauseBars /> : <PlayMark />}
                        </button>
                        <button
                          type="button"
                          aria-label="Skip"
                          onClick={skipTrack}
                          className="relative -mx-[11px] grid h-11 w-11 place-items-center border-0 bg-transparent p-0 text-inherit"
                        >
                          <SkipForward size={22} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Add ${current.title}`}
                          onClick={() => choose(current.id)}
                          className="relative -mx-[11px] grid h-11 w-11 place-items-center border-0 bg-transparent p-0 text-inherit"
                        >
                          <Plus size={20} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <p className="mt-5 text-[11px] leading-4 font-medium tracking-[0.06em] text-[#8E8E93] uppercase">Recently played</p>
                  <div className="mt-2">
                    {recent.map((song, index) => (
                      <SongRow key={song.id} song={song} divider={index < recent.length - 1} onAdd={() => choose(song.id)} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : null}
          {phase === "details" && picked ? (
            <AnythingToAdd
              tone="song"
              feelings={FEELINGS}
              selected={feelings}
              onToggle={toggleFeeling}
              note={note}
              onNote={setNote}
              onSave={commit}
              card={
                <div className="flex items-center gap-3 rounded-[16px] bg-[var(--pink-50)] p-3">
                  <SongArt song={picked} size={56} radius={8} />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] leading-5 font-semibold text-[var(--text-900)]">{picked.title}</p>
                    <p className="truncate text-[12px] leading-4 text-[var(--text-400)]">{picked.artist}</p>
                  </div>
                </div>
              }
            />
          ) : null}
          {phase === "saved" && picked ? (
            <SavedMoment titleId={titleId} tone="song" week={week} reduce={reduce}>
              {picked.title} by <em className="font-normal italic">{picked.artist}</em>
            </SavedMoment>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SongRow({ song, divider, onAdd }: { song: Song; divider: boolean; onAdd: () => void }) {
  return (
    <div className={`flex h-[72px] items-center gap-3 py-3 ${divider ? "border-b border-[#E6E6EA]" : ""}`}>
      <SongArt song={song} size={56} radius={6} />
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <p className="truncate text-[16px] leading-5 font-semibold text-[#111111]">{song.title}</p>
        <p className="truncate text-[14px] leading-[18px] text-[#8E8E93]">{song.artist}</p>
      </div>
      <button
        type="button"
        aria-label={`Add ${song.title}`}
        onClick={onAdd}
        className="relative h-11 w-11 shrink-0 border-0 bg-transparent p-0 text-[#8E8E93]"
      >
        <Plus size={20} strokeWidth={2} className="absolute top-1/2 right-0 -translate-y-1/2" />
      </button>
    </div>
  );
}

function SongArt({ song, size = 44, radius = 8 }: { song: Song; size?: number; radius?: number }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(song.art) && !failed;

  return (
    <span
      className="block shrink-0 overflow-hidden bg-cover bg-center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundImage: showImage ? undefined : song.gradient,
        backgroundColor: "var(--pink-50)",
      }}
    >
      {showImage ? <img src={song.art} alt="" className="size-full object-cover" onError={() => setFailed(true)} /> : null}
    </span>
  );
}

function PauseBars() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <rect x="5" y="3" width="4" height="16" rx="1" fill="currentColor" />
      <rect x="13" y="3" width="4" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M7 4.2v13.6l11.2-6.8L7 4.2Z" fill="currentColor" />
    </svg>
  );
}
