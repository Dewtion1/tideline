export function BarList({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div>
      {items.map((i) => (
        <div className="bar-row" key={i.label}>
          <span className="hint">{i.label}</span>
          <div className="bar-track" aria-hidden="true">
            <div className="bar-fill" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
          <span className="num">{i.value}</span>
        </div>
      ))}
    </div>
  );
}

const FORTNIGHT_W = 300;
const FORTNIGHT_H = 90;

export function SleepFortnight({
  values,
}: {
  values: { date: string; hrs?: number }[];
}) {
  const n = values.length || 1;
  const gap = 2;
  const barW = (FORTNIGHT_W - gap * (n - 1)) / n;
  return (
    <svg
      viewBox={`0 0 ${FORTNIGHT_W} ${FORTNIGHT_H}`}
      width="100%"
      height="90"
      role="img"
      aria-label="Sleep hours for the last fourteen nights"
    >
      <line
        x1="0"
        x2={FORTNIGHT_W}
        y1={FORTNIGHT_H - (6 / 12) * (FORTNIGHT_H - 8) - 4}
        y2={FORTNIGHT_H - (6 / 12) * (FORTNIGHT_H - 8) - 4}
        stroke="#C3CCC6"
        strokeDasharray="2 3"
      />
      {values.map((v, i) => {
        const hrs = v.hrs;
        const h = hrs == null ? 0 : Math.min(12, hrs) / 12 * (FORTNIGHT_H - 8);
        const x = i * (barW + gap);
        const y = FORTNIGHT_H - 4 - h;
        const low = hrs != null && hrs < 6;
        return (
          <rect
            key={v.date}
            x={x}
            y={hrs == null ? FORTNIGHT_H - 5 : y}
            width={barW}
            height={hrs == null ? 1 : h}
            fill={low ? "#A8442F" : "#1B333D"}
          />
        );
      })}
    </svg>
  );
}
