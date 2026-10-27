export type Status = "todo" | "doing" | "done";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  createdAt: number;
}

export const COLUMNS: { id: Status; title: string }[] = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "In progress" },
  { id: "done", title: "Done" },
];

export type Action =
  | { type: "add"; title: string; priority: Priority; id?: string; now?: number }
  | { type: "move"; id: string; status: Status; beforeId?: string }
  | { type: "rename"; id: string; title: string }
  | { type: "remove"; id: string }
  | { type: "clearDone" };

const newId = () => Math.random().toString(36).slice(2, 10);

/** Pure reducer: every board change goes through here, which makes it easy to test. */
export function reducer(tasks: Task[], action: Action): Task[] {
  switch (action.type) {
    case "add": {
      const title = action.title.trim();
      if (!title) return tasks;
      return [...tasks, {
        id: action.id ?? newId(),
        title,
        priority: action.priority,
        status: "todo",
        createdAt: action.now ?? Date.now(),
      }];
    }
    case "move": {
      const task = tasks.find((t) => t.id === action.id);
      if (!task || action.id === action.beforeId) return tasks;
      const rest = tasks.filter((t) => t.id !== action.id);
      const moved = { ...task, status: action.status };
      const at = action.beforeId ? rest.findIndex((t) => t.id === action.beforeId) : -1;
      return at === -1 ? [...rest, moved] : [...rest.slice(0, at), moved, ...rest.slice(at)];
    }
    case "rename":
      return tasks.map((t) => (t.id === action.id && action.title.trim() ? { ...t, title: action.title.trim() } : t));
    case "remove":
      return tasks.filter((t) => t.id !== action.id);
    case "clearDone":
      return tasks.filter((t) => t.status !== "done");
  }
}

export function filterTasks(tasks: Task[], query: string, priority: Priority | "all"): Task[] {
  const q = query.trim().toLowerCase();
  return tasks.filter((t) => (priority === "all" || t.priority === priority) && t.title.toLowerCase().includes(q));
}

export function progress(tasks: Task[]): number {
  return tasks.length ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100) : 0;
}
