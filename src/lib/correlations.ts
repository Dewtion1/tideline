import { addDays, bedAtMinutesPast21 } from "../../shared/dates";
import type { ISODate, State } from "../types";
import { urgeCountOn } from "./score";

export type PairKind = "same" | "lag";

export type CorrResult = {
  id: string;
  pair: string;
  kind: PairKind;
  english: string;
  r: number;
  n: number;
  strength: string;
};

type Series = { date: ISODate; value: number };

function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 2) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const x = xs[i]! - mx;
    const y = ys[i]! - my;
    num += x * y;
    dx += x * x;
    dy += y * y;
  }
  const den = Math.sqrt(dx * dy);
  if (den === 0) return null;
  return num / den;
}

function strength(r: number): string {
  const a = Math.abs(r);
  if (a >= 0.7) return "strong";
  if (a >= 0.5) return "moderate";
  return "weak";
}

function align(a: Series[], b: Series[]): { xs: number[]; ys: number[] } {
  const map = new Map(b.map((p) => [p.date, p.value]));
  const xs: number[] = [];
  const ys: number[] = [];
  for (const p of a) {
    const y = map.get(p.date);
    if (y != null) {
      xs.push(p.value);
      ys.push(y);
    }
  }
  return { xs, ys };
}

function sleepHrs(state: State): Series[] {
  return Object.entries(state.days)
    .filter(([, d]) => d.sleepHrs != null)
    .map(([date, d]) => ({ date, value: d.sleepHrs as number }));
}

function mood(state: State): Series[] {
  return Object.entries(state.days)
    .filter(([, d]) => d.mood != null)
    .map(([date, d]) => ({ date, value: d.mood as number }));
}

function energy(state: State): Series[] {
  return Object.entries(state.days)
    .filter(([, d]) => d.energy != null)
    .map(([date, d]) => ({ date, value: d.energy as number }));
}

function screen(state: State): Series[] {
  return Object.entries(state.days)
    .filter(([, d]) => d.screen != null)
    .map(([date, d]) => ({ date, value: d.screen as number }));
}

function urgeCounts(state: State): Series[] {
  const dates = new Set<ISODate>([
    ...Object.keys(state.days),
    ...state.urges.map((u) => u.date),
  ]);
  return [...dates].map((date) => ({ date, value: urgeCountOn(state, date) }));
}

function bedAt(state: State): Series[] {
  const out: Series[] = [];
  for (const [date, d] of Object.entries(state.days)) {
    if (!d.bedAt) continue;
    const v = bedAtMinutesPast21(d.bedAt);
    if (v != null) out.push({ date, value: v });
  }
  return out;
}

function shift(series: Series[], days: number): Series[] {
  return series.map((p) => ({ date: addDays(p.date, days), value: p.value }));
}

function run(
  id: string,
  pair: string,
  kind: PairKind,
  englishPos: string,
  englishNeg: string,
  a: Series[],
  b: Series[],
): CorrResult | null {
  const { xs, ys } = align(a, b);
  if (xs.length < 5) return null;
  const r = pearson(xs, ys);
  if (r == null || Math.abs(r) <= 0.3) return null;
  return {
    id,
    pair,
    kind,
    english: r >= 0 ? englishPos : englishNeg,
    r,
    n: xs.length,
    strength: strength(r),
  };
}

export function correlations(state: State): CorrResult[] {
  const s = sleepHrs(state);
  const m = mood(state);
  const e = energy(state);
  const sc = screen(state);
  const u = urgeCounts(state);
  const bed = bedAt(state);

  const ySleep = shift(s, 1);
  const yScreen = shift(sc, 1);
  const yBed = shift(bed, 1);

  const found = [
    run("sleep-mood", "sleepHrs × mood", "same", "Longer nights sit with higher mood", "Short nights sit with lower mood", s, m),
    run("sleep-energy", "sleepHrs × energy", "same", "Longer nights sit with higher energy", "Short nights sit with lower energy", s, e),
    run("screen-mood", "screen × mood", "same", "Heavier screen days sit with higher mood", "Heavier screen days sit with lower mood", sc, m),
    run("screen-urges", "screen × urgeCount", "same", "Heavier screen days sit with more urges", "Heavier screen days sit with fewer urges", sc, u),
    run("sleep-urges", "sleepHrs × urgeCount", "same", "Longer nights sit with more urges", "Short nights sit with more urges", s, u),
    run("mood-urges", "mood × urgeCount", "same", "Higher mood days sit with more urges", "Lower mood days sit with more urges", m, u),
    run("lag-sleep-mood", "yesterday sleepHrs × today mood", "lag", "A longer night is followed by higher mood", "A short night is followed by lower mood", ySleep, m),
    run("lag-sleep-energy", "yesterday sleepHrs × today energy", "lag", "A longer night is followed by higher energy", "A short night is followed by lower energy", ySleep, e),
    run("lag-sleep-urges", "yesterday sleepHrs × today urgeCount", "lag", "A longer night is followed by more urges", "Short nights bring more urges", ySleep, u),
    run("lag-screen-mood", "yesterday screen × today mood", "lag", "A heavier screen day is followed by higher mood", "A heavier screen day is followed by lower mood", yScreen, m),
    run("lag-screen-urges", "yesterday screen × today urgeCount", "lag", "A heavier screen day is followed by more urges", "A heavier screen day is followed by fewer urges", yScreen, u),
    run("lag-bed-urges", "yesterday bedAt × today urgeCount", "lag", "A later bedtime is followed by more urges", "A later bedtime is followed by fewer urges", yBed, u),
  ];

  return found.filter((x): x is CorrResult => x != null).sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
}
