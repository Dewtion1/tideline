import { useRef, useState } from "react";
import { addDays, todayISO, weekKey } from "../../shared/dates";
import { SleepFortnight } from "../components/Bars";
import { correlations } from "../lib/correlations";
import { dayHasReading, urgeCountOn } from "../lib/score";
import { navigate } from "../lib/route";
import { looksLikeState, migrate } from "../store/migrate";
import { useStore } from "../store/Store";
import type { ISODate, State } from "../types";

type Metric = "sleep" | "mood" | "energy" | "screen" | "urges" | "logged";

const METRICS: { id: Metric; label: string; invert: boolean }[] = [
  { id: "sleep", label: "Sleep", invert: false },
  { id: "mood", label: "Mood", invert: false },
  { id: "energy", label: "Energy", invert: false },
  { id: "screen", label: "Screen", invert: true },
  { id: "urges", label: "Urges", invert: true },
  { id: "logged", label: "Days logged", invert: false },
];

export function Trends() {
  const { state, dispatch } = useStore();
  const today = todayISO();
  const thisSun = weekKey(today);
  const lastSun = addDays(thisSun, -7);
  const thisWeek = weekStats(state, thisSun);
  const lastWeek = weekStats(state, lastSun);
  const corr = correlations(state);
  const fortnight = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today, -(13 - i));
    return { date, hrs: state.days[date]?.sleepHrs };
  });

  return (
    <>
      <section className="card">
        <h2>Week on week</h2>
        <p className="hint">
          This week against the week before. Down is flood (teal) for screen and urges; ebb (red)
          for everything else.
        </p>
        <div style={{ marginTop: "0.6rem" }}>
          {METRICS.map((m) => {
            const a = thisWeek[m.id];
            const b = lastWeek[m.id];
            return (
              <div
                key={m.id}
                className="row"
                style={{
                  justifyContent: "space-between",
                  borderBottom: "1px solid var(--line)",
                  padding: "0.45rem 0",
                }}
              >
                <span>{m.label}</span>
                <span className="num">
                  {fmtAvg(a)}
                  <Delta current={a} prior={b} invert={m.invert} />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2>Sleep, last fortnight</h2>
        <p className="hint">Nights under six hours are marked in ebb red. The dashed line is six hours.</p>
        <SleepFortnight values={fortnight} />
      </section>

      <section className="card">
        <h2>Cross-readings</h2>
        {corr.length === 0 ? (
          <p className="empty">
            Associations appear after at least five paired days, and only when |r| is above 0.3.
            Log more days.
          </p>
        ) : (
          <ul className="list-reset">
            {corr.map((c) => (
              <li key={c.id} style={{ padding: "0.55rem 0", borderBottom: "1px solid var(--line)" }}>
                <p>{c.english}</p>
                <p className="hint">
                  {c.pair} · n={c.n} · r={c.r.toFixed(2)} · {c.strength}
                  {c.kind === "lag" ? " · lagged" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="hint" style={{ marginTop: "0.75rem" }}>
          Associations, not causes. Under about 0.4 is worth ignoring.
        </p>
      </section>

      <section className="card">
        <h2>Weekly review</h2>
        <p className="hint">Sunday walks the week. You can open it any day.</p>
        <button type="button" className="ghost" onClick={() => navigate("/review")}>
          Open weekly review
        </button>
      </section>

      <DataPanel
        state={state}
        onImport={(next) => dispatch({ type: "IMPORT", state: next })}
        onErase={() => dispatch({ type: "ERASE" })}
      />
    </>
  );
}

function weekStats(state: State, sunday: ISODate): Record<Metric, number | null> {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
  const mean = (vals: number[]) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null);
  const nums = (vals: (number | undefined)[]) => vals.filter((n): n is number => n != null);
  const sleep = mean(nums(dates.map((d) => state.days[d]?.sleepHrs)));
  const mood = mean(nums(dates.map((d) => state.days[d]?.mood)));
  const energy = mean(nums(dates.map((d) => state.days[d]?.energy)));
  const screen = mean(nums(dates.map((d) => state.days[d]?.screen)));
  const urges = dates.reduce((s, d) => s + urgeCountOn(state, d), 0);
  const logged = dates.filter((d) => dayHasReading(state.days[d]) || urgeCountOn(state, d) > 0).length;
  return { sleep, mood, energy, screen, urges, logged };
}

function fmtAvg(n: number | null): string {
  if (n == null) return "—";
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function Delta({
  current,
  prior,
  invert,
}: {
  current: number | null;
  prior: number | null;
  invert: boolean;
}) {
  if (current == null || prior == null || current === prior) {
    return <span className="muted"> · —</span>;
  }
  const down = current < prior;
  const good = invert ? down : !down;
  const arrow = current > prior ? "↑" : "↓";
  return <span className={good ? "flood" : "ebb"}> · {arrow}</span>;
}

function DataPanel({
  state,
  onImport,
  onErase,
}: {
  state: State;
  onImport: (s: State) => void;
  onErase: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const download = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tideline-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (file: File) => {
    setErr(null);
    try {
      const text = await file.text();
      const raw: unknown = JSON.parse(text);
      if (!looksLikeState(raw)) {
        setErr("That file is not a Tideline export.");
        return;
      }
      onImport(migrate(raw));
    } catch {
      setErr("Could not read that file.");
    }
  };

  return (
    <section className="card">
      <h2>Data</h2>
      <p className="hint">Export is a JSON file on this device. Import replaces the current record.</p>
      <div className="actions">
        <button type="button" onClick={download}>
          Download JSON
        </button>
        <button type="button" className="ghost" onClick={() => fileRef.current?.click()}>
          Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {err && <p className="ebb">{err}</p>}
      <hr className="rule" />
      {!confirm ? (
        <button type="button" className="danger" onClick={() => setConfirm(true)}>
          Erase everything
        </button>
      ) : (
        <div className="stack">
          <p>This deletes the local record. There is no undo and no cloud copy.</p>
          <div className="actions">
            <button
              type="button"
              className="danger"
              onClick={() => {
                onErase();
                setConfirm(false);
              }}
            >
              Erase everything
            </button>
            <button type="button" className="ghost" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
