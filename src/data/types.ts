export type Kind = "voice" | "song" | "echo";

export type Relationship = "Partner" | "Mum" | "Dad" | "Sibling" | "Friend" | "Other";

export type Entry = {
  id: string;
  kind: Kind;
  title: string;
  artist?: string;
  art?: string;
  feelings: string[];
  note?: string;
  durationSec?: number;
  contributorId?: string;
  createdAt: string;
  week: number;
};

export type EchoItem = {
  id: string;
  kind: "voice" | "song";
  title: string;
  artist?: string;
  durationSec?: number;
  addedToArchive: boolean;
  seen: boolean;
};

export type Contributor = {
  id: string;
  name: string;
  relationship: Relationship;
  contact: string;
  status: "pending" | "active";
  avatar?: string;
  echoes: EchoItem[];
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
