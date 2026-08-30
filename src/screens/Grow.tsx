import { useState } from "react";
import { diffDays, todayISO } from "../../shared/dates";
import { nid } from "../lib/ids";
import { useStore } from "../store/Store";
import type { Obligation, Person, Skill } from "../types";

export function Grow() {
  const { state, dispatch } = useStore();
  const ranked = [...state.skills].sort((a, b) => b.want - b.have - (a.want - a.have));
  const widest = ranked[0];
  const gap = widest ? widest.want - widest.have : 0;

  return (
    <>
      <section className="card">
        <p className="kicker">Competence · precept 17</p>
        {widest ? (
          <>
            <h2>{widest.name}</h2>
            <p className="headline-stat">
              <span className="num">{widest.have}</span>
              <span className="muted"> / </span>
              <span className="num">{widest.want}</span>
            </p>
            <p className="hint">
              Widest gap is {gap}. Have against need, sorted descending. The gap is the work.
            </p>
          </>
        ) : (
          <>
            <h2>Competence audit</h2>
            <p className="empty">No skills yet. Rate have against need, 1 to 5. The widest gap leads.</p>
          </>
        )}
        <ul className="list-reset" style={{ marginTop: "0.75rem" }}>
          {ranked.map((s) => (
            <SkillRow
              key={s.id}
              skill={s}
              onSave={(skill) => dispatch({ type: "UPSERT_SKILL", skill })}
              onDelete={() => dispatch({ type: "DELETE_SKILL", id: s.id })}
            />
          ))}
        </ul>
        <NewSkill onAdd={(skill) => dispatch({ type: "UPSERT_SKILL", skill })} />
      </section>

      <section className="card">
        <h2>Obligations</h2>
        <p className="kicker">Precept 15</p>
        {state.obligations.length === 0 && (
          <p className="empty">Nothing owed is listed. Add what, to whom, and a due date if you have one.</p>
        )}
        <ul className="list-reset">
          {state.obligations.map((o) => (
            <ObligationRow
              key={o.id}
              item={o}
              onSave={(obligation) => dispatch({ type: "UPSERT_OBLIGATION", obligation })}
              onDelete={() => dispatch({ type: "DELETE_OBLIGATION", id: o.id })}
            />
          ))}
        </ul>
        <NewObligation onAdd={(o) => dispatch({ type: "UPSERT_OBLIGATION", obligation: o })} />
      </section>

      <section className="card">
        <h2>People</h2>
        <p className="kicker">Precepts 4, 5, 20</p>
        {state.people.length === 0 && (
          <p className="empty">No people listed. Name, cadence in days, last contact.</p>
        )}
        <ul className="list-reset">
          {state.people.map((p) => (
            <PersonRow
              key={p.id}
              person={p}
              onSave={(person) => dispatch({ type: "UPSERT_PERSON", person })}
              onDelete={() => dispatch({ type: "DELETE_PERSON", id: p.id })}
            />
          ))}
        </ul>
        <NewPerson onAdd={(p) => dispatch({ type: "UPSERT_PERSON", person: p })} />
      </section>
    </>
  );
}

function SkillRow({
  skill,
  onSave,
  onDelete,
}: {
  skill: Skill;
  onSave: (s: Skill) => void;
  onDelete: () => void;
}) {
  const gap = skill.want - skill.have;
  return (
    <li style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--line)" }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <input
          type="text"
          value={skill.name}
          aria-label="Skill"
          onChange={(e) => onSave({ ...skill, name: e.target.value })}
          style={{ flex: "1 1 8rem" }}
        />
        <span className={`num ${gap >= 2 ? "ebb" : "muted"}`}>gap {gap}</span>
      </div>
      <div className="row" style={{ marginTop: "0.35rem" }}>
        <label className="row" style={{ gap: "0.3rem" }}>
          <span className="lbl" style={{ margin: 0 }}>
            Have
          </span>
          <input
            type="number"
            className="num"
            min={1}
            max={5}
            value={skill.have}
            onChange={(e) => onSave({ ...skill, have: clamp15(e.target.value) })}
            style={{ width: "4rem" }}
          />
        </label>
        <label className="row" style={{ gap: "0.3rem" }}>
          <span className="lbl" style={{ margin: 0 }}>
            Need
          </span>
          <input
            type="number"
            className="num"
            min={1}
            max={5}
            value={skill.want}
            onChange={(e) => onSave({ ...skill, want: clamp15(e.target.value) })}
            style={{ width: "4rem" }}
          />
        </label>
        <button type="button" className="ghost" onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}

function NewSkill({ onAdd }: { onAdd: (s: Skill) => void }) {
  const [name, setName] = useState("");
  const [have, setHave] = useState(1);
  const [want, setWant] = useState(3);
  return (
    <div className="stack" style={{ marginTop: "0.75rem" }}>
      <input type="text" placeholder="Skill" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="row">
        <label className="row" style={{ gap: "0.3rem" }}>
          <span className="lbl" style={{ margin: 0 }}>
            Have
          </span>
          <input
            type="number"
            className="num"
            min={1}
            max={5}
            value={have}
            onChange={(e) => setHave(clamp15(e.target.value))}
            style={{ width: "4rem" }}
          />
        </label>
        <label className="row" style={{ gap: "0.3rem" }}>
          <span className="lbl" style={{ margin: 0 }}>
            Need
          </span>
          <input
            type="number"
            className="num"
            min={1}
            max={5}
            value={want}
            onChange={(e) => setWant(clamp15(e.target.value))}
            style={{ width: "4rem" }}
          />
        </label>
      </div>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          if (!name.trim()) return;
          onAdd({ id: nid(), name: name.trim(), have, want });
          setName("");
        }}
      >
        Add skill
      </button>
    </div>
  );
}

function ObligationRow({
  item,
  onSave,
  onDelete,
}: {
  item: Obligation;
  onSave: (o: Obligation) => void;
  onDelete: () => void;
}) {
  const today = todayISO();
  const late = Boolean(item.due && !item.done && diffDays(item.due, today) < 0);
  return (
    <li style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--line)" }}>
      <label className="row">
        <input
          type="checkbox"
          checked={item.done}
          onChange={(e) => onSave({ ...item, done: e.target.checked })}
        />
        <input
          type="text"
          value={item.what}
          aria-label="What"
          onChange={(e) => onSave({ ...item, what: e.target.value })}
          style={{ flex: 1 }}
        />
      </label>
      <div className="row" style={{ marginTop: "0.35rem" }}>
        <input
          type="text"
          placeholder="To whom"
          value={item.who ?? ""}
          onChange={(e) => onSave({ ...item, who: e.target.value || undefined })}
          style={{ flex: "1 1 7rem" }}
        />
        <input
          type="date"
          value={item.due ?? ""}
          onChange={(e) => onSave({ ...item, due: e.target.value || undefined })}
          style={{ flex: "0 1 9rem" }}
        />
        <button type="button" className="ghost" onClick={onDelete}>
          Delete
        </button>
      </div>
      <p className={`hint ${late ? "overdue" : ""}`}>
        {item.due ? item.due : "no date set"}
        {late ? " · overdue" : ""}
      </p>
    </li>
  );
}

function NewObligation({ onAdd }: { onAdd: (o: Obligation) => void }) {
  const [what, setWhat] = useState("");
  const [who, setWho] = useState("");
  const [due, setDue] = useState("");
  return (
    <div className="stack" style={{ marginTop: "0.75rem" }}>
      <input type="text" placeholder="What" value={what} onChange={(e) => setWhat(e.target.value)} />
      <div className="row">
        <input
          type="text"
          placeholder="To whom"
          value={who}
          onChange={(e) => setWho(e.target.value)}
          style={{ flex: "1 1 7rem" }}
        />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={{ flex: "0 1 9rem" }} />
      </div>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          if (!what.trim()) return;
          onAdd({
            id: nid(),
            what: what.trim(),
            who: who.trim() || undefined,
            due: due || undefined,
            done: false,
          });
          setWhat("");
          setWho("");
          setDue("");
        }}
      >
        Add obligation
      </button>
    </div>
  );
}

function PersonRow({
  person,
  onSave,
  onDelete,
}: {
  person: Person;
  onSave: (p: Person) => void;
  onDelete: () => void;
}) {
  const today = todayISO();
  const overdue = !person.last || diffDays(today, person.last) >= person.cadence;
  return (
    <li style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--line)" }}>
      <div className="row">
        <input
          type="text"
          value={person.name}
          aria-label="Name"
          onChange={(e) => onSave({ ...person, name: e.target.value })}
          style={{ flex: "1 1 8rem" }}
        />
        <button type="button" className="ghost" onClick={onDelete}>
          Delete
        </button>
      </div>
      <div className="row" style={{ marginTop: "0.35rem" }}>
        <label className="row" style={{ gap: "0.3rem" }}>
          <span className="lbl" style={{ margin: 0 }}>
            Cadence (days)
          </span>
          <input
            type="number"
            className="num"
            min={1}
            value={person.cadence}
            onChange={(e) => onSave({ ...person, cadence: Math.max(1, Number(e.target.value) || 1) })}
            style={{ width: "4.5rem" }}
          />
        </label>
        <label className="row" style={{ gap: "0.3rem" }}>
          <span className="lbl" style={{ margin: 0 }}>
            Last
          </span>
          <input
            type="date"
            value={person.last ?? ""}
            onChange={(e) => onSave({ ...person, last: e.target.value || null })}
          />
        </label>
      </div>
      <p className={overdue ? "overdue" : "hint"}>
        {overdue ? "Cadence lapsed" : "Within cadence"}
        {person.last ? ` · last ${person.last}` : " · no contact logged"}
      </p>
      <button type="button" className="ghost" onClick={() => onSave({ ...person, last: today })}>
        Mark contacted today
      </button>
    </li>
  );
}

function NewPerson({ onAdd }: { onAdd: (p: Person) => void }) {
  const [name, setName] = useState("");
  const [cadence, setCadence] = useState(14);
  return (
    <div className="stack" style={{ marginTop: "0.75rem" }}>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="row" style={{ gap: "0.3rem" }}>
        <span className="lbl" style={{ margin: 0 }}>
          Cadence (days)
        </span>
        <input
          type="number"
          className="num"
          min={1}
          value={cadence}
          onChange={(e) => setCadence(Math.max(1, Number(e.target.value) || 1))}
          style={{ width: "4.5rem" }}
        />
      </label>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          if (!name.trim()) return;
          onAdd({ id: nid(), name: name.trim(), cadence, last: null });
          setName("");
        }}
      >
        Add person
      </button>
    </div>
  );
}

function clamp15(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.round(n)));
}
