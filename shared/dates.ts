/** Local calendar date as YYYY-MM-DD. */
export type ISODate = string;

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Format a Date using its local Y-M-D (not UTC). */
export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayISO(now = new Date()): ISODate {
  return toISODate(now);
}

export function parseISO(iso: ISODate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(iso: ISODate, n: number): ISODate {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function diffDays(a: ISODate, b: ISODate): number {
  const ms = parseISO(a).getTime() - parseISO(b).getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * Days since Unix epoch for a calendar date, timezone-independent.
 * Same Y-M-D always yields the same integer on client and server.
 */
export function epochDays(iso: ISODate): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, (m ?? 1) - 1, d ?? 1) / 86_400_000);
}

export function weekday(iso: ISODate): number {
  return parseISO(iso).getDay();
}

export function isSunday(iso: ISODate): boolean {
  return weekday(iso) === 0;
}

/** Sunday-start week key: the Sunday date of that week. */
export function weekKey(iso: ISODate): string {
  return addDays(iso, -weekday(iso));
}

export function formatShort(iso: ISODate): string {
  return parseISO(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatWeekRange(sunday: ISODate): string {
  const sat = addDays(sunday, 6);
  return `${formatShort(sunday)} – ${formatShort(sat)}`;
}

/** Local calendar date for a stored timezone offset (minutes, Date.getTimezoneOffset). */
export function localISOFromOffset(tzOffsetMinutes: number, now = Date.now()): ISODate {
  return new Date(now - tzOffsetMinutes * 60_000).toISOString().slice(0, 10);
}

export function localHourFromOffset(tzOffsetMinutes: number, now = Date.now()): number {
  return new Date(now - tzOffsetMinutes * 60_000).getUTCHours();
}

/**
 * Minutes past 21:00. Hours before 12:00 are treated as after midnight
 * (e.g. 00:30 → 210 minutes past 21:00).
 */
export function bedAtMinutesPast21(bedAt: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(bedAt.trim());
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  if (h < 12) h += 24;
  return h * 60 + min - 21 * 60;
}

export function eachDate(from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = [];
  let cur = from;
  const steps = diffDays(to, from);
  if (steps < 0) return out;
  for (let i = 0; i <= steps; i++) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}
