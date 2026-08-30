import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { State } from "../types";
import { emptyState } from "./initial";
import { createDebouncedSave, loadState, saveState } from "./persist";
import { reducer, type Action } from "./reducer";

type StoreValue = {
  state: State;
  dispatch: Dispatch<Action>;
  ready: boolean;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, emptyState);
  const [ready, setReady] = useReady();
  const save = useMemo(() => createDebouncedSave(700), []);

  useEffect(() => {
    let cancelled = false;
    void loadState().then((loaded) => {
      if (cancelled) return;
      if (loaded) dispatch({ type: "HYDRATE", state: loaded });
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [setReady]);

  useEffect(() => {
    if (!ready) return;
    save(state);
  }, [state, ready, save]);

  useEffect(() => {
    const flush = () => {
      void saveState(state);
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, ready }), [state, ready]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore outside StoreProvider");
  return ctx;
}

function useReady(): [boolean, (v: boolean) => void] {
  const pair = useReducer((_: boolean, v: boolean) => v, false);
  return pair;
}
