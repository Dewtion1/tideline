export function Stepper({
  value,
  onChange,
  min = 0,
  max = 24,
  step = 0.5,
  emptyLabel = "—",
}: {
  value?: number;
  onChange: (v: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  emptyLabel?: string;
}) {
  const dec = () => {
    if (value == null) {
      onChange(min);
      return;
    }
    const next = Math.round((value - step) * 10) / 10;
    if (next < min) onChange(undefined);
    else onChange(next);
  };
  const inc = () => {
    if (value == null) {
      onChange(min + step);
      return;
    }
    const next = Math.round((value + step) * 10) / 10;
    onChange(Math.min(max, next));
  };
  return (
    <div className="stepper">
      <button type="button" onClick={dec} aria-label="Decrease">
        −
      </button>
      <div className="val num" aria-live="polite">
        {value == null ? emptyLabel : value.toFixed(1)}
      </div>
      <button type="button" onClick={inc} aria-label="Increase">
        +
      </button>
    </div>
  );
}
