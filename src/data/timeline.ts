import type { TimelineEntry } from "./types";
import { songs } from "./mock";

export const timelineToday = "2026-05-30";
export const timelineFirstMonth = "2026-03";
export const timelineLastMonth = "2026-05";

const songById = new Map(songs.map((song) => [song.id, song]));

function song(date: string, time: string, songId: string): TimelineEntry {
  const track = songById.get(songId);
  if (!track) throw new Error(`Missing song ${songId}`);
  return {
    id: `${date}-${time}-${songId}`,
    date,
    time,
    kind: "song",
    title: songId === "breathe" ? "Breathe (2 AM)" : track.title,
    artist: track.artist,
    art: track.art,
    songId,
  };
}

function voice(date: string, time: string, title: string): TimelineEntry {
  return { id: `${date}-${time}-voice`, date, time, kind: "voice", title };
}

function echo(date: string, time: string, contributorId: string, title: string): TimelineEntry {
  return { id: `${date}-${time}-echo`, date, time, kind: "echo", title, contributorId };
}

export const timelineEntries: TimelineEntry[] = [
  song("2026-03-02", "22:15", "hotel-california"),
  voice("2026-03-05", "03:10", "Lullaby"),
  echo("2026-03-08", "19:00", "grandma", "The old song"),
  song("2026-03-11", "10:20", "yellow"),
  voice("2026-03-11", "23:40", "Her name"),
  echo("2026-03-16", "14:15", "seema", "Recipe for later"),
  song("2026-03-19", "01:35", "breathe"),
  voice("2026-03-22", "02:20", "Lullabies"),
  echo("2026-03-24", "09:05", "mom", "Your nani's lullaby"),
  song("2026-03-27", "21:50", "holocene"),
  voice("2026-03-30", "18:30", "Missing Home"),

  song("2026-04-01", "20:40", "songs-about-jane"),
  voice("2026-04-02", "23:15", "Late night"),
  song("2026-04-04", "11:00", "bohemian-rhapsody"),
  voice("2026-04-04", "22:05", "Lullaby"),
  song("2026-04-06", "03:45", "chandaniya"),
  voice("2026-04-08", "01:25", "Her name"),
  echo("2026-04-10", "18:35", "grandma", "For your mother"),
  song("2026-04-12", "16:20", "yellow"),
  voice("2026-04-14", "07:50", "Lullabies"),
  song("2026-04-16", "02:55", "holocene"),
  voice("2026-04-16", "21:10", "Missing Home"),
  echo("2026-04-18", "10:05", "seema", "A blessing"),
  song("2026-04-20", "19:40", "she-will-be-loved"),
  voice("2026-04-22", "03:30", "Lullaby"),
  song("2026-04-24", "23:50", "hotel-california"),
  echo("2026-04-26", "17:15", "jake", "Kick count"),
  song("2026-04-28", "09:25", "breathe"),
  voice("2026-04-28", "22:20", "Her name"),
  song("2026-04-30", "01:10", "bohemian-rhapsody"),

  song("2026-05-01", "22:10", "hotel-california"),
  voice("2026-05-02", "03:20", "Her name"),
  song("2026-05-04", "09:05", "songs-about-jane"),
  voice("2026-05-04", "21:40", "Lullabies"),
  song("2026-05-05", "01:15", "bohemian-rhapsody"),
  echo("2026-05-06", "19:10", "grandma", "A story from home"),
  voice("2026-05-07", "02:45", "Lullaby"),
  song("2026-05-08", "18:30", "yellow"),
  song("2026-05-09", "11:20", "holocene"),
  voice("2026-05-09", "23:55", "Her name"),
  song("2026-05-10", "09:12", "holocene"),
  voice("2026-05-11", "03:05", "Lullabies"),
  echo("2026-05-12", "10:40", "seema", "Your name"),
  song("2026-05-13", "00:50", "breathe"),
  song("2026-05-15", "14:00", "yellow"),
  song("2026-05-15", "18:30", "breathe"),
  voice("2026-05-17", "07:15", "Missing Home"),
  song("2026-05-18", "21:25", "chandaniya"),
  echo("2026-05-19", "17:50", "jake", "On my way home"),
  song("2026-05-19", "23:15", "hotel-california"),
  song("2026-05-20", "18:00", "she-will-be-loved"),
  voice("2026-05-20", "22:00", "Late night"),
  song("2026-05-22", "02:30", "bohemian-rhapsody"),
  voice("2026-05-24", "08:20", "Lullaby"),
  song("2026-05-24", "20:45", "songs-about-jane"),
  song("2026-05-26", "03:40", "holocene"),
  echo("2026-05-27", "08:15", "mom", "Good morning, little one"),
  song("2026-05-28", "16:10", "she-will-be-loved"),
  voice("2026-05-28", "23:30", "Her name"),
  song("2026-05-30", "16:40", "chandaniya"),
];
