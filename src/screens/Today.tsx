import { useEffect, useState } from "react";
import { addDays, diffDays, isSunday, todayISO } from "../../shared/dates";
import { preceptForDate } from "../../shared/precepts";
import { DailyReading } from "../components/DailyReading";
import { isIos, isStandalone } from "../lib/install";
import { navigate } from "../lib/route";
import { nid } from "../lib/ids";
import { daysClear } from "../store/reducer";
import { useStore } from "../store/Store";
import type { Day, Urge, UrgeTrigger } from "../types";
import { URGE_TRIGGERS } from "../types";

export function Today() {
  const { state, dispatch } = useStore();
  const today = todayISO();
  const day = state.days[today] ?? {};
  const precept = preceptForDate(today);
  const clear = daysClear(state, today);
  const patch = (date: string, p: Partial<Day>) => dispatch({ type: "PATCH_DAY", date, patch: p });

  return (
    <>
      <InstallHint />
      <section className="card">
        <p className="kicker">Precept {precept.n} of 21</p>
        <h2>{precept.title}</h2>
        <p className="lede">{precept.prompt}</p>
        <ol className="hint" style={{ paddingLeft: "1.1rem" }}>
          {precept.suggestions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <div className="field" style={{ marginTop: "0.75rem" }}>
          <label htmlFor="precept-note">Where it landed</label>
          <textarea
            id="precept-note"
            value={day.preceptNote ?? ""}
            onChange={(e) => patch(today, { preceptNote: e.target.value || undefined })}
          />
        </div>
        <div className="actions">
          <button type="button" className="ghost" onClick={() => navigate("/precepts")}>
            All 21 precepts
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Daily reading</h2>
        <p className="hint">Every field is optional. Under forty-five seconds is enough.</p>
        <DailyReading date={today} day={day} onPatch={patch} />
      </section>

      <section className="card">
        <h2>Pattern log</h2>
        <p className="kicker">Days clear</p>
        <p className="headline-stat">{clear}</p>
        <p className="hint">
          Days since last acted-on urge. Log every urge, acted on or not. A lapse resets this
          counter and nothing else.
        </p>
        <UrgeForm />
      </section>

      <OwedBlock />

      {isSunday(today) && (
        <section className="card">
          <p className="kicker">Sunday</p>
          <h2>Weekly review</h2>
          <p className="hint">Walk the week. Three short questions. Stored on this week only.</p>
          <button type="button" className="ghost" onClick={() => navigate("/review")}>
            Open this week's review
          </button>
        </section>
      )}
    </>
  );
}

function InstallHint() {
  const { state, dispatch } = useStore();
  if (isStandalone()) return null;
  if (isIos()) {
    if (state.meta.iosHintDismissed) return null;
    return (
      <aside className="install-card">
        <p className="kicker" style={{ color: "#C9902B" }}>
          iOS
        </p>
        <p>
          Share → Add to Home Screen. Without that, notifications will not work, and iOS may clear
          IndexedDB after about seven days idle. Installation is how the record stays.
        </p>
        <button type="button" className="ghost" onClick={() => dispatch({ type: "DISMISS_IOS_HINT" })}>
          Dismiss
        </button>
      </aside>
    );
  }
  return <AndroidInstall />;
}

function AndroidInstall() {
  const [promptEvent, setPromptEvent] = useState<null | {
    prompt: () => Promise<void>;
  }>(null);
  const [hidden, setHidden] = useState(false);

  useBindInstall(setPromptEvent);

  if (hidden || !promptEvent) return null;
  return (
    <aside className="install-card">
      <p className="kicker" style={{ color: "#C9902B" }}>
        Install
      </p>
      <p>Add Tideline to the home screen so the record survives and notifications can fire.</p>
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            void promptEvent.prompt();
          }}
        >
          Install Tideline
        </button>
        <button type="button" className="ghost" onClick={() => setHidden(true)}>
          Not now
        </button>
      </div>
    </aside>
  );
}

function useBindInstall(setPromptEvent: (e: { prompt: () => Promise<void> } | null) => void) {
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as Event & { prompt: () => Promise<void> });
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [setPromptEvent]);
}

function UrgeForm() {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<UrgeTrigger | "">("");
  const [acted, setActed] = useState(false);
  const [note, setNote] = useState("");
  const [reflection, setReflection] = useState<Urge | null>(null);

  const submit = () => {
    const now = new Date();
    const urge: Urge = {
      id: nid(),
      date: todayISO(now),
      hour: now.getHours(),
      trigger: trigger || undefined,
      acted,
      note: note || undefined,
    };
    dispatch({ type: "ADD_URGE", urge });
    setOpen(false);
    setTrigger("");
    setActed(false);
    setNote("");
    setReflection(urge.acted ? urge : null);
  };

  return (
    <>
      {!open && (
        <div className="actions">
          <button type="button" onClick={() => setOpen(true)}>
            Log an urge
          </button>
        </div>
      )}
      {open && (
        <div className="stack" style={{ marginTop: "0.75rem" }}>
          <div className="field">
            <label htmlFor="urge-trigger">Trigger</label>
            <select
              id="urge-trigger"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as UrgeTrigger | "")}
            >
              <option value="">Not given</option>
              {URGE_TRIGGERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <label className="row" style={{ gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={acted}
              onChange={(e) => setActed(e.target.checked)}
            />
            <span>Acted on</span>
          </label>
          <div className="field">
            <label htmlFor="urge-note">Note</label>
            <input id="urge-note" type="text" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="actions">
            <button type="button" onClick={submit}>
              Save urge
            </button>
            <button type="button" className="ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {reflection && <ActedReflection urge={reflection} days={state.days} />}
    </>
  );
}

function ActedReflection({
  urge,
  days,
}: {
  urge: Urge;
  days: Record<string, Day>;
}) {
  const d0 = days[urge.date];
  const d1 = days[addDays(urge.date, -1)];
  const d2 = days[addDays(urge.date, -2)];
  const line = (label: string, d?: Day) => {
    const sleep = d?.sleepHrs != null ? `${d.sleepHrs.toFixed(1)} h` : "—";
    const scr = d?.screen != null ? `${d.screen} min` : "—";
    return `${label}: sleep ${sleep}, screen ${scr}`;
  };
  return (
    <div className="card" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
      <p className="kicker">Preceding days</p>
      <p className="hint">{line("Today", d0)}</p>
      <p className="hint">{line("Yesterday", d1)}</p>
      <p className="hint">{line("Two days back", d2)}</p>
    </div>
  );
}

function OwedBlock() {
  const { state } = useStore();
  const today = todayISO();
  const dueSoon = state.obligations.filter((o) => {
    if (o.done) return false;
    if (!o.due) return false;
    const d = diffDays(o.due, today);
    return d <= 3;
  });
  const lapsed = state.people.filter((p) => {
    if (!p.last) return true;
    return diffDays(today, p.last) >= p.cadence;
  });
  if (dueSoon.length === 0 && lapsed.length === 0) return null;
  return (
    <section className="card">
      <h2>Owed and overdue</h2>
      {dueSoon.length > 0 && (
        <ul className="list-reset">
          {dueSoon.map((o) => {
            const late = diffDays(o.due!, today) < 0;
            return (
              <li key={o.id} className={late ? "overdue" : undefined}>
                <span className="num">{o.due}</span> {o.what}
                {o.who ? ` · ${o.who}` : ""}
              </li>
            );
          })}
        </ul>
      )}
      {lapsed.length > 0 && (
        <ul className="list-reset" style={{ marginTop: "0.5rem" }}>
          {lapsed.map((p) => (
            <li key={p.id} className="overdue">
              {p.name} · cadence {p.cadence}d
              {p.last ? ` · last ${p.last}` : " · no contact logged"}
            </li>
          ))}
        </ul>
      )}
      <div className="actions">
        <button type="button" className="ghost" onClick={() => navigate("/grow")}>
          Open Grow
        </button>
      </div>
    </section>
  );
}
