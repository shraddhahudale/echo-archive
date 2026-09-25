import { songs } from "./mock";
import type { Contributor, TimelineEntry } from "./types";

export const ARCHIVE_TODAY = "2026-05-30";
export const ARCHIVE_CURRENT_WEEK = 22;

export const ALL_FEELINGS = [
  "calm",
  "hopeful",
  "relentless",
  "anxious",
  "connected",
  "missing home",
  "tearful",
  "loved",
  "don't know why",
] as const;

export type ArchiveFeeling = (typeof ALL_FEELINGS)[number];

export type ArchiveFilter = {
  type: "all" | TimelineEntry["kind"];
  feelings: string[];
};

export type PlaylistId = "second-trimester" | "first-trimester" | "3am" | "bonding";

export type PlaylistDef = {
  id: PlaylistId;
  name: string;
};

export const PLAYLISTS: PlaylistDef[] = [
  { id: "second-trimester", name: "Second Trimester" },
  { id: "first-trimester", name: "First Trimester" },
  { id: "3am", name: "3am Sessions" },
  { id: "bonding", name: "Bonding with Baby" },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const songDuration: Record<string, number> = {
  "let-it-happen": 467,
  "breathe-deeper": 255,
  holocene: 337,
  breathe: 246,
  yellow: 269,
  "she-will-be-loved": 257,
  "hotel-california": 391,
  "songs-about-jane": 210,
  "bohemian-rhapsody": 354,
  chandaniya: 280,
  bloom: 215,
  "sea-of-love": 195,
  "rivers-and-roads": 268,
  riptide: 204,
  youth: 247,
  "the-night-we-met": 208,
  "moon-river": 166,
  eventually: 318,
  "lost-in-yesterday": 248,
  "golden-slumbers": 91,
  "stay-awake": 103,
  "somewhere-over-the-rainbow": 213,
  "hushabye-mountain": 150,
  blackbird: 138,
  "brahms-lullaby": 180,
  "mr-blue-sky": 303,
};

export function songDurationSec(songId: string) {
  return songDuration[songId] ?? 180;
}

const earlyFeelings = ["anxious", "relentless", "tearful", "missing home", "don't know why"] as const;
const lateFeelings = ["calm", "hopeful", "connected", "loved"] as const;
const echoFeelings = ["loved", "connected", "hopeful", "calm"] as const;

export function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function weekFromDate(date: string) {
  const delta = Date.parse(ARCHIVE_TODAY) - Date.parse(date);
  return ARCHIVE_CURRENT_WEEK - Math.floor(delta / WEEK_MS);
}

export function weekStartDate(week: number) {
  const end = Date.parse(ARCHIVE_TODAY) - (ARCHIVE_CURRENT_WEEK - week) * WEEK_MS;
  const start = end - 6 * DAY_MS;
  return isoDate(start);
}

export function weekEndDate(week: number) {
  const end = Date.parse(ARCHIVE_TODAY) - (ARCHIVE_CURRENT_WEEK - week) * WEEK_MS;
  return isoDate(end);
}

function isoDate(ms: number) {
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatWeekRange(week: number) {
  return `${formatDayMonth(weekStartDate(week))} to ${formatDayMonth(weekEndDate(week))}`;
}

export function formatDayMonth(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export function formatDayLabel(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

export function formatDuration(sec: number) {
  const safe = Number.isFinite(sec) ? Math.max(0, Math.floor(sec)) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatTotalLength(sec: number) {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.round((sec % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
}

function pickFeelings(pool: readonly string[], count: number, seed: number) {
  const chosen: string[] = [];
  let cursor = seed >>> 0;
  const target = Math.min(Math.max(1, count), pool.length);
  for (let attempt = 0; attempt < pool.length * 3 && chosen.length < target; attempt += 1) {
    const index = cursor % pool.length;
    const feeling = pool[index];
    if (feeling && !chosen.includes(feeling)) chosen.push(feeling);
    cursor = (Math.imul(cursor, 1103515245) + 12345) >>> 0;
  }
  for (const feeling of pool) {
    if (chosen.length >= target) break;
    if (feeling && !chosen.includes(feeling)) chosen.push(feeling);
  }
  return chosen;
}

export function sanitizeFeelings(feelings: Array<string | null | undefined> | undefined) {
  return (feelings ?? []).filter((feeling): feeling is string => typeof feeling === "string" && feeling.length > 0);
}

export function contributorLabel(contributor?: { name?: string } | null) {
  const name = contributor?.name?.trim();
  return name || "Someone";
}

export function contributorInitial(contributor?: { name?: string } | null) {
  const name = contributor?.name?.trim();
  if (!name) return "?";
  // Prefer the given name so "Aunt Sophie" → S, not A.
  const parts = name.split(/\s+/);
  const pick = parts[parts.length - 1] ?? name;
  return pick.charAt(0).toUpperCase();
}

export function seedFeelingsFor(entry: Pick<TimelineEntry, "id" | "kind" | "date">): string[] {
  const seed = hashString(entry.id);
  const month = Number(entry.date.slice(5, 7));
  const late = month === 5 && Number(entry.date.slice(8, 10)) >= 20;
  const early = month <= 4;

  if (entry.kind === "echo") {
    return pickFeelings(echoFeelings, 1 + (seed % 2), seed);
  }

  if (late) {
    return pickFeelings(lateFeelings, 1 + (seed % 2), seed);
  }

  if (early) {
    const mix = seed % 5 === 0 ? [...earlyFeelings, "hopeful"] : earlyFeelings;
    return pickFeelings(mix, 1 + (seed % 2), seed);
  }

  // early May: transition
  const mid = ["anxious", "hopeful", "connected", "relentless", "calm", "loved"] as const;
  return pickFeelings(mid, 1 + (seed % 2), seed);
}

export function seedDurationFor(
  entry: Pick<TimelineEntry, "id" | "kind" | "songId" | "title" | "contributorId">,
  contributors: Contributor[],
) {
  if (entry.kind === "song") {
    return songDuration[entry.songId ?? ""] ?? 240;
  }
  if (entry.kind === "echo" && entry.contributorId) {
    const person = contributors.find((item) => item.id === entry.contributorId);
    const note = person?.notes.find((item) => item.title === entry.title);
    if (note) return note.durationSec;
  }
  const seed = hashString(entry.id);
  if (entry.kind === "echo") return 36 + (seed % 50);
  return 90 + (seed % 91);
}

export function enrichTimelineEntry(entry: TimelineEntry, contributors: Contributor[] = []): TimelineEntry {
  const existing = sanitizeFeelings(entry.feelings);
  return {
    ...entry,
    week: entry.week ?? weekFromDate(entry.date),
    feelings: existing.length > 0 ? existing : seedFeelingsFor(entry),
    durationSec: entry.durationSec ?? seedDurationFor(entry, contributors),
  };
}

export function enrichTimeline(entries: TimelineEntry[], contributors: Contributor[] = []) {
  return entries.map((entry) => enrichTimelineEntry(entry, contributors));
}

export function matchesFilter(entry: TimelineEntry, filter: ArchiveFilter) {
  if (filter.type !== "all" && entry.kind !== filter.type) return false;
  if (filter.feelings.length === 0) return true;
  const feelings = sanitizeFeelings(entry.feelings);
  return filter.feelings.every((feeling) => feelings.includes(feeling));
}

export function filterEntries(entries: TimelineEntry[], filter: ArchiveFilter) {
  return entries.filter((entry) => matchesFilter(entry, filter));
}

export function entriesByWeek(entries: TimelineEntry[], week: number, filter?: ArchiveFilter) {
  const list = filter ? filterEntries(entries, filter) : entries;
  return list
    .filter((entry) => (entry.week ?? weekFromDate(entry.date)) === week)
    .slice()
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
}

export function weekSummaries(entries: TimelineEntry[], filter: ArchiveFilter) {
  const filtered = filterEntries(entries, filter);
  const map = new Map<number, TimelineEntry[]>();
  for (const entry of filtered) {
    const week = entry.week ?? weekFromDate(entry.date);
    const list = map.get(week) ?? [];
    list.push(entry);
    map.set(week, list);
  }
  return [...map.entries()]
    .map(([week, moments]) => {
      const kinds = new Set(moments.map((item) => item.kind));
      return {
        week,
        count: moments.length,
        kinds: (["voice", "song", "echo"] as const).filter((kind) => kinds.has(kind)),
        start: weekStartDate(week),
        end: weekEndDate(week),
        isCurrent: week === ARCHIVE_CURRENT_WEEK,
        trimester: week <= 13 ? 1 : week <= 27 ? 2 : 3,
      };
    })
    .sort((a, b) => b.week - a.week);
}

export function feelingSummaries(entries: TimelineEntry[], filter: ArchiveFilter) {
  const base = filter.type === "all" ? entries : entries.filter((entry) => entry.kind === filter.type);
  const counts = new Map<string, { count: number; kinds: Set<TimelineEntry["kind"]> }>();
  for (const entry of base) {
    for (const feeling of sanitizeFeelings(entry.feelings)) {
      if (filter.feelings.length > 0 && !filter.feelings.includes(feeling)) continue;
      const current = counts.get(feeling) ?? { count: 0, kinds: new Set() };
      current.count += 1;
      current.kinds.add(entry.kind);
      counts.set(feeling, current);
    }
  }
  return [...counts.entries()]
    .map(([feeling, value]) => ({
      feeling,
      count: value.count,
      kinds: (["voice", "song", "echo"] as const).filter((kind) => value.kinds.has(kind)),
    }))
    .sort((a, b) => b.count - a.count || a.feeling.localeCompare(b.feeling));
}

export function dominantFeeling(moments: TimelineEntry[]) {
  const counts = new Map<string, number>();
  for (const moment of moments) {
    for (const feeling of sanitizeFeelings(moment.feelings)) {
      counts.set(feeling, (counts.get(feeling) ?? 0) + 1);
    }
  }
  let best = "hopeful";
  let bestCount = 0;
  for (const [feeling, count] of counts) {
    if (count > bestCount) {
      best = feeling;
      bestCount = count;
    }
  }
  return best;
}

export function countByKind(moments: TimelineEntry[]) {
  return {
    voice: moments.filter((item) => item.kind === "voice").length,
    song: moments.filter((item) => item.kind === "song").length,
    echo: moments.filter((item) => item.kind === "echo").length,
  };
}

export function playlistTracks(entries: TimelineEntry[], id: PlaylistId) {
  if (id === "second-trimester") {
    const seen = new Set<string>();
    return entries.filter((entry) => {
      const week = entry.week ?? weekFromDate(entry.date);
      if (entry.kind !== "song" || week < 14 || week > 27) return false;
      const key = entry.songId ?? entry.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  if (id === "first-trimester") {
    return entries.filter((entry) => {
      const week = entry.week ?? weekFromDate(entry.date);
      return entry.kind === "song" && week >= 1 && week <= 13;
    });
  }
  if (id === "3am") {
    return entries.filter((entry) => {
      if (entry.kind !== "song") return false;
      const hour = Number((entry.time ?? "99:00").slice(0, 2));
      return Number.isFinite(hour) && hour >= 0 && hour < 4;
    });
  }
  return entries.filter((entry) => {
    if (entry.kind !== "song" && entry.kind !== "echo") return false;
    const feelings = sanitizeFeelings(entry.feelings);
    return feelings.includes("connected") || feelings.includes("loved");
  });
}

export function playlistArts(tracks: TimelineEntry[]) {
  const arts: string[] = [];
  for (const track of tracks) {
    const art =
      track.art ??
      (track.songId ? songs.find((song) => song.id === track.songId)?.art : undefined);
    if (art && !arts.includes(art)) arts.push(art);
    if (arts.length >= 2) break;
  }
  return arts;
}

export function recentMoments(entries: TimelineEntry[], limit = 8) {
  return entries
    .slice()
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
    .slice(0, limit);
}

export function searchArchive(
  entries: TimelineEntry[],
  contributors: Contributor[],
  query: string,
) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { voice: [], song: [], echo: [], people: [] as Contributor[] };
  }

  const voice: TimelineEntry[] = [];
  const song: TimelineEntry[] = [];
  const echo: TimelineEntry[] = [];

  for (const entry of entries) {
    const contributor = entry.contributorId
      ? contributors.find((item) => item.id === entry.contributorId)
      : undefined;
    const haystack = [
      contributor?.name ?? "",
      ...sanitizeFeelings(entry.feelings),
      entry.note ?? "",
      entry.artist ?? "",
      entry.title ?? "",
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) continue;
    if (entry.kind === "voice") voice.push(entry);
    else if (entry.kind === "song") song.push(entry);
    else echo.push(entry);
  }

  const people = contributors.filter((person) => {
    const haystack = `${person.name} ${person.relationship}`.toLowerCase();
    return haystack.includes(q);
  });

  return { voice, song, echo, people };
}

export function kindAccent(kind: TimelineEntry["kind"]) {
  if (kind === "song") {
    return {
      tint50: "var(--pink-50)",
      tint100: "var(--pink-50)",
      accent: "var(--pink-500)",
      tone: "song" as const,
    };
  }
  if (kind === "echo") {
    return {
      tint50: "var(--amber-50)",
      tint100: "var(--amber-100)",
      accent: "var(--amber-500)",
      tone: "echo" as const,
    };
  }
  return {
    tint50: "var(--purple-50)",
    tint100: "var(--purple-100)",
    accent: "var(--purple-500)",
    tone: "voice" as const,
  };
}

export const EDIT_FEELINGS = [
  "calm",
  "hopeful",
  "relentless",
  "anxious",
  "connected",
  "missing home",
  "tearful",
  "loved",
  "don't know why",
] as const;
