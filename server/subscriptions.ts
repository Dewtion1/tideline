import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export type PushSub = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  tzOffset: number;
  hour: number;
  hours?: number[];
};

const KEY = "tideline:subs";

function kvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export function pushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT,
  );
}

export function vapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

async function redis(command: unknown[]): Promise<unknown> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("KV not configured");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KV error ${res.status}: ${text}`);
  }
  const data = (await res.json()) as { result?: unknown };
  return data.result;
}

function fallbackPath(): string {
  return process.env.SUBS_FILE || ".data/subscriptions.json";
}

function readFileSubs(): PushSub[] {
  const p = fallbackPath();
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as unknown;
    return Array.isArray(raw) ? (raw as PushSub[]) : [];
  } catch {
    return [];
  }
}

function writeFileSubs(subs: PushSub[]): void {
  const p = fallbackPath();
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(subs, null, 2));
}

export async function listSubs(): Promise<PushSub[]> {
  if (kvConfigured()) {
    const raw = await redis(["GET", KEY]);
    if (typeof raw !== "string" || !raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as PushSub[]) : [];
    } catch {
      return [];
    }
  }
  return readFileSubs();
}

export async function saveSubs(subs: PushSub[]): Promise<void> {
  if (kvConfigured()) {
    await redis(["SET", KEY, JSON.stringify(subs)]);
    return;
  }
  writeFileSubs(subs);
}

export async function upsertSub(sub: PushSub): Promise<void> {
  const all = await listSubs();
  const i = all.findIndex((s) => s.endpoint === sub.endpoint);
  if (i === -1) all.push(sub);
  else all[i] = sub;
  await saveSubs(all);
}

export async function deleteSub(endpoint: string): Promise<void> {
  const all = await listSubs();
  await saveSubs(all.filter((s) => s.endpoint !== endpoint));
}

export function storeKind(): "kv" | "file" {
  return kvConfigured() ? "kv" : "file";
}
