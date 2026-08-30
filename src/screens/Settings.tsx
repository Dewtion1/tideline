import { useEffect, useState } from "react";
import { fetchPushConfig, subscribePush, unsubscribePush, type PushConfig } from "../push";
import { useStore } from "../store/Store";

export function Settings() {
  const { state, dispatch } = useStore();
  const [cfg, setCfg] = useState<PushConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetchPushConfig().then(setCfg);
  }, []);

  const hour = state.settings.pushHour;
  const evening = state.settings.eveningNudge;
  const enabled = state.settings.pushEnabled;

  const togglePush = async (on: boolean) => {
    setMsg(null);
    if (!on) {
      setBusy(true);
      try {
        await unsubscribePush();
        dispatch({ type: "PATCH_SETTINGS", patch: { pushEnabled: false } });
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Could not unsubscribe.");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!cfg?.vapidPublicKey) {
      setMsg("Push is not configured on this deploy. The rest of the app still works.");
      return;
    }
    setBusy(true);
    try {
      await subscribePush({ ...state.settings, pushEnabled: true }, cfg.vapidPublicKey);
      dispatch({ type: "PATCH_SETTINGS", patch: { pushEnabled: true } });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not subscribe.");
    } finally {
      setBusy(false);
    }
  };

  const persistHours = async (nextHour: number, nextEvening: boolean) => {
    dispatch({
      type: "PATCH_SETTINGS",
      patch: { pushHour: nextHour, eveningNudge: nextEvening },
    });
    if (!state.settings.pushEnabled || !cfg?.vapidPublicKey) return;
    try {
      await subscribePush(
        { ...state.settings, pushHour: nextHour, eveningNudge: nextEvening, pushEnabled: true },
        cfg.vapidPublicKey,
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not update the subscription.");
    }
  };

  return (
    <section className="card">
      <h2>Settings</h2>
      <p className="hint">
        Notifications are optional. The daily precept uses the same date function as the Today card.
        The evening nudge, if on, fires at 22:00 local.
      </p>

      <div className="field" style={{ marginTop: "0.85rem" }}>
        <label htmlFor="push-hour">Precept hour</label>
        <input
          id="push-hour"
          type="number"
          className="num"
          min={0}
          max={23}
          value={hour}
          onChange={(e) => {
            const h = Math.min(23, Math.max(0, Number(e.target.value) || 0));
            void persistHours(h, evening);
          }}
        />
      </div>

      <label className="row" style={{ marginTop: "0.75rem" }}>
        <input
          type="checkbox"
          checked={evening}
          onChange={(e) => void persistHours(hour, e.target.checked)}
        />
        <span>Evening log-the-day nudge at 22:00</span>
      </label>

      <label className="row" style={{ marginTop: "0.75rem" }}>
        <input
          type="checkbox"
          checked={enabled}
          disabled={busy}
          onChange={(e) => void togglePush(e.target.checked)}
        />
        <span>Enable push</span>
      </label>

      {cfg && !cfg.configured && (
        <p className="hint" style={{ marginTop: "0.75rem" }}>
          This install has no VAPID keys. The app works without push. To enable dispatch on Vercel,
          set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, and KV_REST_API_URL plus
          KV_REST_API_TOKEN (Upstash Redis REST, the former Vercel KV shape). Optionally set
          VITE_VAPID_PUBLIC_KEY so the client does not need a GET to learn the public key.
        </p>
      )}
      {msg && <p className="ebb">{msg}</p>}

      <hr className="rule" />
      <p className="kicker">Privacy</p>
      <p className="hint">
        Days, urges, money, skills, obligations, people, and reviews never leave this device except
        as a file you download. A push subscription stores only endpoint, keys, timezone offset, and
        hour(s).
      </p>
    </section>
  );
}
