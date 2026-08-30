import type { IncomingMessage, ServerResponse } from "node:http";
import {
  deleteSub,
  pushConfigured,
  storeKind,
  upsertSub,
  vapidPublicKey,
  type PushSub,
} from "../server/subscriptions.js";

type Req = IncomingMessage & { body?: unknown; query?: Record<string, string | string[]> };
type Res = ServerResponse & {
  status: (code: number) => Res;
  json: (body: unknown) => void;
};

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    res.status(200).json({
      configured: pushConfigured(),
      vapidPublicKey: vapidPublicKey(),
      store: storeKind(),
    });
    return;
  }

  if (req.method === "POST") {
    if (!pushConfigured()) {
      res.status(503).json({
        error:
          "Push is not configured. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT.",
      });
      return;
    }
    const body = asRecord(req.body);
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
    const keys = asRecord(body.keys);
    const p256dh = typeof keys.p256dh === "string" ? keys.p256dh : "";
    const auth = typeof keys.auth === "string" ? keys.auth : "";
    const tzOffset = Number(body.tzOffset);
    const hour = Number(body.hour);
    if (!endpoint || !p256dh || !auth || !Number.isFinite(tzOffset) || !Number.isFinite(hour)) {
      res.status(400).json({ error: "endpoint, keys, tzOffset, and hour are required." });
      return;
    }
    const hours = Array.isArray(body.hours)
      ? body.hours.map((h) => Number(h)).filter((h) => Number.isFinite(h) && h >= 0 && h <= 23)
      : undefined;
    const sub: PushSub = {
      endpoint,
      keys: { p256dh, auth },
      tzOffset,
      hour: clampHour(hour),
      hours: hours && hours.length ? hours : undefined,
    };
    await upsertSub(sub);
    res.status(200).json({ ok: true, store: storeKind() });
    return;
  }

  if (req.method === "DELETE") {
    const body = asRecord(req.body);
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
    if (!endpoint) {
      res.status(400).json({ error: "endpoint is required." });
      return;
    }
    await deleteSub(endpoint);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed." });
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function clampHour(h: number): number {
  return Math.min(23, Math.max(0, Math.round(h)));
}
