import type { Contributor, Song, User } from "./types";

export const user: User = {
  name: "Sarah",
  week: 22,
  trimester: 2,
  stoneConnected: true,
};

export const songs: Song[] = [
  {
    id: "chandaniya",
    title: "Chandaniya",
    artist: "Sajid Wajid",
    art: "/img/chandaniya.jpg",
    gradient: "linear-gradient(145deg, var(--pink-200), var(--pink-500))",
  },
  {
    id: "breathe",
    title: "Breathe",
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
    gradient: "linear-gradient(145deg, var(--purple-300), var(--purple-500))",
  },
  {
    id: "songs-about-jane",
    title: "Songs About Jane",
    artist: "Maroon 5",
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
    gradient: "linear-gradient(145deg, var(--feel-peach), var(--wrap-times-from))",
  },
];

export const recentlyPlayedIds = [
  "breathe",
  "yellow",
  "she-will-be-loved",
  "hotel-california",
  "holocene",
];

export const playbackQueueIds = ["chandaniya", ...recentlyPlayedIds];

export const contributors: Contributor[] = [
  {
    id: "mum",
    name: "Mum",
    relationship: "Mum",
    contact: "mum@example.com",
    status: "active",
    echoes: [
      {
        id: "mum-sleep",
        kind: "voice",
        title: "For when you can't sleep",
        durationSec: 42,
        addedToArchive: false,
        seen: false,
      },
      {
        id: "mum-grandma",
        kind: "voice",
        title: "Your great-grandma's song",
        durationSec: 75,
        addedToArchive: false,
        seen: false,
      },
      {
        id: "mum-week-21",
        kind: "voice",
        title: "Week 21 hello",
        durationSec: 30,
        addedToArchive: false,
        seen: false,
      },
      {
        id: "mum-lag-ja-gale",
        kind: "song",
        title: "Lag Ja Gale",
        artist: "Lata Mangeshkar",
        addedToArchive: false,
        seen: true,
      },
      {
        id: "mum-here-comes-the-sun",
        kind: "song",
        title: "Here Comes the Sun",
        artist: "The Beatles",
        addedToArchive: false,
        seen: true,
      },
    ],
  },
  {
    id: "daniel",
    name: "Daniel",
    relationship: "Partner",
    contact: "daniel@example.com",
    status: "active",
    echoes: [],
  },
];
