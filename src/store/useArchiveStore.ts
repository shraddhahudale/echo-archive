import { create } from "zustand";
import { contributors as seedContributors, playbackQueueIds, recentlyPlayedIds, songs as seedSongs, user as seedUser } from "../data/mock";
import type { Contributor, Entry, Song } from "../data/types";

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

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  user: seedUser,
  songs: seedSongs,
  recentlyPlayedIds,
  playbackQueueIds,
  currentTrackId: "chandaniya",
  playing: true,
  sheet: null,
  entries: [],
  contributors: seedContributors,
  nextVoiceNoteNumber: 8,
  songDraftId: null,

  togglePlay: () => set({ playing: !get().playing }),

  skipTrack: () => {
    const { playbackQueueIds: queue, currentTrackId } = get();
    const index = queue.indexOf(currentTrackId);
    const next = queue[(index + 1) % queue.length];
    set({ currentTrackId: next });
  },

  selectTrack: (id) => set({ currentTrackId: id, playing: true }),

  saveVoiceNote: ({ title, feelings, note, durationSec }) => {
    const { nextVoiceNoteNumber, user, entries } = get();
    const fallback = `Voice note #${String(nextVoiceNoteNumber).padStart(2, "0")}`;
    const entry: Entry = {
      id: crypto.randomUUID(),
      kind: "voice",
      title: title?.trim() || fallback,
      number: nextVoiceNoteNumber,
      feelings,
      note,
      durationSec,
      createdAt: new Date().toISOString(),
      week: user.week,
    };
    set({ entries: [entry, ...entries], nextVoiceNoteNumber: nextVoiceNoteNumber + 1 });
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
    set({ entries: [entry, ...get().entries] });
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
    const { contributors, entries, user } = get();
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
    set({
      entries: [entry, ...entries],
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
    const { contributors, entries, user } = get();
    const contributor = contributors.find((item) => item.id === contributorId);
    if (!contributor) return;
    const chosen = new Set(echoIds);
    const added: Entry[] = contributor.notes
      .filter((note) => chosen.has(note.id) && !note.inArchive)
      .map((note) => ({
        id: crypto.randomUUID(),
        kind: "echo" as const,
        title: note.title,
        feelings: [],
        durationSec: note.durationSec,
        contributorId,
        createdAt: new Date().toISOString(),
        week: user.week,
      }));
    set({
      entries: [...added, ...entries],
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
  closeSheet: () => set({ sheet: null }),
}));

export function selectCurrentTrack(state: ArchiveState) {
  return songById(state.songs, state.currentTrackId) ?? state.songs[0];
}

export function selectRecentlyPlayed(state: ArchiveState) {
  return state.recentlyPlayedIds
    .map((id) => songById(state.songs, id))
    .filter((song): song is Song => Boolean(song));
}

const trimesterNames = ["First", "Second", "Third"];

export function trimesterName(trimester: number) {
  return trimesterNames[trimester - 1] ?? "Second";
}
