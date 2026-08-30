import { useState } from "react";
import { addDays, formatShort, todayISO } from "../../shared/dates";
import { BarList } from "../components/Bars";
import { DailyReading } from "../components/DailyReading";
import { useStore } from "../store/Store";
import type { Day } from "../types";
import { URGE_TRIGGERS } from "../types";

const BUCKETS = [
  { label: "00–04", start: 0 },
  { label: "04–08", start: 4 },
  { label: "08–12", start: 8 },
  { label: "12–16", start: 12 },
  { label: "16–20", start: 16 },
  { label: "20–24", start: 20 },
];

export function Log() {
  const { state, dispatch } = useStore();
  const today = todayISO();
  const dates = Array.from({ length: 21 }, (_, i) => addDays(today, -i));
  const [open, setOpen] = useState<string | null>(today);
  const patch = (date: string, p: Partial<Day>) => dispatch({ type: "PATCH_DAY", date, patch: p });

  const buckets = BUCKETS.map((b) => ({
    label: b.label,
    value: state.urges.filter((u) => u.hour >= b.start && u.hour < b.start + 4).length,
  }));
  const peak = buckets.reduce((a, b) => (b.value > a.value ? b : a), buckets[0]!);
  const triggers = URGE_TRIGGERS.map((t) => ({
    label: t,
    value: state.urges.filter((u) => u.trigger === t).length,
  }));

  const recent = [...state.urges].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.hour - a.hour;
  });

  return (
    <>
      <section className="card">
        <h2>Last 21 days</h2>
        <p className="hint">Tap a day to expand and backfill. Empty days are still days.</p>
        <div className="day-list">
          {dates.map((date) => {
            const d = state.days[date];
            const urges = state.urges.filter((u) => u.date === date).length;
            const bits = [
              d?.sleepHrs != null ? `${d.sleepHrs.toFixed(1)}h` : null,
              d?.mood != null ? `m${d.mood}` : null,
              d?.energy != null ? `e${d.energy}` : null,
              d?.screen != null ? `${d.screen}m` : null,
              urges ? `${urges} urge${urges === 1 ? "" : "s"}` : null,
            ].filter(Boolean);
            return (
              <div key={date}>
                <button
                  type="button"
                  className="day-row"
                  aria-expanded={open === date}
                  onClick={() => setOpen(open === date ? null : date)}
                >
                  <span>{formatShort(date)}</span>
                  <span className="num muted">{bits.length ? bits.join(" · ") : "—"}</span>
                </button>
                {open === date && (
                  <div className="expand">
                    <DailyReading date={date} day={d ?? {}} onPatch={patch} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2>Urges by time of day</h2>
        {state.urges.length === 0 ? (
          <p className="empty">No urges logged. The histogram is the output; log every urge, acted on or not.</p>
        ) : (
          <>
            <BarList items={buckets} />
            {peak.value > 0 && (peak.label === "20–24" || peak.label === "00–04") && (
              <p className="hint" style={{ marginTop: "0.7rem" }}>
                The weight sits in {peak.label}. That is an environment problem more often than a
                character one — where the phone charges, what the room is for after twenty-two.
              </p>
            )}
          </>
        )}
      </section>

      <section className="card">
        <h2>Triggers</h2>
        {state.urges.every((u) => !u.trigger) ? (
          <p className="empty">No triggers marked yet.</p>
        ) : (
          <BarList items={triggers} />
        )}
      </section>

      <section className="card">
        <h2>Recent entries</h2>
        {recent.length === 0 ? (
          <p className="empty">Nothing in the log. Use Log an urge on Today.</p>
        ) : (
          <ul className="list-reset">
            {recent.slice(0, 40).map((u) => (
              <li
                key={u.id}
                className="row"
                style={{
                  justifyContent: "space-between",
                  borderBottom: "1px solid var(--line)",
                  padding: "0.45rem 0",
                }}
              >
                <span>
                  <span className="num">{u.date}</span>{" "}
                  <span className="num">{String(u.hour).padStart(2, "0")}:00</span>
                  {u.trigger ? ` · ${u.trigger}` : ""}
                  {u.acted ? " · acted" : " · passed"}
                  {u.note ? ` · ${u.note}` : ""}
                </span>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => dispatch({ type: "DELETE_URGE", id: u.id })}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
