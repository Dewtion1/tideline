import type { Scale5 } from "../types";

export function Scale({
  value,
  onChange,
  labelledBy,
}: {
  value?: Scale5;
  onChange: (v: Scale5 | undefined) => void;
  labelledBy?: string;
}) {
  return (
    <div className="scale" role="radiogroup" aria-labelledby={labelledBy}>
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          className={value === n ? "on" : ""}
          onClick={() => onChange(value === n ? undefined : n)}
        >
          <span className="num">{n}</span>
        </button>
      ))}
    </div>
  );
}
