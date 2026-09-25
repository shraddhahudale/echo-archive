import type { LucideIcon } from "lucide-react";
import { Heart, Moon, Sun } from "lucide-react";

export type MoodPlaylistId = "calm-nights" | "tender" | "bright-days";

export type MoodPlaylist = {
  id: MoodPlaylistId;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
  /** Accent for the filled Play pill (tile icon colour). */
  playColor: string;
  songIds: string[];
  /** Archive feeling tags for "From your archive" / See all. */
  archiveFeelings: string[];
  /** Optional title override for Archive A3 (e.g. Tender). */
  archiveTitle?: string;
};

export const moodPlaylists: MoodPlaylist[] = [
  {
    id: "calm-nights",
    label: "Calm nights",
    description: "Soft songs for slowing down before sleep",
    icon: Moon,
    color: "#C9B8FF",
    iconColor: "#9B7BF0",
    playColor: "#9B7BF0",
    songIds: [
      "holocene",
      "to-build-a-home",
      "chandaniya",
      "iktara",
      "lullabye",
      "baby-mine",
      "re-stacks",
      "sunset-lover",
    ],
    archiveFeelings: ["calm"],
  },
  {
    id: "tender",
    label: "Tender",
    description: "For the quiet, loving moments with your little one",
    icon: Heart,
    color: "#F7A8D0",
    iconColor: "#E86FAE",
    playColor: "#E86FAE",
    songIds: [
      "beautiful-boy",
      "yellow",
      "sweet-pea",
      "breathe",
      "she-will-be-loved",
      "photograph",
      "chanda-hai-tu",
      "book-of-love",
    ],
    archiveFeelings: ["connected", "loved"],
    archiveTitle: "Tender",
  },
  {
    id: "bright-days",
    label: "Bright days",
    description: "Warm, hopeful songs for lighter days",
    icon: Sun,
    color: "#FFD39A",
    iconColor: "#E89A5C",
    playColor: "#E89A5C",
    songIds: [
      "here-comes-the-sun",
      "let-it-happen",
      "breathe-deeper",
      "home-edward-sharpe",
      "lovely-day",
      "put-your-records-on",
      "budapest",
      "ilahi",
    ],
    archiveFeelings: ["hopeful"],
  },
];

export function moodPlaylistById(id: MoodPlaylistId) {
  return moodPlaylists.find((item) => item.id === id);
}

export function tileGradient(color: string) {
  return `linear-gradient(135deg, #FFFFFF 0%, ${color} 75%)`;
}
