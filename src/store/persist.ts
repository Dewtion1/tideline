import { get, set, del } from "idb-keyval";
import type { State } from "../types";
import { migrate } from "./migrate";

export const STATE_KEY = "tideline-state";

export async function loadState(): Promise<State | undefined> {
  try {
    const raw = await get(STATE_KEY);
    if (raw == null) return undefined;
    return migrate(raw);
  } catch {
    return undefined;
  }
}

export async function saveState(state: State): Promise<void> {
  await set(STATE_KEY, state);
}

export async function clearState(): Promise<void> {
  await del(STATE_KEY);
}

export function createDebouncedSave(ms = 700): (state: State) => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  let pending: State | undefined;
  return (state: State) => {
    pending = state;
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      const snap = pending;
      pending = undefined;
      if (snap) void saveState(snap);
    }, ms);
  };
}
