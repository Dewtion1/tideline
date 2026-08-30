import { addDays, formatWeekRange, isSunday, todayISO, weekKey } from "../../shared/dates";
import { dayHasReading, urgeCountOn } from "../lib/score";
import { daysClear } from "../store/reducer";
import { useStore } from "../store/Store";

export function Review() {
  const { state, dispatch } = useStore();
  const today = todayISO();
  const key = weekKey(today);
  const review = state.weeks?.[key] ?? {};
  const days = Array.from({ length: 7 }, (_, i) => addDays(key, i));
  const sleep = avg(days.map((d) => state.days[d]?.sleepHrs));
  const mood = avg(days.map((d) => state.days[d]?.mood));
  const energy = avg(days.map((d) => state.days[d]?.energy));
  const screen = avg(days.map((d) => state.days[d]?.screen));
  const urges = days.reduce((s, d) => s + urgeCountOn(state, d), 0);
  const logged = days.filter((d) => dayHasReading(state.days[d])).length;

  const set = (field: "q1" | "q2" | "q3", value: string) => {
    dispatch({ type: "SAVE_WEEK", key, review: { ...review, [field]: value || undefined } });
  };

  return (
    <section className="card">
      <p className="kicker">Weekly review</p>
      <h2>{formatWeekRange(key)}</h2>
      {!isSunday(today) && (
        <p className="hint">Opened off Sunday. The week is still the Sunday-starting one that contains today.</p>
      )}
      <div className="grid4" style={{ marginTop: "0.75rem", marginBottom: "0.85rem" }}>
        <div>
          <p className="kicker">Sleep</p>
          <p className="num">{sleep == null ? "—" : sleep.toFixed(1)}</p>
        </div>
        <div>
          <p className="kicker">Mood</p>
          <p className="num">{mood == null ? "—" : mood.toFixed(1)}</p>
        </div>
        <div>
          <p className="kicker">Energy</p>
          <p className="num">{energy == null ? "—" : energy.toFixed(1)}</p>
        </div>
        <div>
          <p className="kicker">Screen</p>
          <p className="num">{screen == null ? "—" : Math.round(screen)}</p>
        </div>
      </div>
      <p className="hint">
        Urges this week: <span className="num">{urges}</span> · days with a reading:{" "}
        <span className="num">{logged}</span> · days clear now:{" "}
        <span className="num">{daysClear(state, today)}</span>
      </p>
      <hr className="rule" />
      <div className="field">
        <label htmlFor="q1">What held its shape this week.</label>
        <textarea id="q1" value={review.q1 ?? ""} onChange={(e) => set("q1", e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="q2">What drifted.</label>
        <textarea id="q2" value={review.q2 ?? ""} onChange={(e) => set("q2", e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="q3">What you will keep, drop, or change.</label>
        <textarea id="q3" value={review.q3 ?? ""} onChange={(e) => set("q3", e.target.value)} />
      </div>
    </section>
  );
}

function avg(vals: (number | undefined)[]): number | null {
  const xs = vals.filter((n): n is number => n != null);
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
