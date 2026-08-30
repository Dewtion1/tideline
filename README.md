# Tideline

A private, local-first, installable PWA. One module for the daily figures that show how a life is going — sleep, mood, energy, screen, urges, money, competence, obligations, people — then trends and cross-readings.

The app records. It does not cheer.

There is no account, no sync, no analytics, and no third-party script that phones home. Wellbeing data lives in IndexedDB (`idb-keyval`, one key, whole-state blob). The only server contact is an optional Web Push subscription: endpoint, keys, timezone offset, and hour(s).

## Run locally

```bash
npm ci
npm run dev
```

A `package-lock.json` is committed so Vercel and local installs resolve the same tree (`npm ci`).

The Vite server binds to `http://127.0.0.1:43147`.

Push subscribe/cron handlers are Vercel functions. They are not served by `npm run dev`. The rest of the app — logging, charts, export, offline — works without them.

To exercise the API locally:

```bash
npx vercel dev
```

## Build

```bash
npm run build
npm run preview
```

`npm run build` typechecks and emits a static `dist/` plus a Workbox service worker that precaches the app shell. Cache-first for assets. Offline is the normal state.

Icons live in `public/icons/` (petrol field, brass tideline mark). `npm run build` regenerates them before Vite runs so a missing or corrupted PNG cannot fail injectManifest:

```bash
npm run icons
```

## Deploy on Vercel

1. Import the repo. Framework: Vite. Output: `dist`. Build: `npm run build` (icons, `tsc -b`, Vite, Workbox injectManifest).
2. `vercel.json` keeps `/api/:path*` on the serverless functions, then SPA-falls back everything else to `index.html`. Hourly cron hits `/api/cron`.
3. The app is usable with zero env vars. Push is optional. Do not set VAPID keys unless you want dispatch.

### Environment variables (push)

| Variable | Required for push | Purpose |
| --- | --- | --- |
| `VAPID_PUBLIC_KEY` | yes | Web Push public key |
| `VAPID_PRIVATE_KEY` | yes | Web Push private key |
| `VAPID_SUBJECT` | yes | `mailto:` or `https:` contact, required by web-push |
| `VITE_VAPID_PUBLIC_KEY` | no | Same public key baked into the client build. If omitted, the client reads `GET /api/subscribe` |
| `KV_REST_API_URL` | production push | Upstash Redis REST URL (the former Vercel KV shape) |
| `KV_REST_API_TOKEN` | production push | Upstash Redis REST token |
| `CRON_SECRET` | recommended | Vercel Cron sends `Authorization: Bearer $CRON_SECRET` |
| `SUBS_FILE` | no | File path for the local/dev subscription fallback (default `.data/subscriptions.json`) |

Generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

Vercel KV is no longer offered. Tideline talks to **Upstash Redis REST** when `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set — the same pair Vercel KV used to inject. Create a Redis database on Upstash (or the Vercel Marketplace Redis integration) and paste those two values.

Without KV, `POST /api/subscribe` still implements the same shape and writes `.data/subscriptions.json`. That file is fine on a laptop. On Vercel it is **ephemeral** (per-instance `/tmp`-class storage). Production push dispatch needs KV.

Hourly cron: for each stored subscription whose local hour matches, the function derives today's precept with the same `PRECEPTS[floor(epochDays) mod 21]` rule as the client and sends `{ title, body }` with the original prompt only. If the evening nudge is on, 22:00 sends `Log the day.` A `410 Gone` or `404` deletes the subscription.

Settings → Enable push calls `POST /api/subscribe`. Turning it off calls `DELETE /api/subscribe`. If VAPID keys are missing, the toggle explains that and the rest of the app is unchanged.

## iOS: Add to Home Screen

On iPhone/iPad, open Share → **Add to Home Screen**.

Without that:

- Web Push will not work.
- Safari may evict IndexedDB after about seven days unused. Installation is load-bearing for **data retention**, not just notifications.

First-run onboarding states this. A one-time card on Today repeats it for iOS until dismissed.

## Privacy model

**Never leaves the device**

- Daily readings (sleep, bedtime, quality, mood, energy, screen, win, precept note)
- Urge log
- Accounts, balances, monthly flows
- Skills, obligations, people
- Weekly review answers
- The whole-state JSON unless you tap Download JSON

**May leave the device, if you enable push**

- Push `endpoint`
- Push `keys` (`p256dh`, `auth`)
- `tzOffset` (minutes)
- Hour(s) to fire

No user id, no name, no log data. Export is a file you choose to download. Erase everything wipes IndexedDB after a confirm.

## Stack

React 18, Vite, TypeScript, `vite-plugin-pwa`, `idb-keyval`, hand-rolled SVG, one `useReducer` persisted on a 700ms debounce. Server: Vercel static hosting, `/api/subscribe`, hourly `/api/cron`, `web-push`.
