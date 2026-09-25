import { songDurationSec, formatDuration, contributorInitial } from "./archiveHelpers";
import type { Contributor, ContributorNote, Song, TimelineEntry } from "./types";

export type NowPlayingKind = "song" | "voice" | "echo";

export type NowPlayingItem = {
  id: string;
  kind: NowPlayingKind;
  title: string;
  subtitle: string;
  durationSec: number;
  songId?: string;
  art?: string;
  gradient?: string;
  artist?: string;
  contributorId?: string;
  contributorName?: string;
  avatar?: string;
};

export function songDisplayTitle(song: Song | { id: string; title: string }) {
  return song.id === "breathe" ? "Breathe (2 AM)" : song.title;
}

export function fromSong(song: Song): NowPlayingItem {
  return {
    id: `song:${song.id}`,
    kind: "song",
    title: songDisplayTitle(song),
    subtitle: song.artist,
    durationSec: songDurationSec(song.id),
    songId: song.id,
    art: song.art,
    gradient: song.gradient,
    artist: song.artist,
  };
}

export function fromTimelineEntry(
  entry: TimelineEntry,
  songs: Song[],
  contributors: Contributor[],
): NowPlayingItem {
  if (entry.kind === "song") {
    const song = songs.find((item) => item.id === entry.songId);
    const title = entry.title || (song ? songDisplayTitle(song) : "Song");
    return {
      id: entry.id,
      kind: "song",
      title,
      subtitle: entry.artist ?? song?.artist ?? "",
      durationSec: entry.durationSec ?? (entry.songId ? songDurationSec(entry.songId) : 180),
      songId: entry.songId ?? song?.id,
      art: entry.art ?? song?.art,
      gradient: song?.gradient,
      artist: entry.artist ?? song?.artist,
    };
  }

  if (entry.kind === "voice") {
    const duration = entry.durationSec ?? 171;
    return {
      id: entry.id,
      kind: "voice",
      title: entry.title,
      subtitle: `Voice note · ${formatDuration(duration)}`,
      durationSec: duration,
    };
  }

  const person = contributors.find((item) => item.id === entry.contributorId);
  const name = person?.name ?? "Echo";
  const duration = entry.durationSec ?? 42;
  return {
    id: entry.id,
    kind: "echo",
    title: `${name}: ${entry.title}`,
    subtitle: `Echo · ${formatDuration(duration)}`,
    durationSec: duration,
    contributorId: entry.contributorId,
    contributorName: name,
    avatar: person?.avatar,
  };
}

export function fromContributorNote(contributor: Contributor, note: ContributorNote): NowPlayingItem {
  return {
    id: note.id,
    kind: "echo",
    title: `${contributor.name}: ${note.title}`,
    subtitle: `Echo · ${formatDuration(note.durationSec)}`,
    durationSec: note.durationSec,
    contributorId: contributor.id,
    contributorName: contributor.name,
    avatar: contributor.avatar,
  };
}

export function isSameNowPlaying(
  current: NowPlayingItem | null,
  target: { id?: string; songId?: string; kind?: NowPlayingKind },
) {
  if (!current) return false;
  if (current.kind === "song" && (target.kind === "song" || target.songId || target.id?.startsWith("song:"))) {
    const targetSongId = target.songId ?? target.id?.replace(/^song:/, "");
    return Boolean(targetSongId && current.songId === targetSongId);
  }
  return Boolean(target.id && current.id === target.id);
}

export function accentForKind(kind: NowPlayingKind) {
  if (kind === "song") return "var(--pink-500)";
  if (kind === "echo") return "var(--amber-500)";
  return "var(--purple-500)";
}

export function contributorAvatarLabel(name?: string) {
  return contributorInitial(name ? { name } : null);
}
