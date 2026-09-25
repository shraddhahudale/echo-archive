import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, Plus, Shuffle } from "lucide-react";
import { Display } from "../components/Display";
import { chromeBottomPad } from "../components/MiniPlayer";
import { MomentRow } from "../components/MomentRow";
import { sanitizeFeelings } from "../data/archiveHelpers";
import {
  moodPlaylistById,
  tileGradient,
  type MoodPlaylistId,
} from "../data/moodPlaylists";
import type { Song, TimelineEntry } from "../data/types";
import { useArchiveStore } from "../store/useArchiveStore";

type MoodPlaylistProps = {
  playlistId: MoodPlaylistId;
};

export function MoodPlaylistPage({ playlistId }: MoodPlaylistProps) {
  const playlist = moodPlaylistById(playlistId);
  const songs = useArchiveStore((state) => state.songs);
  const timelineEntries = useArchiveStore((state) => state.timelineEntries);
  const selectTrack = useArchiveStore((state) => state.selectTrack);
  const openSongDetails = useArchiveStore((state) => state.openSongDetails);
  const openArchiveFeeling = useArchiveStore((state) => state.openArchiveFeeling);
  const popHomeScreen = useArchiveStore((state) => state.popHomeScreen);
  const playEntry = useArchiveStore((state) => state.playEntry);
  const nowPlaying = useArchiveStore((state) => state.nowPlaying);
  const playing = useArchiveStore((state) => state.playing);
  const reduce = useReducedMotion();

  const tracks = useMemo(() => {
    if (!playlist) return [] as Song[];
    return playlist.songIds
      .map((id) => songs.find((song) => song.id === id))
      .filter((song): song is Song => Boolean(song));
  }, [playlist, songs]);

  const trackIds = useMemo(() => tracks.map((track) => track.id), [tracks]);

  const archiveMoments = useMemo(() => {
    if (!playlist) return [] as TimelineEntry[];
    const tags = playlist.archiveFeelings;
    const anyMode = tags.length > 1;
    return timelineEntries
      .filter((entry) => entry.kind !== "echo")
      .filter((entry) => {
        const feelings = sanitizeFeelings(entry.feelings);
        return anyMode ? tags.some((tag) => feelings.includes(tag)) : feelings.includes(tags[0]!);
      })
      .slice(0, 3);
  }, [playlist, timelineEntries]);

  if (!playlist) {
    return (
      <section className="scroll-row h-full overflow-y-auto px-5" style={{ paddingBottom: chromeBottomPad }}>
        <button type="button" onClick={popHomeScreen} className="-ml-2 mt-2 inline-flex h-11 items-center border-0 bg-transparent px-2">
          <ChevronLeft size={22} strokeWidth={2} />
          Home
        </button>
        <p className="mt-4 text-[15px] text-[var(--text-400)]">Playlist not found.</p>
      </section>
    );
  }

  const Icon = playlist.icon;
  const coverGradient = tileGradient(playlist.color);

  function playAll(shuffled: boolean) {
    if (trackIds.length === 0) return;
    const ids = shuffled ? shuffleIds(trackIds) : trackIds;
    selectTrack(ids[0]!, ids);
  }

  return (
    <section
      aria-label={playlist.label}
      className="scroll-row h-full overflow-x-hidden overflow-y-auto"
      style={{ paddingBottom: chromeBottomPad }}
    >
      <div className="px-5 pt-2">
        <button
          type="button"
          onClick={popHomeScreen}
          className="-ml-2 inline-flex h-11 items-center gap-0.5 border-0 bg-transparent px-2 text-[15px] text-[var(--text-900)]"
        >
          <ChevronLeft size={22} strokeWidth={2} />
          Home
        </button>

        <div className="mt-2 flex flex-col items-center text-center">
          <motion.div
            className="relative grid size-[200px] place-items-center rounded-[20px] border border-white/60"
            style={{ background: coverGradient }}
            initial={reduce ? false : { scale: 0.96 }}
            animate={{ scale: 1 }}
            transition={{ duration: reduce ? 0.15 : 0.25, ease: "easeOut" }}
          >
            <Icon size={64} strokeWidth={1.5} color={playlist.iconColor} aria-hidden="true" />
          </motion.div>

          <Display as="h1" size={30} className="mt-5">
            {playlist.label}
          </Display>
          <p className="mt-1.5 text-[14px] leading-[18px] text-[#8E8E93]">Echo · picked for you</p>
          <p className="mt-2 max-w-[280px] text-[15px] leading-5 text-[#6E6E73]">{playlist.description}</p>

          <div className="mt-5 flex w-full gap-3">
            <button
              type="button"
              onClick={() => playAll(false)}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border-0 text-[15px] font-semibold text-white"
              style={{ background: playlist.playColor }}
            >
              <PlayMark />
              Play
            </button>
            <button
              type="button"
              onClick={() => playAll(true)}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border bg-transparent text-[15px] font-semibold text-[var(--text-900)]"
              style={{ borderColor: playlist.playColor, color: playlist.playColor }}
            >
              <Shuffle size={18} strokeWidth={2} aria-hidden="true" />
              Shuffle
            </button>
          </div>
        </div>
      </div>

      <ul className="mt-6 px-5">
        {tracks.map((song, index) => (
          <li key={song.id}>
            <ListRow
              song={song}
              fallbackGradient={coverGradient}
              divider={index < tracks.length - 1}
              playing={playing && nowPlaying.songId === song.id}
              onPlay={() => selectTrack(song.id, trackIds)}
              onAdd={() => openSongDetails(song.id)}
            />
          </li>
        ))}
      </ul>

      {archiveMoments.length > 0 ? (
        <section className="mt-8 px-5 pb-4" aria-labelledby="from-archive">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="from-archive" className="text-[15px] leading-5 font-normal text-[var(--text-400)]">
              From your archive
            </h2>
            <button
              type="button"
              onClick={() => openArchiveFeeling(playlist.archiveFeelings, playlist.archiveTitle)}
              className="border-0 bg-transparent p-0 text-[13px] font-medium text-[var(--purple-500)]"
            >
              See all →
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {archiveMoments.map((entry) => (
              <MomentRow
                key={entry.id}
                entry={entry}
                playing={playing && (nowPlaying.id === entry.id || nowPlaying.songId === entry.songId)}
                onPlay={() => playEntry(entry, archiveMoments)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function ListRow({
  song,
  fallbackGradient,
  divider,
  playing,
  onPlay,
  onAdd,
}: {
  song: Song;
  fallbackGradient: string;
  divider: boolean;
  playing?: boolean;
  onPlay: () => void;
  onAdd: () => void;
}) {
  return (
    <div
      className={`flex h-[64px] items-center gap-3 ${divider ? "border-b border-[#E6E6EA]" : ""} ${
        playing ? "opacity-100" : ""
      }`}
    >
      <button
        type="button"
        onClick={onPlay}
        className="flex min-w-0 flex-1 items-center gap-3 border-0 bg-transparent p-0 text-left"
      >
        <SongThumb song={song} fallbackGradient={fallbackGradient} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] leading-5 font-semibold text-[var(--text-900)]">{song.title}</p>
          <p className="truncate text-[13px] leading-4 text-[var(--text-secondary)]">{song.artist}</p>
        </div>
      </button>
      <button
        type="button"
        aria-label={`Add ${song.title}`}
        onClick={onAdd}
        className="relative grid size-11 shrink-0 place-items-center border-0 bg-transparent p-0 text-[var(--text-secondary)]"
      >
        <Plus size={20} strokeWidth={2} />
      </button>
    </div>
  );
}

function SongThumb({ song, fallbackGradient }: { song: Song; fallbackGradient: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(song.art) && !failed;

  return (
    <span
      className="block size-12 shrink-0 overflow-hidden rounded-[8px]"
      style={{ background: showImage ? undefined : fallbackGradient }}
    >
      {showImage ? (
        <img src={song.art} alt="" className="size-full object-cover" onError={() => setFailed(true)} />
      ) : null}
    </span>
  );
}

function PlayMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4.5 2.8v10.4L13.2 8 4.5 2.8Z" fill="currentColor" />
    </svg>
  );
}

function shuffleIds(ids: string[]) {
  const next = [...ids];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = next[i]!;
    next[i] = next[j]!;
    next[j] = a;
  }
  return next;
}
