import { create } from "zustand";
import { contributors as seedContributors, playbackQueueIds, recentlyPlayedIds, songs as seedSongs, user as seedUser } from "../data/mock";
import type { Contributor, Entry, Relationship, Song } from "../data/types";

type VoiceNoteInput = {
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
  relationship: Relationship;
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
  togglePlay: () => void;
  skipTrack: () => void;
  selectTrack: (id: string) => void;
  saveVoiceNote: (input: VoiceNoteInput) => void;
  saveSong: (input: SongInput) => void;
  inviteMember: (input: InviteInput) => void;
  addEchoesToArchive: (contributorId: string, echoIds: string[]) => void;
  renameEcho: (contributorId: string, echoId: string, title: string) => void;
  removeEcho: (contributorId: string, echoId: string) => void;
  markSeen: (contributorId: string) => void;
  openSheet: (sheet: SheetId) => void;
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

  togglePlay: () => set({ playing: !get().playing }),

  skipTrack: () => {
    const { playbackQueueIds: queue, currentTrackId } = get();
    const index = queue.indexOf(currentTrackId);
    const next = queue[(index + 1) % queue.length];
    set({ currentTrackId: next });
  },

  selectTrack: (id) => set({ currentTrackId: id, playing: true }),

  saveVoiceNote: ({ feelings, note, durationSec }) => {
    const { nextVoiceNoteNumber, user, entries } = get();
    const entry: Entry = {
      id: crypto.randomUUID(),
      kind: "voice",
      title: `Voice note #${String(nextVoiceNoteNumber).padStart(2, "0")}`,
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
      name,
      relationship,
      contact,
      status: "pending",
      echoes: [],
    };
    set({ contributors: [...get().contributors, contributor] });
  },

  addEchoesToArchive: (contributorId, echoIds) => {
    const { contributors, entries, user } = get();
    const contributor = contributors.find((item) => item.id === contributorId);
    if (!contributor) return;
    const chosen = new Set(echoIds);
    const added: Entry[] = contributor.echoes
      .filter((echo) => chosen.has(echo.id) && !echo.addedToArchive)
      .map((echo) => ({
        id: crypto.randomUUID(),
        kind: "echo" as const,
        title: echo.title,
        artist: echo.artist,
        feelings: [],
        durationSec: echo.durationSec,
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
              echoes: item.echoes.map((echo) =>
                chosen.has(echo.id) ? { ...echo, addedToArchive: true, seen: true } : echo,
              ),
            }
          : item,
      ),
    });
  },

  renameEcho: (contributorId, echoId, title) => {
    set({
      contributors: get().contributors.map((item) =>
        item.id === contributorId
          ? {
              ...item,
              echoes: item.echoes.map((echo) => (echo.id === echoId ? { ...echo, title } : echo)),
            }
          : item,
      ),
    });
  },

  removeEcho: (contributorId, echoId) => {
    set({
      contributors: get().contributors.map((item) =>
        item.id === contributorId
          ? { ...item, echoes: item.echoes.filter((echo) => echo.id !== echoId) }
          : item,
      ),
    });
  },

  markSeen: (contributorId) => {
    set({
      contributors: get().contributors.map((item) =>
        item.id === contributorId
          ? { ...item, echoes: item.echoes.map((echo) => ({ ...echo, seen: true })) }
          : item,
      ),
    });
  },

  openSheet: (sheet) => set({ sheet }),
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
