import { useState } from "react";
import { nid } from "../lib/ids";
import { useStore } from "../store/Store";
import type { Account, Flow } from "../types";

export function Money() {
  const { state, dispatch } = useStore();
  const liquid = state.finance.accounts.reduce((s, a) => s + a.bal, 0);
  const monthlyIn = state.finance.flows.filter((f) => f.kind === "in").reduce((s, f) => s + f.amt, 0);
  const monthlyOut = state.finance.flows.filter((f) => f.kind === "out").reduce((s, f) => s + f.amt, 0);
  const net = monthlyIn - monthlyOut;
  const burn = monthlyOut - monthlyIn;
  const runway = burn > 0 ? liquid / burn : monthlyOut > 0 ? liquid / monthlyOut : null;
  const positive = net >= 0;

  return (
    <>
      <section className="card">
        <p className="kicker">{positive ? "Floor" : "Runway"}</p>
        <p className="headline-stat">
          {runway == null ? "—" : `${runway.toFixed(1)} mo`}
        </p>
        {positive ? (
          <p className="hint">
            Net monthly is positive. This is a floor — months of outgo the liquid would cover if
            income stopped — not a countdown.
          </p>
        ) : (
          <p className="hint">Liquid divided by monthly burn (out minus in).</p>
        )}
        <div className="grid4" style={{ marginTop: "0.85rem" }}>
          <div>
            <p className="kicker">Liquid</p>
            <p className="num">{fmt(liquid)}</p>
          </div>
          <div>
            <p className="kicker">Net monthly</p>
            <p className={`num ${net < 0 ? "ebb" : "flood"}`}>{fmt(net)}</p>
          </div>
          <div>
            <p className="kicker">In</p>
            <p className="num">{fmt(monthlyIn)}</p>
          </div>
          <div>
            <p className="kicker">Out</p>
            <p className="num">{fmt(monthlyOut)}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Accounts</h2>
        {state.finance.accounts.length === 0 && (
          <p className="empty">No accounts. Add a name and a balance. Liquid is their sum.</p>
        )}
        <ul className="list-reset">
          {state.finance.accounts.map((a) => (
            <AccountRow
              key={a.id}
              account={a}
              onSave={(account) => dispatch({ type: "UPSERT_ACCOUNT", account })}
              onDelete={() => dispatch({ type: "DELETE_ACCOUNT", id: a.id })}
            />
          ))}
        </ul>
        <NewAccount onAdd={(account) => dispatch({ type: "UPSERT_ACCOUNT", account })} />
      </section>

      <section className="card">
        <h2>Monthly flows</h2>
        {state.finance.flows.length === 0 && (
          <p className="empty">No recurring flows. Add monthly in or out, personal or business.</p>
        )}
        <ul className="list-reset">
          {state.finance.flows.map((f) => (
            <FlowRow
              key={f.id}
              flow={f}
              onSave={(flow) => dispatch({ type: "UPSERT_FLOW", flow })}
              onDelete={() => dispatch({ type: "DELETE_FLOW", id: f.id })}
            />
          ))}
        </ul>
        <NewFlow onAdd={(flow) => dispatch({ type: "UPSERT_FLOW", flow })} />
      </section>
    </>
  );
}

function fmt(n: number): string {
  const abs = Math.abs(n);
  const body = abs.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n < 0 ? `−${body}` : body;
}

function AccountRow({
  account,
  onSave,
  onDelete,
}: {
  account: Account;
  onSave: (a: Account) => void;
  onDelete: () => void;
}) {
  return (
    <li className="row" style={{ padding: "0.4rem 0", borderBottom: "1px solid var(--line)" }}>
      <input
        type="text"
        value={account.name}
        aria-label="Account name"
        onChange={(e) => onSave({ ...account, name: e.target.value })}
        style={{ flex: "1 1 8rem" }}
      />
      <input
        type="number"
        className="num"
        value={account.bal}
        aria-label="Balance"
        onChange={(e) => onSave({ ...account, bal: Number(e.target.value) || 0 })}
        style={{ flex: "0 1 7rem" }}
      />
      <button type="button" className="ghost" onClick={onDelete}>
        Delete
      </button>
    </li>
  );
}

function NewAccount({ onAdd }: { onAdd: (a: Account) => void }) {
  const [name, setName] = useState("");
  const [bal, setBal] = useState("");
  return (
    <div className="stack" style={{ marginTop: "0.75rem" }}>
      <div className="row">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: "1 1 8rem" }}
        />
        <input
          type="number"
          className="num"
          placeholder="Balance"
          value={bal}
          onChange={(e) => setBal(e.target.value)}
          style={{ flex: "0 1 7rem" }}
        />
      </div>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          if (!name.trim()) return;
          onAdd({ id: nid(), name: name.trim(), bal: Number(bal) || 0 });
          setName("");
          setBal("");
        }}
      >
        Add account
      </button>
    </div>
  );
}

function FlowRow({
  flow,
  onSave,
  onDelete,
}: {
  flow: Flow;
  onSave: (f: Flow) => void;
  onDelete: () => void;
}) {
  return (
    <li style={{ padding: "0.45rem 0", borderBottom: "1px solid var(--line)" }}>
      <div className="row">
        <input
          type="text"
          value={flow.name}
          aria-label="Flow name"
          onChange={(e) => onSave({ ...flow, name: e.target.value })}
          style={{ flex: "1 1 8rem" }}
        />
        <input
          type="number"
          className="num"
          value={flow.amt}
          aria-label="Amount"
          onChange={(e) => onSave({ ...flow, amt: Number(e.target.value) || 0 })}
          style={{ flex: "0 1 6rem" }}
        />
      </div>
      <div className="row" style={{ marginTop: "0.35rem" }}>
        <select
          value={flow.kind}
          aria-label="In or out"
          onChange={(e) => onSave({ ...flow, kind: e.target.value as Flow["kind"] })}
          style={{ width: "auto" }}
        >
          <option value="in">in</option>
          <option value="out">out</option>
        </select>
        <select
          value={flow.scope}
          aria-label="Scope"
          onChange={(e) => onSave({ ...flow, scope: e.target.value as Flow["scope"] })}
          style={{ width: "auto" }}
        >
          <option value="personal">personal</option>
          <option value="business">business</option>
        </select>
        <button type="button" className="ghost" onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}

function NewFlow({ onAdd }: { onAdd: (f: Flow) => void }) {
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const [kind, setKind] = useState<Flow["kind"]>("out");
  const [scope, setScope] = useState<Flow["scope"]>("personal");
  return (
    <div className="stack" style={{ marginTop: "0.75rem" }}>
      <div className="row">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: "1 1 8rem" }}
        />
        <input
          type="number"
          className="num"
          placeholder="Amount"
          value={amt}
          onChange={(e) => setAmt(e.target.value)}
          style={{ flex: "0 1 6rem" }}
        />
      </div>
      <div className="row">
        <select value={kind} onChange={(e) => setKind(e.target.value as Flow["kind"])} style={{ width: "auto" }}>
          <option value="in">in</option>
          <option value="out">out</option>
        </select>
        <select value={scope} onChange={(e) => setScope(e.target.value as Flow["scope"])} style={{ width: "auto" }}>
          <option value="personal">personal</option>
          <option value="business">business</option>
        </select>
      </div>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          if (!name.trim()) return;
          onAdd({ id: nid(), name: name.trim(), amt: Number(amt) || 0, kind, scope });
          setName("");
          setAmt("");
        }}
      >
        Add flow
      </button>
    </div>
  );
}
