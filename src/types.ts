import type { ISODate } from "../shared/dates";

export type { ISODate };

export type Scale5 = 1 | 2 | 3 | 4 | 5;

export type Day = {
  sleepHrs?: number;
  bedAt?: string;
  quality?: Scale5;
  mood?: Scale5;
  energy?: Scale5;
  screen?: number;
  win?: string;
  preceptNote?: string;
};

export const URGE_TRIGGERS = [
  "Tired",
  "Bored",
  "Stressed",
  "Alone",
  "Late night",
  "Scrolling",
  "Other",
] as const;

export type UrgeTrigger = (typeof URGE_TRIGGERS)[number];

export type Urge = {
  id: string;
  date: ISODate;
  hour: number;
  trigger?: UrgeTrigger;
  acted: boolean;
  note?: string;
};

export type Account = { id: string; name: string; bal: number };
export type Flow = {
  id: string;
  name: string;
  amt: number;
  kind: "in" | "out";
  scope: "personal" | "business";
};
export type Skill = { id: string; name: string; have: number; want: number };
export type Obligation = { id: string; what: string; who?: string; due?: ISODate; done: boolean };
export type Person = { id: string; name: string; cadence: number; last: ISODate | null };

export type Settings = {
  pushHour: number;
  eveningNudge: boolean;
  pushEnabled: boolean;
  startDate: ISODate;
};

export type WeekReview = { q1?: string; q2?: string; q3?: string };

export type Meta = {
  created: ISODate;
  seenOnboarding?: boolean;
  iosHintDismissed?: boolean;
};

export type State = {
  version: 1;
  days: Record<ISODate, Day>;
  urges: Urge[];
  finance: { accounts: Account[]; flows: Flow[] };
  skills: Skill[];
  obligations: Obligation[];
  people: Person[];
  settings: Settings;
  weeks?: Record<string, WeekReview>;
  meta: Meta;
};

export type Route =
  | "/"
  | "/log"
  | "/money"
  | "/grow"
  | "/trends"
  | "/review"
  | "/precepts"
  | "/settings";
