import { useState, useCallback, useRef, useEffect } from "react";
import type { LayoutState, TablePosition } from "../types";

const STORAGE_KEY = "hicksville-table-layout";

function createDefaultState(): LayoutState {
  const tables = [];

  for (let i = 0; i < 13; i++) {
    tables.push({
      id: i + 1,
      label: String(i + 1),
      shape: "round" as const,
      position: {
        x: 5 + (i % 7) * 13,
        y: i < 7 ? 93 : 86,
      },
    });
  }

  tables.push({
    id: 14,
    label: "14",
    shape: "rect" as const,
    position: { x: 83, y: 86 },
  });

  return {
    version: 1,
    tables,
    color: "#FF6B35",
    sizeScale: 1.0,
  };
}

function loadState(): LayoutState {
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
  return createDefaultState();
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

  return { state, moveTable, setColor, setSizeScale, resetLayout };
}
