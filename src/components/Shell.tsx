import type { ReactNode } from "react";
import { navigate, useRoute } from "../lib/route";
import type { Route } from "../types";
import { TidelineSpark } from "./TidelineSpark";

const TABS: { to: Route; label: string }[] = [
  { to: "/", label: "Today" },
  { to: "/log", label: "Log" },
  { to: "/money", label: "Money" },
  { to: "/grow", label: "Grow" },
  { to: "/trends", label: "Trends" },
];

export function Shell({ children }: { children: ReactNode }) {
  const route = useRoute();
  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <a className="wordmark" href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
            Tideline
          </a>
          <a
            className="quiet"
            href="/settings"
            onClick={(e) => {
              e.preventDefault();
              navigate("/settings");
            }}
          >
            Settings
          </a>
        </div>
        <TidelineSpark />
      </header>
      <main className="main">{children}</main>
      <nav className="nav" aria-label="Primary">
        {TABS.map((t) => {
          const active = t.to === "/" ? route === "/" : route === t.to;
          return (
            <a
              key={t.to}
              href={t.to}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigate(t.to);
              }}
            >
              {t.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
