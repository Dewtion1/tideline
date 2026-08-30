import { todayISO } from "../../shared/dates";
import type { State } from "../types";
import { emptyState } from "./initial";

/**
 * Schema changes ship a migration keyed on old version.
 * Never mutate in place without bumping `version`.
 */
export function migrate(raw: unknown): State {
  if (!raw || typeof raw !== "object") return emptyState();
  const rec = raw as { version?: number };
  if (rec.version == null) {
    return normalize({ ...(raw as State), version: 1 });
  }
  if (rec.version === 1) {
    return normalize(raw as State);
  }
  // Unknown future version: keep what we can, do not invent writes backward.
  return normalize({ ...(raw as State), version: 1 });
}

function normalize(s: State): State {
  const base = emptyState(s.meta?.created ?? todayISO());
  return {
    version: 1,
    days: s.days ?? {},
    urges: Array.isArray(s.urges) ? s.urges : [],
    finance: {
      accounts: s.finance?.accounts ?? [],
      flows: s.finance?.flows ?? [],
    },
    skills: Array.isArray(s.skills) ? s.skills : [],
    obligations: Array.isArray(s.obligations) ? s.obligations : [],
    people: Array.isArray(s.people) ? s.people : [],
    settings: {
      pushHour: clampHour(s.settings?.pushHour ?? 7),
      eveningNudge: Boolean(s.settings?.eveningNudge),
      pushEnabled: Boolean(s.settings?.pushEnabled),
      startDate: s.settings?.startDate ?? base.settings.startDate,
    },
    weeks: s.weeks ?? {},
    meta: {
      created: s.meta?.created ?? base.meta.created,
      seenOnboarding: Boolean(s.meta?.seenOnboarding),
      iosHintDismissed: Boolean(s.meta?.iosHintDismissed),
    },
  };
}

function clampHour(h: number): number {
  if (!Number.isFinite(h)) return 7;
  return Math.min(23, Math.max(0, Math.round(h)));
}

export function looksLikeState(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Record<string, unknown>;
  return r.days != null && r.urges != null && r.settings != null && r.meta != null;
}
