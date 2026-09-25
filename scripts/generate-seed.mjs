/**
 * One-shot seed builder for Echo Archive.
 * Writes src/data/timeline.ts and prints contributor note blocks + validation.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const SONG_IDS = [
  "let-it-happen",
  "breathe-deeper",
  "chandaniya",
  "breathe",
  "yellow",
  "she-will-be-loved",
  "hotel-california",
  "holocene",
  "bohemian-rhapsody",
  "songs-about-jane",
  "here-comes-the-sun",
  "to-build-a-home",
  "lullabye",
  "baby-mine",
  "golden-slumbers",
  "stay-awake",
  "somewhere-over-the-rainbow",
  "hushabye-mountain",
  "blackbird",
  "brahms-lullaby",
  "re-stacks",
  "sunset-lover",
  "beautiful-boy",
  "sweet-pea",
  "photograph",
  "book-of-love",
  "home-edward-sharpe",
  "lovely-day",
  "put-your-records-on",
  "budapest",
  "mr-blue-sky",
  "bloom",
  "sea-of-love",
  "rivers-and-roads",
  "riptide",
  "youth",
  "the-night-we-met",
  "moon-river",
  "eventually",
  "lost-in-yesterday",
];

const SPECIAL_MAX4 = new Set(["breathe-deeper", "holocene", "breathe"]);

const VOICE_TITLES = [
  "Missing Home",
  "Her name",
  "Late night",
  "Lullabies",
  "Lullaby",
  "First flutter",
  "Scan day nerves",
  "Kitchen dancing",
  "Rain on the window",
  "Name ideas",
  "Hiccups!",
  "Walk by the harbour",
  "Sunday pancakes",
  "Letter to you, week 18",
  "Can't sleep again",
  "Bath time humming",
  "Reading you a story",
  "Nursery paint colours",
  "Dad's first hello",
  "Packing the hospital bag list",
  "Morning sickness tide",
  "Soft kicks at dawn",
  "Waiting room quiet",
  "Craving mango again",
  "Heartbeat on the monitor",
  "Talking to your bump",
  "Stretched and sore",
  "Night feed rehearsal",
  "Choosing the mobile",
  "Soft rain thoughts",
  "Almost cried at the ad",
  "Your little hiccup song",
  "Braxton flashes",
  "Playlist for labour",
  "Feeling you turn",
  "Empty nest of my own",
  "New shoes for later",
  "Whisper after the scan",
  "Counting the weeks",
  "Warm tea and worry",
  "Belly measuring day",
  "A note for Jake",
  "Quiet bus ride home",
  "Dream about the ocean",
  "Holding the onesie",
];

const ECHOES = {
  mom: [
    { title: "Good morning, little one", durationSec: 42 },
    { title: "When you were born", durationSec: 135 },
    { title: "Your nani's lullaby", durationSec: 68 },
    { title: "Sunday call", durationSec: 55 },
    { title: "Rest when you can", durationSec: 74 },
    { title: "The day I knew", durationSec: 98 },
    { title: "Eat something warm", durationSec: 46 },
    { title: "Your first blanket", durationSec: 81 },
    { title: "Call me anytime", durationSec: 52 },
    { title: "Strength you already have", durationSec: 88 },
    { title: "Stories from my pregnancy", durationSec: 112 },
    { title: "Soft advice at midnight", durationSec: 63 },
    { title: "Remember to breathe", durationSec: 49 },
    { title: "Grandma's chai recipe", durationSec: 95 },
    { title: "I'm so proud of you", durationSec: 71 },
  ],
  grandma: [
    { title: "A story from home", durationSec: 80 },
    { title: "The old song", durationSec: 62 },
    { title: "Sleep now", durationSec: 48 },
    { title: "For your mother", durationSec: 36 },
    { title: "Hands like yours", durationSec: 74 },
    { title: "Moonlight lullaby", durationSec: 91 },
    { title: "The mango tree story", durationSec: 118 },
    { title: "When rivers were quiet", durationSec: 67 },
    { title: "Blessing for the road", durationSec: 54 },
    { title: "Singing you to sleep", durationSec: 77 },
    { title: "Once upon a monsoon", durationSec: 104 },
    { title: "Keep this melody", durationSec: 58 },
  ],
  sophie: [
    { title: "A blessing", durationSec: 70 },
    { title: "Your name", durationSec: 40 },
    { title: "Recipe for later", durationSec: 95 },
    { title: "From the wedding", durationSec: 55 },
    { title: "Sleep, little one", durationSec: 62 },
    { title: "Don't take it too seriously", durationSec: 48 },
  ],
  jake: [
    { title: "Kick count", durationSec: 38 },
    { title: "On my way home", durationSec: 51 },
    { title: "The drive home", durationSec: 72 },
    { title: "Before you arrive", durationSec: 47 },
    { title: "A song for you", durationSec: 65 },
  ],
};

const ALL_FEELINGS = [
  "calm",
  "hopeful",
  "relentless",
  "anxious",
  "connected",
  "missing home",
  "tearful",
  "loved",
  "don't know why",
];

function weekFromDate(date) {
  const delta = Date.parse("2026-05-30") - Date.parse(date);
  return 22 - Math.floor(delta / (7 * 86400000));
}

function daysInWeek(week) {
  const today = Date.parse("2026-05-30T12:00:00Z");
  const end = today - (22 - week) * 7 * 86400000;
  const start = end - 6 * 86400000;
  const days = [];
  for (let t = start; t <= end; t += 86400000) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
}

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickTime(kind, preferLate, seed) {
  const slots = preferLate
    ? ["00:20", "01:10", "01:45", "02:30", "03:05", "03:40", "22:10", "22:45", "23:20", "23:55"]
    : kind === "echo"
      ? ["08:15", "09:05", "10:40", "14:15", "17:50", "18:35", "19:10", "19:40"]
      : ["07:15", "08:20", "09:12", "10:20", "11:00", "14:00", "16:10", "16:40", "18:00", "18:30", "19:40", "20:45", "21:25", "21:50", "22:00"];
  return slots[seed % slots.length];
}

function voiceDuration(title) {
  const s = hash(title);
  return 30 + (s % 151); // 0:30 to 3:00
}

// Week targets: T1 4-8, T2 10-16
const WEEK_TARGETS = {
  9: 5,
  10: 6,
  11: 7,
  12: 5,
  13: 8,
  14: 12,
  15: 14,
  16: 15,
  17: 13,
  18: 15,
  19: 16,
  20: 14,
  21: 15,
  22: 13,
};

// Fixed pins from plan-phase2
const PINS = [
  { date: "2026-05-06", time: "19:10", kind: "echo", contributorId: "grandma", title: "A story from home" },
  { date: "2026-05-10", time: "09:12", kind: "song", songId: "holocene" },
  { date: "2026-05-12", time: "10:40", kind: "echo", contributorId: "sophie", title: "Your name" },
  { date: "2026-05-15", time: "14:00", kind: "song", songId: "yellow" },
  { date: "2026-05-15", time: "18:30", kind: "song", songId: "breathe" },
  { date: "2026-05-17", time: "07:15", kind: "voice", title: "Missing Home" },
  { date: "2026-05-19", time: "17:50", kind: "echo", contributorId: "jake", title: "On my way home" },
  { date: "2026-05-20", time: "18:00", kind: "song", songId: "she-will-be-loved" },
  { date: "2026-05-20", time: "22:00", kind: "voice", title: "Late night" },
  { date: "2026-05-27", time: "08:15", kind: "echo", contributorId: "mom", title: "Good morning, little one" },
  { date: "2026-05-30", time: "16:40", kind: "song", songId: "let-it-happen" },
];

function feelingsFor(entry) {
  const week = weekFromDate(entry.date);
  const seed = hash(entry.id);
  let pool;
  if (entry.kind === "echo") {
    pool = ["loved", "connected", "hopeful", "calm"];
  } else if (week <= 16) {
    pool = ["anxious", "relentless", "tearful", "missing home", "don't know why", "anxious", "relentless"];
    if (seed % 5 === 0) pool = [...pool, "hopeful"];
  } else if (week <= 18) {
    pool = ["anxious", "hopeful", "connected", "relentless", "calm", "loved", "tearful"];
  } else {
    pool = ["calm", "hopeful", "connected", "loved", "hopeful", "calm"];
  }
  const count = 1 + (seed % 2);
  const chosen = [];
  let cursor = seed;
  for (let i = 0; i < pool.length * 2 && chosen.length < count; i++) {
    const f = pool[cursor % pool.length];
    if (!chosen.includes(f)) chosen.push(f);
    cursor = (Math.imul(cursor, 1103515245) + 12345) >>> 0;
  }
  return chosen;
}

// Build entries
const entries = [];
const usedEchoDays = new Set();
const songWeekUse = new Map(); // week -> Set(songId)
const songTotalUse = new Map();
const usedVoice = new Set();
const usedEchoTitles = new Set();

const echoQueue = {
  mom: [...ECHOES.mom],
  grandma: [...ECHOES.grandma],
  sophie: [...ECHOES.sophie],
  jake: [...ECHOES.jake],
};

function canUseSong(week, songId) {
  const max = SPECIAL_MAX4.has(songId) ? 4 : 3;
  if ((songTotalUse.get(songId) ?? 0) >= max) return false;
  const set = songWeekUse.get(week) ?? new Set();
  if (set.has(songId)) return false;
  return true;
}

function markSong(week, songId) {
  songTotalUse.set(songId, (songTotalUse.get(songId) ?? 0) + 1);
  if (!songWeekUse.has(week)) songWeekUse.set(week, new Set());
  songWeekUse.get(week).add(songId);
}

function addEntry(raw) {
  const week = weekFromDate(raw.date);
  let id;
  if (raw.kind === "song") id = `${raw.date}-${raw.time}-${raw.songId}`;
  else if (raw.kind === "voice") id = `${raw.date}-${raw.time}-voice`;
  else id = `${raw.date}-${raw.time}-echo`;

  const entry = { ...raw, id, week };
  if (raw.kind === "song") markSong(week, raw.songId);
  if (raw.kind === "voice") usedVoice.add(raw.title);
  if (raw.kind === "echo") {
    usedEchoDays.add(raw.date);
    usedEchoTitles.add(raw.title);
  }
  entries.push(entry);
}

// Place pins first
for (const pin of PINS) {
  addEntry({ ...pin });
  // Remove pinned echo from queue
  if (pin.kind === "echo") {
    const q = echoQueue[pin.contributorId];
    const idx = q.findIndex((n) => n.title === pin.title);
    if (idx >= 0) q.splice(idx, 1);
  }
}

// Schedule remaining echoes: ~1 in each T1 week, ~3–4 per T2 week, max 1/day, never consecutive if avoidable
function scheduleEchoes() {
  const remaining = [];
  for (const [id, notes] of Object.entries(echoQueue)) {
    for (const note of notes) remaining.push({ contributorId: id, ...note });
  }
  const order = [];
  const byPerson = { mom: [], grandma: [], sophie: [], jake: [] };
  for (const e of remaining) byPerson[e.contributorId].push(e);
  while (Object.values(byPerson).some((a) => a.length)) {
    for (const id of ["mom", "grandma", "sophie", "jake"]) {
      if (byPerson[id].length) order.push(byPerson[id].shift());
    }
  }

  // Budget per week (pinned echoes already count)
  const already = {};
  for (let w = 9; w <= 22; w++) already[w] = 0;
  for (const e of entries.filter((x) => x.kind === "echo")) already[e.week]++;

  const budget = {
    9: 1, 10: 1, 11: 1, 12: 1, 13: 1,
    14: 3, 15: 4, 16: 4, 17: 4, 18: 4,
    19: 3, 20: 3, 21: 3, 22: 2,
  };
  // 1*5 + 3+4+4+4+4+3+3+3+2 = 5+30 = 35, plus 4 pins already placed → adjust
  // Pins: May 6 (W19), May 12 (W20), May 19 (W21), May 27 (W22) = 4 already
  // Remaining to place: 34. Budgets above sum remaining capacity:
  const capacity = {};
  let capSum = 0;
  for (let w = 9; w <= 22; w++) {
    capacity[w] = Math.max(0, budget[w] - already[w]);
    capSum += capacity[w];
  }
  // Scale capacity if needed to fit order.length
  while (capSum < order.length) {
    for (let w = 14; w <= 22 && capSum < order.length; w++) {
      if (capacity[w] < 5) {
        capacity[w]++;
        capSum++;
      }
    }
  }

  const weekSlots = {};
  for (let w = 9; w <= 22; w++) {
    const days = daysInWeek(w).filter((d) => !usedEchoDays.has(d));
    // Prefer every other day for sparseness
    const spaced = days.filter((_, i) => i % 2 === 0);
    const pool = [...spaced, ...days.filter((d) => !spaced.includes(d))];
    weekSlots[w] = pool;
  }

  let wi = 0;
  const weeks = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  for (const note of order) {
    let placed = false;
    for (let attempt = 0; attempt < 40 && !placed; attempt++) {
      const w = weeks[(wi + attempt) % weeks.length];
      if (capacity[w] <= 0) continue;
      const date = weekSlots[w].shift();
      if (!date) continue;
      capacity[w]--;
      const seed = hash(note.title + date);
      addEntry({
        date,
        time: pickTime("echo", false, seed),
        kind: "echo",
        contributorId: note.contributorId,
        title: note.title,
        durationSec: note.durationSec,
      });
      placed = true;
      wi++;
    }
    if (!placed) {
      const free = weeks.flatMap((w) => daysInWeek(w)).find((d) => !usedEchoDays.has(d));
      if (!free) throw new Error("No echo day left for " + note.title);
      const seed = hash(note.title + free);
      addEntry({
        date: free,
        time: pickTime("echo", false, seed),
        kind: "echo",
        contributorId: note.contributorId,
        title: note.title,
        durationSec: note.durationSec,
      });
    }
  }
}

scheduleEchoes();

// Count current per week
function weekCounts() {
  const c = {};
  for (let w = 9; w <= 22; w++) c[w] = { total: 0, song: 0, voice: 0, echo: 0 };
  for (const e of entries) {
    const w = e.week;
    if (!c[w]) continue;
    c[w].total++;
    c[w][e.kind]++;
  }
  return c;
}

// Place T2 songs to reach exactly 68, and T1 songs ≥10 — leave room for ~40% voices
function placeSongs() {
  const lateSongs = [
    "breathe-deeper",
    "holocene",
    "breathe",
    "re-stacks",
    "to-build-a-home",
    "moon-river",
    "youth",
    "the-night-we-met",
    "sea-of-love",
    "bloom",
    "eventually",
    "lost-in-yesterday",
  ];

  function placeInWeek(week, count, preferLateFirst) {
    const days = daysInWeek(week);
    let placed = 0;
    let dayIdx = hash(`w${week}`) % days.length;
    const pool = [...SONG_IDS].sort((a, b) => (songTotalUse.get(a) ?? 0) - (songTotalUse.get(b) ?? 0));
    const ordered = preferLateFirst
      ? [...lateSongs.filter((id) => canUseSong(week, id)), ...pool.filter((id) => !lateSongs.includes(id))]
      : pool;

    while (placed < count) {
      let added = false;
      for (const songId of ordered) {
        if (placed >= count) break;
        if (!canUseSong(week, songId)) continue;
        for (let attempt = 0; attempt < days.length * 4; attempt++) {
          const date = days[(dayIdx + attempt) % days.length];
          const seed = hash(`${date}-${songId}-${placed}-${attempt}`);
          const preferLate = preferLateFirst || week <= 16 || seed % 3 === 0;
          let time = pickTime("song", preferLate, seed);
          if (entries.some((e) => e.date === date && e.time === time)) {
            const alt = ["00:35", "01:25", "02:05", "02:50", "03:20", "11:35", "15:10", "17:05", "20:15", "21:05"];
            time = alt[(seed + attempt) % alt.length];
            if (entries.some((e) => e.date === date && e.time === time)) continue;
          }
          addEntry({ date, time, kind: "song", songId });
          placed++;
          dayIdx++;
          added = true;
          break;
        }
      }
      if (!added) break;
    }
    return placed;
  }

  const counts = weekCounts();
  const t2Weeks = [14, 15, 16, 17, 18, 19, 20, 21, 22];
  const t2Needed = 68 - entries.filter((e) => e.kind === "song" && e.week >= 14 && e.week <= 22).length;

  // Aim ~45% songs of target, but never exceed (target - echoes - minVoices)
  // minVoices ≈ 35% of target for T2 mix
  const songPlan = {};
  let planSum = 0;
  for (const w of t2Weeks) {
    const echoes = counts[w].echo;
    const minVoice = Math.max(2, Math.round(WEEK_TARGETS[w] * 0.35));
    const maxSongs = Math.max(0, WEEK_TARGETS[w] - echoes - minVoice);
    const ideal = Math.min(maxSongs, Math.round(WEEK_TARGETS[w] * 0.45) - counts[w].song);
    songPlan[w] = Math.max(0, ideal);
    planSum += songPlan[w];
  }

  // Adjust to exact t2Needed
  const keys = [...t2Weeks];
  let i = 0;
  while (planSum < t2Needed && i < 800) {
    const w = keys[i % keys.length];
    const echoes = weekCounts()[w].echo;
    const minVoice = Math.max(1, Math.round(WEEK_TARGETS[w] * 0.25));
    const maxSongs = WEEK_TARGETS[w] - echoes - minVoice + 2; // slight flex
    if (songPlan[w] + counts[w].song < maxSongs) {
      songPlan[w]++;
      planSum++;
    }
    i++;
  }
  i = 0;
  while (planSum > t2Needed && i < 800) {
    const w = keys.find((k) => songPlan[k] > 0) ?? keys[0];
    if (songPlan[w] > 0) {
      songPlan[w]--;
      planSum--;
    }
    i++;
  }

  for (const w of t2Weeks) {
    placeInWeek(w, songPlan[w], true);
  }

  let t2Songs = entries.filter((e) => e.kind === "song" && e.week >= 14).length;
  let guard = 0;
  while (t2Songs < 68 && guard < 300) {
    for (const w of t2Weeks) {
      if (t2Songs >= 68) break;
      const n = placeInWeek(w, 1, true);
      t2Songs += n;
      if (n === 0) continue;
    }
    guard++;
  }

  let t1Songs = entries.filter((e) => e.kind === "song" && e.week <= 13).length;
  for (const w of [9, 10, 11, 12, 13]) {
    if (t1Songs >= 10) break;
    const need = Math.min(2, 10 - t1Songs);
    const room = WEEK_TARGETS[w] - weekCounts()[w].total;
    t1Songs += placeInWeek(w, Math.min(need, Math.max(0, room - 1)), false);
  }
  guard = 0;
  while (t1Songs < 10 && guard < 50) {
    for (const w of [9, 10, 11, 12, 13]) {
      if (t1Songs >= 10) break;
      t1Songs += placeInWeek(w, 1, false);
    }
    guard++;
  }
}

placeSongs();

// Place voices to fill week targets and use ~45 unique titles
function placeVoices() {
  const titles = VOICE_TITLES.filter((t) => !usedVoice.has(t));
  let titleIdx = 0;

  // Ensure pinned titles already used
  function nextTitle() {
    if (titleIdx >= titles.length) {
      // should not happen if we have 45 and need ~45
      return `Moment ${titleIdx++}`;
    }
    return titles[titleIdx++];
  }

  for (let w = 9; w <= 22; w++) {
    const counts = weekCounts();
    let need = WEEK_TARGETS[w] - counts[w].total;
    // If over, skip; if under, add voices
    const days = daysInWeek(w);
    let dayIdx = 0;
    while (need > 0 && titleIdx < titles.length) {
      const date = days[dayIdx % days.length];
      dayIdx++;
      const title = nextTitle();
      const seed = hash(`${date}-${title}`);
      let time = pickTime("voice", w <= 16 || seed % 2 === 0, seed);
      if (entries.some((e) => e.date === date && e.time === time)) {
        time = ["07:40", "08:55", "12:10", "15:30", "19:25", "21:40", "23:05"][seed % 7];
        if (entries.some((e) => e.date === date && e.time === time)) continue;
      }
      addEntry({
        date,
        time,
        kind: "voice",
        title,
        durationSec: voiceDuration(title),
      });
      need--;
    }
  }

  // Use remaining voice titles by adding to weeks that can take more (T2 up to 16)
  for (let w = 14; w <= 22 && titleIdx < titles.length; w++) {
    const counts = weekCounts();
    while (titleIdx < titles.length && counts[w].total < 16) {
      const days = daysInWeek(w);
      const title = nextTitle();
      const seed = hash(`extra-${title}`);
      const date = days[seed % days.length];
      let time = pickTime("voice", true, seed);
      if (entries.some((e) => e.date === date && e.time === time)) {
        time = `0${seed % 3}:${String(10 + (seed % 40)).padStart(2, "0")}`.replace(/^0(\\d):/, "0$1:");
        if (time.length === 4) time = "0" + time;
        // simplify
        time = ["00:48", "01:55", "02:18", "03:33"][seed % 4];
        if (entries.some((e) => e.date === date && e.time === time)) break;
      }
      addEntry({ date, time, kind: "voice", title, durationSec: voiceDuration(title) });
      counts[w].total++;
    }
  }
}

placeVoices();

// Assign feelings and ensure each feeling ≥5
function assignFeelings() {
  const feelingCounts = Object.fromEntries(ALL_FEELINGS.map((f) => [f, 0]));
  for (const e of entries) {
    e.feelings = feelingsFor(e);
    for (const f of e.feelings) feelingCounts[f]++;
  }
  // Backfill underused feelings
  for (const feeling of ALL_FEELINGS) {
    while (feelingCounts[feeling] < 5) {
      // find entry that can take it
      const candidates = entries.filter((e) => {
        if (e.feelings.includes(feeling)) return false;
        if (e.feelings.length >= 2) return false;
        const w = e.week;
        if (["anxious", "relentless", "tearful", "missing home", "don't know why"].includes(feeling) && w >= 19) return false;
        if (["calm", "hopeful", "connected", "loved"].includes(feeling) && w <= 12 && e.kind !== "echo") return false;
        return true;
      });
      const pick = candidates[feelingCounts[feeling] % Math.max(1, candidates.length)] ?? entries.find((e) => !e.feelings.includes(feeling));
      if (!pick) break;
      pick.feelings.push(feeling);
      feelingCounts[feeling]++;
    }
  }
  return feelingCounts;
}

const feelingCounts = assignFeelings();

// Add durationSec for voices missing it
for (const e of entries) {
  if (e.kind === "voice" && !e.durationSec) e.durationSec = voiceDuration(e.title);
  if (e.kind === "echo" && !e.durationSec) {
    const note = ECHOES[e.contributorId]?.find((n) => n.title === e.title);
    e.durationSec = note?.durationSec ?? 45;
  }
}

// Validation
function validate() {
  const errors = [];
  const t2Songs = entries.filter((e) => e.kind === "song" && e.week >= 14 && e.week <= 22);
  const t2Echoes = entries.filter((e) => e.kind === "echo" && e.week >= 14 && e.week <= 22);
  const allEchoes = entries.filter((e) => e.kind === "echo");
  const voices = entries.filter((e) => e.kind === "voice");
  const t1Songs = entries.filter((e) => e.kind === "song" && e.week <= 13);

  if (t2Songs.length !== 68) errors.push(`T2 songs ${t2Songs.length} !== 68`);
  // Echoes total 38 (all)
  if (allEchoes.length !== 38) errors.push(`Echoes ${allEchoes.length} !== 38`);

  const byPerson = { mom: 0, grandma: 0, sophie: 0, jake: 0 };
  for (const e of allEchoes) byPerson[e.contributorId]++;
  if (byPerson.mom !== 15) errors.push(`Mom ${byPerson.mom}`);
  if (byPerson.grandma !== 12) errors.push(`Grandma ${byPerson.grandma}`);
  if (byPerson.sophie !== 6) errors.push(`Sophie ${byPerson.sophie}`);
  if (byPerson.jake !== 5) errors.push(`Jake ${byPerson.jake}`);

  // unique voice titles
  const vt = voices.map((v) => v.title);
  if (new Set(vt).size !== vt.length) errors.push("Duplicate voice titles");
  const et = allEchoes.map((e) => e.title);
  if (new Set(et).size !== et.length) errors.push("Duplicate echo titles");

  // song once per week, max 3/4
  const perWeek = new Map();
  const totals = new Map();
  for (const e of entries.filter((x) => x.kind === "song")) {
    const key = `${e.week}:${e.songId}`;
    if (perWeek.has(key)) errors.push(`Song twice in week ${key}`);
    perWeek.set(key, true);
    totals.set(e.songId, (totals.get(e.songId) ?? 0) + 1);
  }
  for (const [id, n] of totals) {
    const max = SPECIAL_MAX4.has(id) ? 4 : 3;
    if (n > max) errors.push(`${id} used ${n}>${max}`);
  }

  // echo max 1 per day
  const echoDays = allEchoes.map((e) => e.date);
  if (new Set(echoDays).size !== echoDays.length) errors.push("Echo more than once on a day");

  // week counts
  const wc = weekCounts();
  for (let w = 9; w <= 13; w++) {
    if (wc[w].total < 4 || wc[w].total > 8) errors.push(`T1 W${w} count ${wc[w].total}`);
  }
  for (let w = 14; w <= 22; w++) {
    if (wc[w].total < 10 || wc[w].total > 16) errors.push(`T2 W${w} count ${wc[w].total}`);
  }

  // pins
  for (const pin of PINS) {
    const found = entries.find(
      (e) =>
        e.date === pin.date &&
        e.time === pin.time &&
        e.kind === pin.kind &&
        (pin.songId ? e.songId === pin.songId : true) &&
        (pin.title ? e.title === pin.title : true),
    );
    if (!found) errors.push(`Missing pin ${pin.date} ${pin.time} ${pin.kind}`);
  }

  // 3am ≥8
  const am3 = entries.filter((e) => {
    if (e.kind !== "song") return false;
    const h = Number(e.time.slice(0, 2));
    return h >= 0 && h < 4;
  });
  if (am3.length < 8) errors.push(`3am songs ${am3.length} < 8`);

  // First trimester ≥10
  if (t1Songs.length < 10) errors.push(`T1 songs ${t1Songs.length} < 10`);

  // Bonding ≥8
  const bonding = entries.filter((e) => {
    if (e.kind !== "song" && e.kind !== "echo") return false;
    return e.feelings.includes("connected") || e.feelings.includes("loved");
  });
  if (bonding.length < 8) errors.push(`Bonding ${bonding.length} < 8`);

  for (const f of ALL_FEELINGS) {
    if (feelingCounts[f] < 5) errors.push(`Feeling ${f} = ${feelingCounts[f]}`);
  }

  // duplicate ids
  const ids = entries.map((e) => e.id);
  if (new Set(ids).size !== ids.length) errors.push("Duplicate ids");

  return { errors, wc, t2Songs: t2Songs.length, voices: voices.length, am3: am3.length, t1Songs: t1Songs.length, bonding: bonding.length, byPerson, feelingCounts, totals: Object.fromEntries(totals) };
}

const report = validate();
console.log(JSON.stringify(report, null, 2));

if (report.errors.length) {
  console.error("VALIDATION FAILED");
  process.exit(1);
}

// Sort entries
entries.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

function emitEntry(e) {
  const feelings = JSON.stringify(e.feelings);
  if (e.kind === "song") {
    return `  song(${JSON.stringify(e.date)}, ${JSON.stringify(e.time)}, ${JSON.stringify(e.songId)}, ${feelings}),`;
  }
  if (e.kind === "voice") {
    return `  voice(${JSON.stringify(e.date)}, ${JSON.stringify(e.time)}, ${JSON.stringify(e.title)}, ${e.durationSec}, ${feelings}),`;
  }
  return `  echo(${JSON.stringify(e.date)}, ${JSON.stringify(e.time)}, ${JSON.stringify(e.contributorId)}, ${JSON.stringify(e.title)}, ${e.durationSec}, ${feelings}),`;
}

const timelineTs = `import type { TimelineEntry } from "./types";
import { songs } from "./mock";

export const timelineToday = "2026-05-30";
export const timelineFirstMonth = "2026-02";
export const timelineLastMonth = "2026-05";

const songById = new Map(songs.map((song) => [song.id, song]));

function song(date: string, time: string, songId: string, feelings?: string[]): TimelineEntry {
  const track = songById.get(songId);
  if (!track) throw new Error(\`Missing song \${songId}\`);
  return {
    id: \`\${date}-\${time}-\${songId}\`,
    date,
    time,
    kind: "song",
    title: songId === "breathe" ? "Breathe (2 AM)" : track.title,
    artist: track.artist,
    art: track.art,
    songId,
    feelings,
  };
}

function voice(date: string, time: string, title: string, durationSec: number, feelings?: string[]): TimelineEntry {
  return { id: \`\${date}-\${time}-voice\`, date, time, kind: "voice", title, durationSec, feelings };
}

function echo(
  date: string,
  time: string,
  contributorId: string,
  title: string,
  durationSec: number,
  feelings?: string[],
): TimelineEntry {
  return { id: \`\${date}-\${time}-echo\`, date, time, kind: "echo", title, contributorId, durationSec, feelings };
}

export const timelineEntries: TimelineEntry[] = [
${entries.map(emitEntry).join("\n")}
];
`;

fs.writeFileSync(path.join(root, "src/data/timeline.ts"), timelineTs);
console.log("Wrote timeline.ts with", entries.length, "entries");

// Emit contributor notes JSON for manual merge
const contrib = {};
for (const [id, notes] of Object.entries(ECHOES)) {
  const placed = entries.filter((e) => e.kind === "echo" && e.contributorId === id);
  contrib[id] = placed
    .slice()
    .sort((a, b) => b.week - a.week)
    .map((e) => ({
      title: e.title,
      durationSec: e.durationSec,
      week: e.week,
      inArchive: e.week <= 16,
    }));
}
fs.writeFileSync(path.join(root, "scripts/echo-notes.json"), JSON.stringify(contrib, null, 2));
console.log("Wrote echo-notes.json");
