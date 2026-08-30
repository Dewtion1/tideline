import { todayISO } from "../../shared/dates";
import { PRECEPTS, preceptIndexForDate } from "../../shared/precepts";

export function Precepts() {
  const today = todayISO();
  const idx = preceptIndexForDate(today);
  return (
    <section className="card">
      <h2>Twenty-one precepts</h2>
      <p className="hint">
        Titles from The Way to Happiness, in order. Today's precept is highlighted. The prompts
        here are original to Tideline.
      </p>
      <ol className="list-reset" style={{ marginTop: "0.75rem" }}>
        {PRECEPTS.map((p, i) => (
          <li
            key={p.n}
            style={{
              padding: "0.65rem 0.5rem",
              borderTop: "1px solid var(--line)",
              background: i === idx ? "var(--paper)" : undefined,
              outline: i === idx ? "1px solid var(--brass)" : undefined,
              outlineOffset: i === idx ? "-1px" : undefined,
            }}
          >
            <p className="kicker">
              {p.n}
              {i === idx ? " · today" : ""}
            </p>
            <h3>{p.title}</h3>
            {i === idx && <p className="hint" style={{ marginTop: "0.35rem" }}>{p.prompt}</p>}
          </li>
        ))}
      </ol>
      <p className="hint" style={{ marginTop: "0.85rem" }}>
        Booklet:{" "}
        <a href="https://www.thewaytohappiness.org/" target="_blank" rel="noreferrer">
          thewaytohappiness.org
        </a>
      </p>
    </section>
  );
}
