import { useEffect, useState } from "react";
import type { Route } from "../types";

const ROUTES = new Set<string>([
  "/",
  "/log",
  "/money",
  "/grow",
  "/trends",
  "/review",
  "/precepts",
  "/settings",
]);

export function normalizePath(path: string): Route {
  const clean = path.replace(/\/+$/, "") || "/";
  return (ROUTES.has(clean) ? clean : "/") as Route;
}

export function navigate(to: Route | string): void {
  const next = to.startsWith("/") ? to : `/${to}`;
  if (window.location.pathname === next) return;
  window.history.pushState({}, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useRoute(): Route {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  useEffect(() => {
    const onPop = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return path;
}
