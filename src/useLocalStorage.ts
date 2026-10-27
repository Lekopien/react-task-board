import { useEffect, useReducer } from "react";
import type { Action, Task } from "./board";

const KEY = "lekopien.taskboard.v1";

const SAMPLE: Task[] = [
  { id: "s1", title: "Sketch the homepage layout", priority: "high", status: "done", createdAt: 1 },
  { id: "s2", title: "Build the contact form", priority: "medium", status: "doing", createdAt: 2 },
  { id: "s3", title: "Write SEO meta tags", priority: "low", status: "todo", createdAt: 3 },
  { id: "s4", title: "Drag me to another column", priority: "medium", status: "todo", createdAt: 4 },
];

function load(): Task[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Task[]) : SAMPLE;
  } catch {
    return SAMPLE;
  }
}

/** useReducer whose state survives a page reload. */
export function usePersistentBoard(reducer: (s: Task[], a: Action) => Task[]) {
  const [tasks, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(tasks));
    } catch {
      /* storage may be blocked (private mode); the board still works in memory */
    }
  }, [tasks]);
  return [tasks, dispatch] as const;
}
