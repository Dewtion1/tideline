import type { Day, ISODate, Scale5 } from "../types";
import { Scale } from "./Scale";
import { Stepper } from "./Stepper";

export function DailyReading({
  date,
  day,
  onPatch,
}: {
  date: ISODate;
  day: Day;
  onPatch: (date: ISODate, patch: Partial<Day>) => void;
}) {
  return (
    <div className="stack">
      <div className="field">
        <span className="lbl" id={`sleep-${date}`}>
          Sleep hours
        </span>
        <Stepper value={day.sleepHrs} onChange={(v) => onPatch(date, { sleepHrs: v })} />
      </div>
      <div className="field">
        <label htmlFor={`bed-${date}`}>Bedtime (optional)</label>
        <input
          id={`bed-${date}`}
          type="time"
          value={day.bedAt ?? ""}
          onChange={(e) => onPatch(date, { bedAt: e.target.value || undefined })}
        />
      </div>
      <div className="field">
        <span className="lbl" id={`q-${date}`}>
          Quality
        </span>
        <Scale
          labelledBy={`q-${date}`}
          value={day.quality}
          onChange={(v) => onPatch(date, { quality: v as Scale5 | undefined })}
        />
      </div>
      <div className="field">
        <span className="lbl" id={`m-${date}`}>
          Mood
        </span>
        <Scale
          labelledBy={`m-${date}`}
          value={day.mood}
          onChange={(v) => onPatch(date, { mood: v as Scale5 | undefined })}
        />
      </div>
      <div className="field">
        <span className="lbl" id={`e-${date}`}>
          Energy
        </span>
        <Scale
          labelledBy={`e-${date}`}
          value={day.energy}
          onChange={(v) => onPatch(date, { energy: v as Scale5 | undefined })}
        />
      </div>
      <div className="field">
        <label htmlFor={`scr-${date}`}>Screen minutes</label>
        <input
          id={`scr-${date}`}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          className="num"
          value={day.screen ?? ""}
          placeholder="minutes"
          onChange={(e) => {
            const raw = e.target.value;
            onPatch(date, { screen: raw === "" ? undefined : Math.max(0, Number(raw)) });
          }}
        />
      </div>
      <div className="field">
        <label htmlFor={`win-${date}`}>One-line win</label>
        <input
          id={`win-${date}`}
          type="text"
          value={day.win ?? ""}
          onChange={(e) => onPatch(date, { win: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}
