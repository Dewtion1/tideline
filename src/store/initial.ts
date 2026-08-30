import { todayISO } from "../../shared/dates";
import type { State } from "../types";

export function emptyState(now = todayISO()): State {
  return {
    version: 1,
    days: {},
    urges: [],
    finance: { accounts: [], flows: [] },
    skills: [],
    obligations: [],
    people: [],
    settings: {
      pushHour: 7,
      eveningNudge: false,
      pushEnabled: false,
      startDate: now,
    },
    weeks: {},
    meta: { created: now, seenOnboarding: false, iosHintDismissed: false },
  };
}
