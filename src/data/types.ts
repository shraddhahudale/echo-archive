export type Kind = "voice" | "song" | "echo";

export type Relationship = "Partner" | "Mum" | "Dad" | "Sibling" | "Friend" | "Other";

export type Entry = {
  id: string;
  kind: Kind;
  title: string;
  number?: number;
  artist?: string;
  art?: string;
  feelings: string[];
  note?: string;
  durationSec?: number;
  contributorId?: string;
  noteIds?: string[];
  createdAt: string;
  week: number;
};

export type Contact = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

export type ContributorNote = {
  id: string;
  title: string;
  durationSec: number;
  week: number;
  seen: boolean;
  inArchive: boolean;
};

export type Contributor = {
  id: string;
  name: string;
  relationship: string;
  avatar?: string;
  status: "invited" | "active";
  totalCount: number;
  since?: number;
  notes: ContributorNote[];
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  art?: string;
  gradient: string;
  bordered?: boolean;
};

export type User = {
  name: string;
  week: number;
  trimester: number;
  stoneConnected: boolean;
};

export type TimelineEntry = {
  id: string;
  date: string;
  time: string;
  kind: "song" | "voice" | "echo";
  title: string;
  artist?: string;
  art?: string;
  songId?: string;
  contributorId?: string;
};
