import { diffDays, todayISO } from "../../shared/dates";
import type {
  Account,
  Day,
  Flow,
  ISODate,
  Obligation,
  Person,
  Settings,
  Skill,
  State,
  Urge,
  WeekReview,
} from "../types";
import { emptyState } from "./initial";

export type Action =
  | { type: "HYDRATE"; state: State }
  | { type: "PATCH_DAY"; date: ISODate; patch: Partial<Day> }
  | { type: "ADD_URGE"; urge: Urge }
  | { type: "DELETE_URGE"; id: string }
  | { type: "UPSERT_ACCOUNT"; account: Account }
  | { type: "DELETE_ACCOUNT"; id: string }
  | { type: "UPSERT_FLOW"; flow: Flow }
  | { type: "DELETE_FLOW"; id: string }
  | { type: "UPSERT_SKILL"; skill: Skill }
  | { type: "DELETE_SKILL"; id: string }
  | { type: "UPSERT_OBLIGATION"; obligation: Obligation }
  | { type: "DELETE_OBLIGATION"; id: string }
  | { type: "UPSERT_PERSON"; person: Person }
  | { type: "DELETE_PERSON"; id: string }
  | { type: "PATCH_SETTINGS"; patch: Partial<Settings> }
  | { type: "SAVE_WEEK"; key: string; review: WeekReview }
  | { type: "IMPORT"; state: State }
  | { type: "ERASE" }
  | { type: "DISMISS_ONBOARDING" }
  | { type: "DISMISS_IOS_HINT" };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
    case "IMPORT":
      return action.state;
    case "ERASE":
      return {
        ...emptyState(),
        meta: { ...emptyState().meta, seenOnboarding: true },
      };
    case "PATCH_DAY": {
      const prev = state.days[action.date] ?? {};
      const next = { ...prev, ...action.patch };
      return { ...state, days: { ...state.days, [action.date]: next } };
    }
    case "ADD_URGE":
      return { ...state, urges: [...state.urges, action.urge] };
    case "DELETE_URGE":
      return { ...state, urges: state.urges.filter((u) => u.id !== action.id) };
    case "UPSERT_ACCOUNT":
      return {
        ...state,
        finance: {
          ...state.finance,
          accounts: upsert(state.finance.accounts, action.account),
        },
      };
    case "DELETE_ACCOUNT":
      return {
        ...state,
        finance: {
          ...state.finance,
          accounts: state.finance.accounts.filter((a) => a.id !== action.id),
        },
      };
    case "UPSERT_FLOW":
      return {
        ...state,
        finance: { ...state.finance, flows: upsert(state.finance.flows, action.flow) },
      };
    case "DELETE_FLOW":
      return {
        ...state,
        finance: {
          ...state.finance,
          flows: state.finance.flows.filter((f) => f.id !== action.id),
        },
      };
    case "UPSERT_SKILL":
      return { ...state, skills: upsert(state.skills, action.skill) };
    case "DELETE_SKILL":
      return { ...state, skills: state.skills.filter((s) => s.id !== action.id) };
    case "UPSERT_OBLIGATION":
      return { ...state, obligations: upsert(state.obligations, action.obligation) };
    case "DELETE_OBLIGATION":
      return { ...state, obligations: state.obligations.filter((o) => o.id !== action.id) };
    case "UPSERT_PERSON":
      return { ...state, people: upsert(state.people, action.person) };
    case "DELETE_PERSON":
      return { ...state, people: state.people.filter((p) => p.id !== action.id) };
    case "PATCH_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case "SAVE_WEEK":
      return { ...state, weeks: { ...state.weeks, [action.key]: action.review } };
    case "DISMISS_ONBOARDING":
      return { ...state, meta: { ...state.meta, seenOnboarding: true } };
    case "DISMISS_IOS_HINT":
      return { ...state, meta: { ...state.meta, iosHintDismissed: true } };
    default:
      return state;
  }
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const i = list.findIndex((x) => x.id === item.id);
  if (i === -1) return [...list, item];
  const next = list.slice();
  next[i] = item;
  return next;
}

export function lastActedDate(state: State): ISODate | null {
  let latest: ISODate | null = null;
  for (const u of state.urges) {
    if (!u.acted) continue;
    if (!latest || u.date > latest) latest = u.date;
  }
  return latest;
}

export function daysClear(state: State, today = todayISO()): number {
  const last = lastActedDate(state);
  if (!last) {
    return Math.max(0, diffDays(today, state.settings.startDate));
  }
  return Math.max(0, diffDays(today, last));
}
