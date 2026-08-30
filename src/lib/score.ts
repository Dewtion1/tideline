import type { Day, ISODate, State } from "../types";

export function urgeCountOn(state: State, date: ISODate): number {
  return state.urges.filter((u) => u.date === date).length;
}

/** Composite 0–1. Null if nothing that day was recorded. */
export function dayScore(day: Day | undefined, urgeCount: number, hasUrgesLogged: boolean): number | null {
  const parts: number[] = [];
  if (day?.sleepHrs != null) parts.push(clamp01(day.sleepHrs / 8));
  if (day?.mood != null) parts.push(clamp01((day.mood - 1) / 4));
  if (day?.energy != null) parts.push(clamp01((day.energy - 1) / 4));
  if (day?.screen != null) parts.push(clamp01(1 - day.screen / 300));
  if (hasUrgesLogged || urgeCount > 0) {
    parts.push(urgeCount === 0 ? 1 : clamp01(1 - urgeCount / 5));
  }
  if (parts.length === 0) return null;
  const mean = parts.reduce((a, b) => a + b, 0) / parts.length;
  return clamp01(mean);
}

export function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function scoreForDate(state: State, date: ISODate): number | null {
  const day = state.days[date];
  const count = urgeCountOn(state, date);
  const hasUrgesLogged = state.urges.some((u) => u.date === date);
  return dayScore(day, count, hasUrgesLogged);
}

export function dayHasReading(day: Day | undefined): boolean {
  if (!day) return false;
  return (
    day.sleepHrs != null ||
    day.bedAt != null ||
    day.quality != null ||
    day.mood != null ||
    day.energy != null ||
    day.screen != null ||
    Boolean(day.win) ||
    Boolean(day.preceptNote)
  );
}
