import { create } from "zustand";
import { contributors as seedContributors, playbackQueueIds, recentlyPlayedIds, songs as seedSongs, user as seedUser } from "../data/mock";
import { timelineEntries as seedTimeline, timelineToday } from "../data/timeline";
import type { Contributor, Entry, Song, TimelineEntry } from "../data/types";

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
  currentTrackId: string;
  playing: boolean;
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
  connectStone: () => void;
  selectDate: (date: string) => void;
  setVisibleMonth: (month: string) => void;
  openWrapped: () => void;
  closeWrapped: () => void;
  setWrappedIndex: (index: number) => void;
  togglePlay: () => void;
  skipTrack: () => void;
  selectTrack: (id: string) => void;
  saveVoiceNote: (input: VoiceNoteInput) => void;
  saveSong: (input: SongInput) => void;
  inviteMember: (input: InviteInput) => void;
  addEchoesToArchive: (contributorId: string, echoIds: string[]) => void;
  addEchoesToWeek: (contributorId: string, noteIds: string[], feelings: string[], note?: string) => void;
  renameEcho: (contributorId: string, echoId: string, title: string) => void;
  removeEcho: (contributorId: string, echoId: string) => void;
  markSeen: (contributorId: string) => void;
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

const heavyPlays = [
  { id: "breathe-deeper", plays: 44 },
  { id: "holocene", plays: 41 },
  { id: "breathe", plays: 36 },
] as const;

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  user: seedUser,
  songs: seedSongs,
  recentlyPlayedIds,
  playbackQueueIds,
  currentTrackId: "let-it-happen",
  playing: true,
  sheet: null,
  entries: [],
  contributors: seedContributors,
  nextVoiceNoteNumber: 8,
  songDraftId: null,
  stoneConnected: false,
  timelineEntries: seedTimeline,
  selectedDate: timelineToday,
  visibleMonth: "2026-05",
  wrappedOpen: false,
  wrappedIndex: 0,

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

  skipTrack: () => {
    const { playbackQueueIds: queue, currentTrackId } = get();
    const index = queue.indexOf(currentTrackId);
    const next = queue[(index + 1) % queue.length];
    set({ currentTrackId: next });
  },

  selectTrack: (id) => set({ currentTrackId: id, playing: true }),

  saveVoiceNote: ({ title, feelings, note, durationSec }) => {
    const { nextVoiceNoteNumber, user, entries, timelineEntries } = get();
    const fallback = `Voice note #${String(nextVoiceNoteNumber).padStart(2, "0")}`;
    const resolved = title?.trim() || fallback;
    const entry: Entry = {
      id: crypto.randomUUID(),
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
      id: entry.id,
      date: timelineToday,
      time: clockNow(),
      kind: "voice",
      title: resolved,
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
    const entry: Entry = {
      id: crypto.randomUUID(),
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
      id: entry.id,
      date: timelineToday,
      time: clockNow(),
      kind: "song",
      title: songId === "breathe" ? "Breathe (2 AM)" : song.title,
      artist: song.artist,
      art: song.art,
      songId,
    };
    set({
      entries: [entry, ...get().entries],
      timelineEntries: pushTimeline(get().timelineEntries, timeline),
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
    set({
      contributors: get().contributors.map((item) =>
        item.id === contributorId
          ? { ...item, notes: item.notes.map((note) => (note.id === echoId ? { ...note, title } : note)) }
          : item,
      ),
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

  openSheet: (sheet) => set({ sheet, songDraftId: null }),
  openSongDetails: (songId) => set({ sheet: "song", songDraftId: songId }),
  closeSheet: () => set({ sheet: null, songDraftId: null }),
}));

export function selectCurrentTrack(state: ArchiveState) {
  return songById(state.songs, state.currentTrackId) ?? state.songs[0];
}

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
