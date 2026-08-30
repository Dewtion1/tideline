import { addDays, todayISO } from "../../shared/dates";
import { scoreForDate } from "../lib/score";
import { useStore } from "../store/Store";

const W = 300;
const H = 44;
const PAD = 2;

export function TidelineSpark() {
  const { state } = useStore();
  const today = todayISO();
  const points: { x: number; y: number; v: number | null }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = addDays(today, -i);
    const v = scoreForDate(state, date);
    const x = PAD + ((29 - i) / 29) * (W - PAD * 2);
    const y = v == null ? null : PAD + (1 - v) * (H - PAD * 2);
    points.push({ x, y: y ?? H - PAD, v });
  }

  const present = points.filter((p) => p.v != null);
  let d = "";
  if (present.length > 0) {
    const first = present[0]!;
    d = `M ${first.x} ${H - PAD} L ${first.x} ${first.y}`;
    for (const p of present) d += ` L ${p.x} ${p.y}`;
    const last = present[present.length - 1]!;
    d += ` L ${last.x} ${H - PAD} Z`;
  }

  const horizon = PAD + 0.5 * (H - PAD * 2);
  const todayX = PAD + (W - PAD * 2);

  return (
    <svg
      className="tideline-spark"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="44"
      role="img"
      aria-label="Thirty-day tideline of the composite day score"
    >
      <line
        x1={PAD}
        x2={W - PAD}
        y1={horizon}
        y2={horizon}
        stroke="#C9902B"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      {d && <path d={d} fill="#2F7D8C" fillOpacity="0.55" />}
      {present.length > 1 && (
        <polyline
          fill="none"
          stroke="#E3E7E1"
          strokeWidth="1"
          points={present.map((p) => `${p.x},${p.y}`).join(" ")}
        />
      )}
      <line x1={todayX} x2={todayX} y1={PAD} y2={H - PAD} stroke="#C9902B" strokeWidth="1.5" />
    </svg>
  );
}
