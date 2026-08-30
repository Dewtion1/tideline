import type { IncomingMessage, ServerResponse } from "node:http";
import webpush from "web-push";
import { localHourFromOffset, localISOFromOffset } from "../shared/dates.js";
import { preceptForDate } from "../shared/precepts.js";
import { deleteSub, listSubs, pushConfigured } from "../server/subscriptions.js";

type Req = IncomingMessage & { headers: IncomingMessage["headers"] };
type Res = ServerResponse & {
  status: (code: number) => Res;
  json: (body: unknown) => void;
};

export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${secret}`) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }
  }

  if (!pushConfigured()) {
    res.status(200).json({ ok: true, sent: 0, skipped: "vapid missing" });
    return;
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT as string,
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string,
  );

  const now = Date.now();
  const subs = await listSubs();
  let sent = 0;
  let gone = 0;
  const errors: string[] = [];

  for (const sub of subs) {
    const localHour = localHourFromOffset(sub.tzOffset, now);
    const hours = sub.hours && sub.hours.length ? sub.hours : [sub.hour];
    if (!hours.includes(localHour)) continue;

    const iso = localISOFromOffset(sub.tzOffset, now);
    const precept = preceptForDate(iso);
    const isEveningOnly = localHour === 22 && sub.hour !== 22 && hours.includes(22);
    const payload = isEveningOnly
      ? { title: "Tideline", body: "Log the day." }
      : { title: precept.title, body: precept.prompt };

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify(payload),
      );
      sent += 1;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 410 || status === 404) {
        await deleteSub(sub.endpoint);
        gone += 1;
      } else {
        errors.push(String((err as Error).message ?? err));
      }
    }
  }

  res.status(200).json({ ok: true, sent, gone, errors: errors.slice(0, 5) });
}
