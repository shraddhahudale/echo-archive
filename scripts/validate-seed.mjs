import fs from "fs";

const timeline = fs.readFileSync("src/data/timeline.ts", "utf8");
const mock = fs.readFileSync("src/data/mock.ts", "utf8");

const songs = [...timeline.matchAll(/song\("([^"]+)", "([^"]+)", "([^"]+)"/g)].map((m) => ({
  date: m[1],
  time: m[2],
  songId: m[3],
  kind: "song",
}));
const voices = [...timeline.matchAll(/voice\("([^"]+)", "([^"]+)", "([^"]+)", (\d+)/g)].map((m) => ({
  date: m[1],
  time: m[2],
  title: m[3],
  duration: Number(m[4]),
  kind: "voice",
}));
const echoes = [...timeline.matchAll(/echo\("([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)", (\d+)/g)].map((m) => ({
  date: m[1],
  time: m[2],
  contributorId: m[3],
  title: m[4],
  duration: Number(m[5]),
  kind: "echo",
}));

function weekFromDate(date) {
  const delta = Date.parse("2026-05-30") - Date.parse(date);
  return 22 - Math.floor(delta / (7 * 86400000));
}

const all = [...songs, ...voices, ...echoes].map((e) => ({ ...e, week: weekFromDate(e.date) }));
const t2Songs = all.filter((e) => e.kind === "song" && e.week >= 14 && e.week <= 22);
const allEcho = all.filter((e) => e.kind === "echo");
const voiceTitles = voices.map((v) => v.title);
const echoTitles = echoes.map((e) => e.title);
const special = ["breathe-deeper", "holocene", "breathe"];

const errors = [];
if (t2Songs.length !== 68) errors.push(`T2 songs ${t2Songs.length}`);
if (allEcho.length !== 38) errors.push(`echoes ${allEcho.length}`);
if (new Set(voiceTitles).size !== voiceTitles.length) errors.push("dup voices");
if (new Set(echoTitles).size !== echoTitles.length) errors.push("dup echoes");

const byPerson = Object.fromEntries(
  ["mom", "grandma", "sophie", "jake"].map((id) => [id, allEcho.filter((e) => e.contributorId === id).length]),
);
if (byPerson.mom !== 15) errors.push("mom");
if (byPerson.grandma !== 12) errors.push("grandma");
if (byPerson.sophie !== 6) errors.push("sophie");
if (byPerson.jake !== 5) errors.push("jake");

const totals = {};
const weekSong = {};
for (const s of songs) {
  totals[s.songId] = (totals[s.songId] || 0) + 1;
  const k = `${weekFromDate(s.date)}:${s.songId}`;
  weekSong[k] = (weekSong[k] || 0) + 1;
}
for (const [id, n] of Object.entries(totals)) {
  const max = special.includes(id) ? 4 : 3;
  if (n > max) errors.push(`${id} ${n}>${max}`);
}
for (const [k, n] of Object.entries(weekSong)) {
  if (n > 1) errors.push(`twice ${k}`);
}

const echoDays = {};
for (const e of echoes) echoDays[e.date] = (echoDays[e.date] || 0) + 1;
for (const [d, n] of Object.entries(echoDays)) {
  if (n > 1) errors.push(`echo day ${d}`);
}

const pins = [
  ["2026-05-15", "14:00", (e) => e.songId === "yellow"],
  ["2026-05-15", "18:30", (e) => e.songId === "breathe"],
  ["2026-05-17", "07:15", (e) => e.title === "Missing Home"],
  ["2026-05-06", "19:10", (e) => e.contributorId === "grandma"],
  ["2026-05-12", "10:40", (e) => e.contributorId === "sophie"],
  ["2026-05-19", "17:50", (e) => e.contributorId === "jake"],
  ["2026-05-27", "08:15", (e) => e.contributorId === "mom"],
  ["2026-05-30", "16:40", (e) => e.songId === "let-it-happen"],
];
for (const [date, time, pred] of pins) {
  if (!all.some((e) => e.date === date && e.time === time && pred(e))) errors.push(`pin ${date} ${time}`);
}

for (let w = 9; w <= 13; w++) {
  const n = all.filter((e) => e.week === w).length;
  if (n < 4 || n > 8) errors.push(`T1 W${w}=${n}`);
}
for (let w = 14; w <= 22; w++) {
  const n = all.filter((e) => e.week === w).length;
  if (n < 10 || n > 16) errors.push(`T2 W${w}=${n}`);
}

const am3 = songs.filter((s) => Number(s.time.slice(0, 2)) < 4).length;
const t1Songs = songs.filter((s) => weekFromDate(s.date) <= 13).length;
if (am3 < 8) errors.push(`3am ${am3}`);
if (t1Songs < 10) errors.push(`T1 songs ${t1Songs}`);

const newIds = [
  "bloom",
  "sea-of-love",
  "rivers-and-roads",
  "riptide",
  "youth",
  "the-night-we-met",
  "moon-river",
  "eventually",
  "lost-in-yesterday",
  "golden-slumbers",
  "stay-awake",
  "somewhere-over-the-rainbow",
  "hushabye-mountain",
  "blackbird",
  "brahms-lullaby",
  "mr-blue-sky",
];
const banned = ["iktara", "ilahi", "chanda-hai-tu", "agar-tum-saath-ho", "lag-ja-gale"];
for (const id of banned) {
  if (mock.includes(`id: "${id}"`) || timeline.includes(`"${id}"`)) errors.push(`banned ${id}`);
  if (fs.existsSync(`public/img/${id}.jpg`)) errors.push(`img ${id}`);
}

const lullabies = [
  "lullabye",
  "baby-mine",
  "golden-slumbers",
  "stay-awake",
  "somewhere-over-the-rainbow",
  "hushabye-mountain",
  "blackbird",
  "brahms-lullaby",
];
const t2Lullaby = songs.filter((s) => lullabies.includes(s.songId) && weekFromDate(s.date) >= 14 && weekFromDate(s.date) <= 22);
if (t2Lullaby.length < 8) errors.push(`t2 lullabies ${t2Lullaby.length}`);

for (const id of newIds) {
  if (!fs.existsSync(`public/img/${id}.jpg`)) errors.push(`art ${id}`);
  if (!mock.includes(`id: "${id}"`)) errors.push(`mock ${id}`);
}

console.log({
  entries: all.length,
  t2Songs: t2Songs.length,
  echoes: allEcho.length,
  voices: voices.length,
  byPerson,
  am3,
  t1Songs,
  firstMonth: timeline.includes('timelineFirstMonth = "2026-02"'),
  errors,
});
if (errors.length) process.exit(1);
