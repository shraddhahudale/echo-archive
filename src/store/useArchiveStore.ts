import { create } from "zustand";
import {
  ARCHIVE_CURRENT_WEEK,
  enrichTimeline,
  weekFromDate,
  weekStartDate,
  type PlaylistId,
} from "../data/archiveHelpers";
import { contributors as seedContributors, playbackQueueIds, recentlyPlayedIds, songs as seedSongs, user as seedUser } from "../data/mock";
import {
  fromSong,
  fromTimelineEntry,
  isSameNowPlaying,
  type NowPlayingItem,
} from "../data/playback";
import { timelineEntries as seedTimeline, timelineToday } from "../data/timeline";
import type {
  ArchiveScreen,
  ArchiveSegment,
  Contributor,
  EchoLaunch,
  Entry,
  Song,
  TimelineEntry,
} from "../data/types";
import type { TabId } from "../components/TabBar";

type VoiceNoteInput = {
  title?: string;
  feelings: string[];
  note?: string;
  durationSec: number;
};

type SongInput = {
  songId: string;
  feelings: string[];
  note?: string;
};

type InviteInput = {
  name: string;
  relationship: string;
  contact: string;
};

export type SheetId = "choice" | "voice" | "song" | "echo";

type ArchiveState = {
  user: typeof seedUser;
  sheet: SheetId | null;
  songs: Song[];
  recentlyPlayedIds: string[];
  playbackQueueIds: string[];
  nowPlaying: NowPlayingItem;
  playQueue: NowPlayingItem[];
  playing: boolean;
  elapsedSec: number;
  entries: Entry[];
  contributors: Contributor[];
  nextVoiceNoteNumber: number;
  songDraftId: string | null;
  stoneConnected: boolean;
  timelineEntries: TimelineEntry[];
  selectedDate: string;
  visibleMonth: string;
  wrappedOpen: boolean;
  wrappedIndex: number;
  archiveSegment: ArchiveSegment;
  archiveScreen: ArchiveScreen;
  echoLaunch: EchoLaunch;
  requestTab: TabId | null;
  connectStone: () => void;
  selectDate: (date: string) => void;
  setVisibleMonth: (month: string) => void;
  openWrapped: () => void;
  closeWrapped: () => void;
  setWrappedIndex: (index: number) => void;
  togglePlay: () => void;
  skipTrack: () => void;
  playNow: (item: NowPlayingItem, queue?: NowPlayingItem[]) => void;
  selectTrack: (songId: string, queueSongIds?: string[]) => void;
  playEntry: (entry: TimelineEntry, queue?: TimelineEntry[]) => void;
  setPlaybackQueue: (songIds: string[], startId?: string) => void;
  setPlayQueue: (items: NowPlayingItem[], startId?: string) => void;
  tickPlayback: (dtSec: number) => void;
  saveVoiceNote: (input: VoiceNoteInput) => void;
  saveSong: (input: SongInput) => void;
  inviteMember: (input: InviteInput) => void;
  addEchoesToArchive: (contributorId: string, echoIds: string[]) => void;
  addEchoesToWeek: (contributorId: string, noteIds: string[], feelings: string[], note?: string) => void;
  renameEcho: (contributorId: string, echoId: string, title: string) => void;
  removeEcho: (contributorId: string, echoId: string) => void;
  markSeen: (contributorId: string) => void;
  renameMoment: (id: string, title: string) => void;
  editMomentFeelings: (id: string, feelings: string[]) => void;
  deleteMoment: (id: string) => void;
  setArchiveSegment: (segment: ArchiveSegment) => void;
  pushArchive: (screen: ArchiveScreen) => void;
  popArchive: () => void;
  resetArchiveScreen: () => void;
  openArchiveFeeling: (feelings: string[], title?: string) => void;
  openTimelineWeek: (week: number) => void;
  openEchoInvite: () => void;
  openEchoAddNote: (contributorId: string, noteId: string) => void;
  clearEchoLaunch: () => void;
  clearRequestTab: () => void;
  openSheet: (sheet: SheetId) => void;
  openSongDetails: (songId: string) => void;
  closeSheet: () => void;
};

function songById(songs: Song[], id: string) {
  return songs.find((song) => song.id === id);
}

function clockNow() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function pushTimeline(entries: TimelineEntry[], next: TimelineEntry | TimelineEntry[]) {
  const added = Array.isArray(next) ? next : [next];
  return [...added, ...entries];
}

function patchMoment(entries: TimelineEntry[], id: string, patch: Partial<TimelineEntry>) {
  return entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
}

const heavyPlays = [
  { id: "breathe-deeper", plays: 44 },
  { id: "holocene", plays: 41 },
  { id: "breathe", plays: 36 },
] as const;

const seededTimeline = enrichTimeline(seedTimeline, seedContributors);
const defaultSong = songById(seedSongs, "let-it-happen") ?? seedSongs[0];
const defaultNowPlaying = fromSong(defaultSong);
const defaultPlayQueue = playbackQueueIds
  .map((id) => songById(seedSongs, id))
  .filter((song): song is Song => Boolean(song))
  .map(fromSong);

function songQueueItems(songs: Song[], ids: string[]) {
  return ids
    .map((id) => songById(songs, id))
    .filter((song): song is Song => Boolean(song))
    .map(fromSong);
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  user: seedUser,
  songs: seedSongs,
  recentlyPlayedIds,
  playbackQueueIds,
  nowPlaying: defaultNowPlaying,
  playQueue: defaultPlayQueue.length > 0 ? defaultPlayQueue : [defaultNowPlaying],
  playing: true,
  elapsedSec: 0,
  sheet: null,
  entries: [],
  contributors: seedContributors,
  nextVoiceNoteNumber: 8,
  songDraftId: null,
  stoneConnected: false,
  timelineEntries: seededTimeline,
  selectedDate: timelineToday,
  visibleMonth: "2026-05",
  wrappedOpen: false,
  wrappedIndex: 0,
  archiveSegment: "weeks",
  archiveScreen: { name: "home" },
  echoLaunch: null,
  requestTab: null,

  connectStone: () => set({ stoneConnected: true }),

  selectDate: (date) => {
    if (date > timelineToday) return;
    set({ selectedDate: date });
  },

  setVisibleMonth: (month) => set({ visibleMonth: month }),

  openWrapped: () => set({ wrappedOpen: true, wrappedIndex: 0 }),
  closeWrapped: () => set({ wrappedOpen: false, wrappedIndex: 0 }),
  setWrappedIndex: (index) => set({ wrappedIndex: Math.max(0, Math.min(5, index)) }),

  togglePlay: () => set({ playing: !get().playing }),

  playNow: (item, queue) => {
    const { nowPlaying, playing } = get();
    if (isSameNowPlaying(nowPlaying, item) && playing) {
      set({ playing: false });
      return;
    }
    if (isSameNowPlaying(nowPlaying, item) && !playing) {
      set({ playing: true });
      return;
    }
    set({
      nowPlaying: item,
      playQueue: queue && queue.length > 0 ? queue : [item],
      playing: true,
      elapsedSec: 0,
      playbackQueueIds:
        item.kind === "song" && item.songId
          ? queue?.every((q) => q.kind === "song")
            ? (queue.map((q) => q.songId!).filter(Boolean) as string[])
            : get().playbackQueueIds
          : get().playbackQueueIds,
    });
  },

  selectTrack: (songId, queueSongIds) => {
    const song = songById(get().songs, songId);
    if (!song) return;
    const ids = queueSongIds ?? get().playbackQueueIds;
    const queue = songQueueItems(get().songs, ids.includes(songId) ? ids : [songId, ...ids]);
    get().playNow(fromSong(song), queue);
  },

  playEntry: (entry, queue) => {
    const { songs, contributors } = get();
    const item = fromTimelineEntry(entry, songs, contributors);
    const items = (queue ?? [entry]).map((row) => fromTimelineEntry(row, songs, contributors));
    get().playNow(item, items);
  },

  skipTrack: () => {
    const { playQueue, nowPlaying, songs, playbackQueueIds } = get();
    const queue =
      playQueue.length > 0
        ? playQueue
        : songQueueItems(songs, playbackQueueIds);
    if (queue.length === 0) return;
    const index = queue.findIndex((item) => isSameNowPlaying(nowPlaying, item));
    const next = queue[(index + 1 + queue.length) % queue.length] ?? queue[0];
    set({ nowPlaying: next, playing: true, elapsedSec: 0 });
  },

  setPlaybackQueue: (ids, startId) => {
    if (ids.length === 0) return;
    const queue = songQueueItems(get().songs, ids);
    const start = queue.find((item) => item.songId === (startId ?? ids[0])) ?? queue[0];
    set({
      playbackQueueIds: ids,
      playQueue: queue,
      nowPlaying: start,
      playing: true,
      elapsedSec: 0,
    });
  },

  setPlayQueue: (items, startId) => {
    if (items.length === 0) return;
    const start = items.find((item) => item.id === startId) ?? items[0];
    set({
      playQueue: items,
      nowPlaying: start,
      playing: true,
      elapsedSec: 0,
      playbackQueueIds: items.every((item) => item.kind === "song")
        ? items.map((item) => item.songId!).filter(Boolean)
        : get().playbackQueueIds,
    });
  },

  tickPlayback: (dtSec) => {
    const { playing, nowPlaying, elapsedSec } = get();
    if (!playing || !nowPlaying) return;
    const next = elapsedSec + dtSec;
    if (next >= nowPlaying.durationSec) {
      get().skipTrack();
      return;
    }
    set({ elapsedSec: next });
  },

  saveVoiceNote: ({ title, feelings, note, durationSec }) => {
    const { nextVoiceNoteNumber, user, entries, timelineEntries } = get();
    const fallback = `Voice note #${String(nextVoiceNoteNumber).padStart(2, "0")}`;
    const resolved = title?.trim() || fallback;
    const id = crypto.randomUUID();
    const entry: Entry = {
      id,
      kind: "voice",
      title: resolved,
      number: nextVoiceNoteNumber,
      feelings,
      note,
      durationSec,
      createdAt: new Date().toISOString(),
      week: user.week,
    };
    const timeline: TimelineEntry = {
      id,
      date: timelineToday,
      time: clockNow(),
      kind: "voice",
      title: resolved,
      feelings,
      note,
      durationSec,
      week: user.week,
    };
    set({
      entries: [entry, ...entries],
      timelineEntries: pushTimeline(timelineEntries, timeline),
      nextVoiceNoteNumber: nextVoiceNoteNumber + 1,
      selectedDate: timelineToday,
      visibleMonth: "2026-05",
    });
  },

  saveSong: ({ songId, feelings, note }) => {
    const song = songById(get().songs, songId);
    if (!song) return;
    const id = crypto.randomUUID();
    const entry: Entry = {
      id,
      kind: "song",
      title: song.title,
      artist: song.artist,
      art: song.art,
      feelings,
      note,
      createdAt: new Date().toISOString(),
      week: get().user.week,
    };
    const timeline: TimelineEntry = {
      id,
      date: timelineToday,
      time: clockNow(),
      kind: "song",
      title: songId === "breathe" ? "Breathe (2 AM)" : song.title,
      artist: song.artist,
      art: song.art,
      songId,
      feelings,
      note,
      durationSec: songId === "breathe" ? 246 : undefined,
      week: get().user.week,
    };
    set({
      entries: [entry, ...get().entries],
      timelineEntries: pushTimeline(get().timelineEntries, enrichTimeline([timeline], get().contributors)[0]),
      selectedDate: timelineToday,
      visibleMonth: "2026-05",
    });
  },

  inviteMember: ({ name, relationship, contact }) => {
    const contributor: Contributor = {
      id: crypto.randomUUID(),
      name: name.trim() || contact,
      relationship,
      status: "invited",
      totalCount: 0,
      notes: [],
    };
    set({ contributors: [contributor, ...get().contributors] });
  },

  addEchoesToWeek: (contributorId, noteIds, feelings, note) => {
    const { contributors, entries, user, timelineEntries } = get();
    const contributor = contributors.find((item) => item.id === contributorId);
    if (!contributor) return;
    const chosen = new Set(noteIds);
    const selected = contributor.notes.filter((item) => chosen.has(item.id) && !item.inArchive);
    if (selected.length === 0) return;
    const entry: Entry = {
      id: crypto.randomUUID(),
      kind: "echo",
      title: `${contributor.name}'s voice notes`,
      feelings,
      note,
      durationSec: selected.reduce((sum, item) => sum + item.durationSec, 0),
      contributorId,
      noteIds: selected.map((item) => item.id),
      createdAt: new Date().toISOString(),
      week: user.week,
    };
    const time = clockNow();
    const timeline = selected.map((item, index) => ({
      id: `${entry.id}-${item.id}`,
      date: timelineToday,
      time: index === 0 ? time : time,
      kind: "echo" as const,
      title: item.title,
      contributorId,
      feelings,
      note,
      durationSec: item.durationSec,
      week: user.week,
    }));
    set({
      entries: [entry, ...entries],
      timelineEntries: pushTimeline(timelineEntries, timeline),
      selectedDate: timelineToday,
      visibleMonth: "2026-05",
      contributors: contributors.map((item) =>
        item.id === contributorId
          ? {
              ...item,
              notes: item.notes.map((voiceNote) =>
                chosen.has(voiceNote.id) ? { ...voiceNote, inArchive: true, seen: true } : voiceNote,
              ),
            }
          : item,
      ),
    });
  },

  addEchoesToArchive: (contributorId, echoIds) => {
    const { contributors, entries, user, timelineEntries } = get();
    const contributor = contributors.find((item) => item.id === contributorId);
    if (!contributor) return;
    const chosen = new Set(echoIds);
    const selected = contributor.notes.filter((note) => chosen.has(note.id) && !note.inArchive);
    const added: Entry[] = selected.map((note) => ({
      id: crypto.randomUUID(),
      kind: "echo" as const,
      title: note.title,
      feelings: [],
      durationSec: note.durationSec,
      contributorId,
      createdAt: new Date().toISOString(),
      week: user.week,
    }));
    const time = clockNow();
    const timeline = selected.map((note, index) => ({
      id: added[index]?.id ?? `${note.id}-timeline`,
      date: timelineToday,
      time,
      kind: "echo" as const,
      title: note.title,
      contributorId,
      feelings: ["loved"],
      durationSec: note.durationSec,
      week: user.week,
    }));
    set({
      entries: [...added, ...entries],
      timelineEntries: pushTimeline(timelineEntries, timeline),
      selectedDate: timelineToday,
      visibleMonth: "2026-05",
      contributors: contributors.map((item) =>
        item.id === contributorId
          ? {
              ...item,
              notes: item.notes.map((note) => (chosen.has(note.id) ? { ...note, inArchive: true, seen: true } : note)),
            }
          : item,
      ),
    });
  },

  renameEcho: (contributorId, echoId, title) => {
    const person = get().contributors.find((item) => item.id === contributorId);
    const previous = person?.notes.find((note) => note.id === echoId)?.title;
    const next = title.trim() || previous || "Voice note";
    set({
      contributors: get().contributors.map((item) =>
        item.id === contributorId
          ? { ...item, notes: item.notes.map((note) => (note.id === echoId ? { ...note, title: next } : note)) }
          : item,
      ),
      timelineEntries: get().timelineEntries.map((entry) => {
        if (entry.kind !== "echo" || entry.contributorId !== contributorId) return entry;
        if (previous && entry.title === previous) return { ...entry, title: next };
        if (entry.id.endsWith(`-${echoId}`)) return { ...entry, title: next };
        return entry;
      }),
    });
  },

  removeEcho: (contributorId, echoId) => {
    set({
      contributors: get().contributors.map((item) => {
        if (item.id !== contributorId) return item;
        const notes = item.notes.filter((note) => note.id !== echoId);
        return {
          ...item,
          notes,
          totalCount: Math.max(0, item.totalCount - (notes.length === item.notes.length ? 0 : 1)),
        };
      }),
    });
  },

  markSeen: (contributorId) => {
    set({
      contributors: get().contributors.map((item) =>
        item.id === contributorId
          ? { ...item, notes: item.notes.map((note) => ({ ...note, seen: true })) }
          : item,
      ),
    });
  },

  renameMoment: (id, title) => {
    const next = title.trim();
    if (!next) return;
    set({
      timelineEntries: patchMoment(get().timelineEntries, id, { title: next }),
      entries: get().entries.map((entry) => (entry.id === id ? { ...entry, title: next } : entry)),
    });
  },

  editMomentFeelings: (id, feelings) => {
    set({
      timelineEntries: patchMoment(get().timelineEntries, id, { feelings }),
      entries: get().entries.map((entry) => (entry.id === id ? { ...entry, feelings } : entry)),
    });
  },

  deleteMoment: (id) => {
    const { timelineEntries, entries, nowPlaying } = get();
    set({
      timelineEntries: timelineEntries.filter((entry) => entry.id !== id && !entry.id.startsWith(`${id}-`)),
      entries: entries.filter((entry) => entry.id !== id),
      ...(nowPlaying.id === id
        ? { playing: false, elapsedSec: 0 }
        : {}),
    });
  },

  setArchiveSegment: (segment) => set({ archiveSegment: segment }),

  pushArchive: (screen) => set({ archiveScreen: screen }),

  popArchive: () => set({ archiveScreen: { name: "home" } }),

  resetArchiveScreen: () => set({ archiveScreen: { name: "home" } }),

  openArchiveFeeling: (feelings, title) =>
    set({
      requestTab: "archive",
      archiveScreen: { name: "feeling", feelings, title },
      archiveSegment: "feelings",
    }),

  openTimelineWeek: (week) => {
    const start = weekStartDate(week);
    set({
      requestTab: "timeline",
      selectedDate: start > timelineToday ? timelineToday : start,
      visibleMonth: start.slice(0, 7),
      archiveScreen: { name: "home" },
    });
  },

  openEchoInvite: () => set({ echoLaunch: { mode: "invite" }, sheet: "echo", songDraftId: null }),

  openEchoAddNote: (contributorId, noteId) =>
    set({ echoLaunch: { mode: "addNote", contributorId, noteId }, sheet: "echo", songDraftId: null }),

  clearEchoLaunch: () => set({ echoLaunch: null }),

  clearRequestTab: () => set({ requestTab: null }),

  openSheet: (sheet) => set({ sheet, songDraftId: null, echoLaunch: null }),
  openSongDetails: (songId) => set({ sheet: "song", songDraftId: songId, echoLaunch: null }),
  closeSheet: () => set({ sheet: null, songDraftId: null, echoLaunch: null }),
}));

export function selectNowPlaying(state: ArchiveState) {
  return state.nowPlaying;
}

export function selectCurrentTrack(state: ArchiveState) {
  const songId = state.nowPlaying.songId;
  if (songId) return songById(state.songs, songId) ?? state.songs[0];
  return songById(state.songs, "let-it-happen") ?? state.songs[0];
}

export function selectIsPlayingId(
  state: ArchiveState,
  target: { id?: string; songId?: string; kind?: NowPlayingItem["kind"] },
) {
  return state.playing && isSameNowPlaying(state.nowPlaying, target);
}

/** Stable song refs only — derive display titles in the component with useMemo. */
export function selectRecentlyPlayed(state: ArchiveState) {
  return state.recentlyPlayedIds
    .map((id) => songById(state.songs, id))
    .filter((song): song is Song => Boolean(song));
}

export function entriesByDate(entries: TimelineEntry[], date: string) {
  return entries
    .filter((entry) => entry.date === date)
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function monthDots(entries: TimelineEntry[], year: number, month: number) {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const dots: Record<number, TimelineEntry["kind"][]> = {};
  for (const entry of entries) {
    if (!entry.date.startsWith(`${monthKey}-`)) continue;
    const day = Number(entry.date.slice(-2));
    const kinds = dots[day] ?? [];
    if (kinds.length >= 3) continue;
    dots[day] = [...kinds, entry.kind];
  }
  return dots;
}

export function heavyRotations(songs: Song[]) {
  return heavyPlays.flatMap(({ id, plays }) => {
    const song = songById(songs, id);
    if (!song) return [];
    return [
      {
        song,
        plays,
        title: id === "breathe" ? "Breathe (2 AM)" : song.title,
      },
    ];
  });
}

export function wrappedStats(songs: Song[], contributors: Contributor[]) {
  const topSong = songById(songs, "breathe-deeper") ?? songs[0];
  const order = ["mom", "grandma", "seema", "jake"] as const;
  const people = order.map((id) => {
    const person = contributors.find((item) => item.id === id);
    return {
      id,
      name: person?.name ?? id,
      count: person?.totalCount ?? 0,
    };
  });
  const total = people.reduce((sum, person) => sum + person.count, 0);
  const top = [...people].sort((a, b) => b.count - a.count)[0] ?? people[0];

  return {
    mood: "Anxious",
    activeHour: "3am",
    topSong,
    songMoments: 68,
    echoes: {
      total: total || 38,
      people,
      top,
    },
    journeyFrom: "Restless",
    journeyTo: "Grounding",
  };
}

const trimesterNames = ["First", "Second", "Third"];

export function trimesterName(trimester: number) {
  return trimesterNames[trimester - 1] ?? "Second";
}

export function currentArchiveWeek() {
  return ARCHIVE_CURRENT_WEEK;
}

export function playlistIdIsValid(id: string): id is PlaylistId {
  return id === "second-trimester" || id === "first-trimester" || id === "3am" || id === "bonding";
}

export { weekFromDate };
