import { useState, useCallback, useRef, useEffect } from "react";
import type { LayoutState, TablePosition } from "../types";

const STORAGE_KEY = "hicksville-table-layout";

function createDefaultState(): LayoutState {
  const tables = [];

  // Table 1: rectangular 2'x4'
  tables.push({
    id: 1,
    label: "1",
    shape: "rect" as const,
    position: { x: 5, y: 93 },
  });

  // Tables 2–14: round 6' diameter
  for (let i = 0; i < 13; i++) {
    tables.push({
      id: i + 2,
      label: String(i + 2),
      shape: "round" as const,
      position: {
        x: 18 + (i % 7) * 11,
        y: i < 7 ? 93 : 86,
      },
    });
  }

  return {
    version: 1,
    tables,
    color: "#FF6B35",
    sizeScale: 1.0,
  };
}

function decodeFromHash(hash: string): LayoutState | null {
  try {
    const encoded = hash.replace(/^#layout=/, "");
    const compact: unknown = JSON.parse(atob(encoded));
    if (
      typeof compact !== "object" ||
      compact === null ||
      !("t" in compact)
    ) {
      return null;
    }
    const { t, c, s } = compact as {
      t: [number, number][];
      c: string;
      s: number;
    };
    if (!Array.isArray(t) || t.length !== 14) return null;

    const defaults = createDefaultState();
    return {
      version: 1,
      tables: defaults.tables.map((table, i) => ({
        ...table,
        position: { x: t[i]![0]!, y: t[i]![1]! },
      })),
      color: typeof c === "string" ? c : defaults.color,
      sizeScale: typeof s === "number" ? s : defaults.sizeScale,
    };
  } catch {
    return null;
  }
}

function loadState(): LayoutState {
  // 1. Check URL hash for shared layout
  const hash = window.location.hash;
  if (hash.startsWith("#layout=")) {
    const fromHash = decodeFromHash(hash);
    if (fromHash) {
      // Clear hash so subsequent refreshes use localStorage
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return fromHash;
    }
  }

  // 2. Check localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "version" in parsed &&
        (parsed as LayoutState).version === 1
      ) {
        return parsed as LayoutState;
      }
    }
  } catch {
    // ignore parse errors, fall through to default
  }

  // 3. Default
  return createDefaultState();
}

function encodeToHash(state: LayoutState): string {
  const compact = {
    t: state.tables.map((table) => [
      Math.round(table.position.x * 10) / 10,
      Math.round(table.position.y * 10) / 10,
    ]),
    c: state.color,
    s: Math.round(state.sizeScale * 10) / 10,
  };
  return "#layout=" + btoa(JSON.stringify(compact));
}

export function useLayoutState() {
  const [state, setState] = useState<LayoutState>(loadState);
  const saveTimeout = useRef(0);

  // Sync state to localStorage (external system) with debounce
  useEffect(() => {
    window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 200);
    return () => window.clearTimeout(saveTimeout.current);
  }, [state]);

  const moveTable = useCallback((id: number, position: TablePosition) => {
    setState((prev) => ({
      ...prev,
      tables: prev.tables.map((t) => (t.id === id ? { ...t, position } : t)),
    }));
  }, []);

  const setColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, color }));
  }, []);

  const setSizeScale = useCallback((sizeScale: number) => {
    setState((prev) => ({ ...prev, sizeScale }));
  }, []);

  const resetLayout = useCallback(() => {
    setState(createDefaultState());
  }, []);

  const shareLayout = useCallback(() => {
    const hash = encodeToHash(state);
    const url = window.location.origin + window.location.pathname + hash;
    window.history.replaceState(null, "", hash);
    navigator.clipboard.writeText(url);
    return url;
  }, [state]);

  return { state, moveTable, setColor, setSizeScale, resetLayout, shareLayout };
}
