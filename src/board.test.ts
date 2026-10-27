import { describe, expect, it } from "vitest";
import { filterTasks, progress, reducer, type Task } from "./board";

const seed = (): Task[] => [
  { id: "a", title: "Design logo", priority: "high", status: "todo", createdAt: 1 },
  { id: "b", title: "Write copy", priority: "low", status: "todo", createdAt: 2 },
  { id: "c", title: "Launch", priority: "medium", status: "done", createdAt: 3 },
];

describe("reducer", () => {
  it("adds trimmed tasks to the todo column and ignores blanks", () => {
    const out = reducer([], { type: "add", title: "  Ship it ", priority: "high", id: "x", now: 5 });
    expect(out).toEqual([{ id: "x", title: "Ship it", priority: "high", status: "todo", createdAt: 5 }]);
    expect(reducer(out, { type: "add", title: "   ", priority: "low" })).toBe(out);
  });

  it("moves a task to another column, before a target card", () => {
    const out = reducer(seed(), { type: "move", id: "b", status: "done", beforeId: "c" });
    expect(out.map((t) => t.id)).toEqual(["a", "b", "c"]);
    expect(out.find((t) => t.id === "b")!.status).toBe("done");
  });

  it("moves to the end of a column without a target", () => {
    const out = reducer(seed(), { type: "move", id: "a", status: "doing" });
    expect(out.map((t) => t.id)).toEqual(["b", "c", "a"]);
  });

  it("renames, removes and clears done tasks", () => {
    let out = reducer(seed(), { type: "rename", id: "a", title: "New logo" });
    expect(out[0].title).toBe("New logo");
    out = reducer(out, { type: "remove", id: "b" });
    expect(out).toHaveLength(2);
    expect(reducer(out, { type: "clearDone" }).map((t) => t.id)).toEqual(["a"]);
  });
});

describe("helpers", () => {
  it("filters by text and priority", () => {
    expect(filterTasks(seed(), "LOGO", "all").map((t) => t.id)).toEqual(["a"]);
    expect(filterTasks(seed(), "", "low").map((t) => t.id)).toEqual(["b"]);
  });

  it("computes progress", () => {
    expect(progress(seed())).toBe(33);
    expect(progress([])).toBe(0);
  });
});
