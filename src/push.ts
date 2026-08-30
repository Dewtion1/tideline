import type { Settings } from "./types";

export type PushConfig = {
  configured: boolean;
  vapidPublicKey: string | null;
};

export async function fetchPushConfig(): Promise<PushConfig> {
  const envKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  try {
    const res = await fetch("/api/subscribe", { method: "GET" });
    if (!res.ok) {
      return { configured: Boolean(envKey), vapidPublicKey: envKey ?? null };
    }
    const data = (await res.json()) as PushConfig;
    return {
      configured: Boolean(data.configured && data.vapidPublicKey) || Boolean(envKey),
      vapidPublicKey: data.vapidPublicKey ?? envKey ?? null,
    };
  } catch {
    return { configured: Boolean(envKey), vapidPublicKey: envKey ?? null };
  }
}

function urlBase64ToUint8Array(base64: string): BufferSource {
  const padded = base64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (padded.length % 4)) % 4);
  const raw = atob(padded + pad);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out.buffer as ArrayBuffer;
}

export async function subscribePush(settings: Settings, vapidPublicKey: string): Promise<void> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push is not available in this browser.");
  }
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Notification permission was not granted.");
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
  const json = sub.toJSON();
  const hours = uniqueHours(settings);
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: json.keys,
      tzOffset: new Date().getTimezoneOffset(),
      hour: settings.pushHour,
      hours,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Subscribe failed.");
  }
}

export async function unsubscribePush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    try {
      await fetch("/api/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
    } catch {
      /* still drop the local subscription */
    }
    await sub.unsubscribe();
  }
}

export function uniqueHours(settings: Settings): number[] {
  const hours = [settings.pushHour];
  if (settings.eveningNudge) hours.push(22);
  return [...new Set(hours)];
}
