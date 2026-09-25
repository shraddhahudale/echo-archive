import type { Contact, Contributor, ContributorNote, Song, User } from "./types";

export const user: User = {
  name: "Sarah",
  week: 22,
  trimester: 2,
  stoneConnected: true,
};

export const songs: Song[] = [
  {
    id: "let-it-happen",
    title: "Let It Happen",
    artist: "Tame Impala",
    art: "/img/let-it-happen.jpg",
    gradient: "linear-gradient(145deg, var(--feel-lavender), var(--purple-500))",
  },
  {
    id: "breathe-deeper",
    title: "Breathe Deeper",
    artist: "Tame Impala",
    art: "/img/breathe-deeper.jpg",
    gradient: "linear-gradient(145deg, var(--wrap-holocene-from), var(--wrap-holocene-to))",
  },
  {
    id: "chandaniya",
    title: "Chandaniya",
    artist: "Sajid Wajid",
    art: "/img/chandaniya.jpg",
    gradient: "linear-gradient(145deg, var(--pink-200), var(--pink-500))",
  },
  {
    id: "breathe",
    title: "Breathe (2 AM)",
    artist: "Anna Nalick",
    art: "/img/breathe.jpg",
    gradient: "linear-gradient(145deg, var(--feel-lavender), var(--purple-500))",
  },
  {
    id: "yellow",
    title: "Yellow",
    artist: "Coldplay",
    art: "/img/yellow.jpg",
    gradient: "linear-gradient(145deg, var(--feel-peach), var(--wrap-times-from))",
    bordered: true,
  },
  {
    id: "she-will-be-loved",
    title: "She Will Be Loved",
    artist: "Maroon 5",
    art: "/img/she-will-be-loved.jpg",
    gradient: "linear-gradient(145deg, var(--pink-200), var(--pink-500))",
  },
  {
    id: "hotel-california",
    title: "Hotel California",
    artist: "Eagles",
    art: "/img/hotel-california.jpg",
    gradient: "linear-gradient(145deg, var(--wrap-times-from), var(--feel-peach))",
  },
  {
    id: "holocene",
    title: "Holocene",
    artist: "Bon Iver",
    art: "/img/holocene.jpg",
    gradient: "linear-gradient(145deg, var(--wrap-holocene-from), var(--wrap-holocene-to))",
  },
  {
    id: "bohemian-rhapsody",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    art: "/img/bohemian-rhapsody.jpg",
    gradient: "linear-gradient(145deg, var(--purple-300), var(--purple-500))",
  },
  {
    id: "songs-about-jane",
    title: "Songs About Jane",
    artist: "Maroon 5",
    art: "/img/songs-about-jane.jpg",
    gradient: "linear-gradient(145deg, var(--pink-50), var(--pink-500))",
  },
  {
    id: "lag-ja-gale",
    title: "Lag Ja Gale",
    artist: "Lata Mangeshkar",
    gradient: "linear-gradient(145deg, var(--amber-100), var(--amber-500))",
  },
  {
    id: "here-comes-the-sun",
    title: "Here Comes the Sun",
    artist: "The Beatles",
    art: "/img/here-comes-the-sun.jpg",
    gradient: "linear-gradient(145deg, var(--feel-peach), var(--wrap-times-from))",
  },
  {
    id: "to-build-a-home",
    title: "To Build a Home",
    artist: "The Cinematic Orchestra",
    art: "/img/to-build-a-home.jpg",
    gradient: "linear-gradient(145deg, var(--feel-lavender), var(--purple-500))",
  },
  {
    id: "iktara",
    title: "Iktara",
    artist: "Kavita Seth",
    art: "/img/iktara.jpg",
    gradient: "linear-gradient(145deg, var(--feel-lavender), var(--purple-300))",
  },
  {
    id: "lullabye",
    title: "Lullabye (Goodnight, My Angel)",
    artist: "Billy Joel",
    art: "/img/lullabye.jpg",
    gradient: "linear-gradient(145deg, var(--purple-100), var(--purple-500))",
  },
  {
    id: "baby-mine",
    title: "Baby Mine",
    artist: "Alison Krauss",
    art: "/img/baby-mine.jpg",
    gradient: "linear-gradient(145deg, var(--feel-lavender), var(--pink-200))",
  },
  {
    id: "re-stacks",
    title: "Re: Stacks",
    artist: "Bon Iver",
    art: "/img/re-stacks.jpg",
    gradient: "linear-gradient(145deg, var(--wrap-holocene-from), var(--wrap-holocene-to))",
  },
  {
    id: "sunset-lover",
    title: "Sunset Lover",
    artist: "Petit Biscuit",
    art: "/img/sunset-lover.jpg",
    gradient: "linear-gradient(145deg, var(--purple-300), var(--feel-lavender))",
  },
  {
    id: "beautiful-boy",
    title: "Beautiful Boy (Darling Boy)",
    artist: "John Lennon",
    art: "/img/beautiful-boy.jpg",
    gradient: "linear-gradient(145deg, var(--pink-200), var(--pink-500))",
  },
  {
    id: "sweet-pea",
    title: "Sweet Pea",
    artist: "Amos Lee",
    art: "/img/sweet-pea.jpg",
    gradient: "linear-gradient(145deg, var(--pink-50), var(--pink-500))",
  },
  {
    id: "photograph",
    title: "Photograph",
    artist: "Ed Sheeran",
    art: "/img/photograph.jpg",
    gradient: "linear-gradient(145deg, var(--pink-200), var(--feel-peach))",
  },
  {
    id: "chanda-hai-tu",
    title: "Chanda Hai Tu",
    artist: "Lata Mangeshkar",
    art: "/img/chanda-hai-tu.jpg",
    gradient: "linear-gradient(145deg, var(--amber-100), var(--pink-500))",
  },
  {
    id: "book-of-love",
    title: "The Book of Love",
    artist: "Peter Gabriel",
    art: "/img/book-of-love.jpg",
    gradient: "linear-gradient(145deg, var(--pink-50), var(--purple-300))",
  },
  {
    id: "home-edward-sharpe",
    title: "Home",
    artist: "Edward Sharpe & The Magnetic Zeros",
    art: "/img/home-edward-sharpe.jpg",
    gradient: "linear-gradient(145deg, var(--feel-peach), var(--wrap-times-from))",
  },
  {
    id: "lovely-day",
    title: "Lovely Day",
    artist: "Bill Withers",
    art: "/img/lovely-day.jpg",
    gradient: "linear-gradient(145deg, var(--feel-peach), var(--amber-500))",
  },
  {
    id: "put-your-records-on",
    title: "Put Your Records On",
    artist: "Corinne Bailey Rae",
    art: "/img/put-your-records-on.jpg",
    gradient: "linear-gradient(145deg, var(--amber-100), var(--feel-peach))",
  },
  {
    id: "budapest",
    title: "Budapest",
    artist: "George Ezra",
    art: "/img/budapest.jpg",
    gradient: "linear-gradient(145deg, var(--feel-peach), var(--wrap-times-from))",
  },
  {
    id: "ilahi",
    title: "Ilahi",
    artist: "Arijit Singh",
    art: "/img/ilahi.jpg",
    gradient: "linear-gradient(145deg, var(--amber-100), var(--amber-500))",
  },
];

export const recentlyPlayedIds = [
  "breathe",
  "yellow",
  "she-will-be-loved",
  "hotel-california",
  "holocene",
];

export const sheetRecentlyPlayedIds = [
  "songs-about-jane",
  "hotel-california",
  "bohemian-rhapsody",
  "she-will-be-loved",
];

export const playbackQueueIds = ["let-it-happen", ...recentlyPlayedIds];

function notes(
  person: string,
  items: (Omit<ContributorNote, "id" | "seen" | "inArchive"> & { inArchive?: boolean })[],
  unseen = 0,
): ContributorNote[] {
  return items.map((item, index) => ({
    title: item.title,
    durationSec: item.durationSec,
    week: item.week,
    id: `${person}-${index + 1}`,
    seen: index >= unseen || Boolean(item.inArchive),
    inArchive: Boolean(item.inArchive),
  }));
}

export const contributors: Contributor[] = [
  {
    id: "jake",
    name: "Jake",
    relationship: "partner",
    status: "active",
    totalCount: 5,
    since: 18,
    notes: notes("jake", [
      { title: "Kick count", durationSec: 38, week: 22 },
      { title: "On my way home", durationSec: 51, week: 21 },
      { title: "The drive home", durationSec: 72, week: 20 },
      { title: "Before you arrive", durationSec: 47, week: 19 },
      { title: "A song for you", durationSec: 65, week: 18, inArchive: true },
    ], 2),
  },
  {
    id: "sophie",
    name: "Aunt Sophie",
    relationship: "aunty / uncle",
    status: "active",
    totalCount: 6,
    since: 14,
    notes: notes("sophie", [
      { title: "A blessing", durationSec: 70, week: 22 },
      { title: "Your name", durationSec: 40, week: 20 },
      { title: "Recipe for later", durationSec: 95, week: 18 },
      { title: "From the wedding", durationSec: 55, week: 16 },
      { title: "Sleep, little one", durationSec: 62, week: 15, inArchive: true },
    ], 1),
  },
  {
    id: "mom",
    name: "Mom",
    relationship: "mum",
    status: "active",
    totalCount: 15,
    since: 9,
    notes: notes("mom", [
      { title: "Good morning, little one", durationSec: 42, week: 22 },
      { title: "When you were born", durationSec: 135, week: 21 },
      { title: "Your nani's lullaby", durationSec: 68, week: 20 },
      { title: "Sunday call", durationSec: 55, week: 19, inArchive: true },
    ], 2),
  },
  {
    id: "grandma",
    name: "Grandma",
    relationship: "grandparent",
    status: "active",
    totalCount: 12,
    since: 10,
    notes: notes("grandma", [
      { title: "A story from home", durationSec: 80, week: 21 },
      { title: "The old song", durationSec: 62, week: 19 },
      { title: "Sleep now", durationSec: 48, week: 17 },
      { title: "For your mother", durationSec: 36, week: 15 },
      { title: "Hands like yours", durationSec: 74, week: 12, inArchive: true },
    ], 1),
  },
];

export const contacts: Contact[] = [
  { id: "mom", name: "Mom", phone: "0412 111 222" },
  { id: "priya", name: "Priya Sharma", phone: "0412 345 678" },
  { id: "priyanka", name: "Priyanka D", email: "priyanka@gmail.com" },
  { id: "daniel", name: "Daniel Chen", email: "daniel@example.com" },
  { id: "arun", name: "Arun Mehta", phone: "0413 222 018" },
  { id: "neha", name: "Neha Kapoor", email: "neha@example.com" },
  { id: "liam", name: "Liam O'Brien", phone: "0421 880 014" },
  { id: "aisha", name: "Aisha Rahman", email: "aisha@example.com" },
  { id: "tom", name: "Tom Nguyen", phone: "0433 100 452" },
];
