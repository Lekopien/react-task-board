import { useState, type DragEvent, type FormEvent } from "react";
import { COLUMNS, filterTasks, progress, reducer, type Priority, type Status, type Task } from "./board";
import { usePersistentBoard } from "./useLocalStorage";

export default function App() {
  const [tasks, dispatch] = usePersistentBoard(reducer);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [query, setQuery] = useState("");
  const [show, setShow] = useState<Priority | "all">("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Status | null>(null);

  const visible = filterTasks(tasks, query, show);
  const pct = progress(tasks);

  const add = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: "add", title, priority });
    setTitle("");
  };

  const drop = (e: DragEvent, status: Status, beforeId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragId) dispatch({ type: "move", id: dragId, status, beforeId });
    setDragId(null);
    setOver(null);
  };

  return (
    <div className="app">
      <header>
        <div>
          <a className="brand" href="https://lekopien.com">lekopien<span>.</span>tasks</a>
          <h1>Task board</h1>
        </div>
        <div className="progress" aria-label={`${pct}% done`}>
          <div className="ring" style={{ ["--p" as string]: pct }}><span>{pct}%</span></div>
        </div>
      </header>

      <form className="toolbar" onSubmit={add}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task…" aria-label="Task title" />
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority">
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
        <button className="btn">Add</button>
      </form>

      <div className="toolbar filters">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search tasks" />
        <select value={show} onChange={(e) => setShow(e.target.value as Priority | "all")} aria-label="Filter priority">
          <option value="all">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
        <button type="button" className="btn ghost" onClick={() => dispatch({ type: "clearDone" })}>Clear done</button>
      </div>

      <main className="board">
        {COLUMNS.map((col) => {
          const items = visible.filter((t) => t.status === col.id);
          return (
            <section
              key={col.id}
              className={`column ${over === col.id ? "over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setOver(col.id); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => drop(e, col.id)}
            >
              <h2>{col.title} <small>{items.length}</small></h2>
              {items.map((t) => (
                <Card key={t.id} task={t}
                  onDragStart={() => setDragId(t.id)}
                  onDrop={(e) => drop(e, col.id, t.id)}
                  onRename={(title) => dispatch({ type: "rename", id: t.id, title })}
                  onRemove={() => dispatch({ type: "remove", id: t.id })}
                  onMove={(status) => dispatch({ type: "move", id: t.id, status })}
                />
              ))}
              {!items.length && <p className="empty">Drop tasks here</p>}
            </section>
          );
        })}
      </main>
      <footer>React 19 · TypeScript · Vite · state saved in your browser. <a href="https://github.com/Lekopien/react-task-board">Source on GitHub</a></footer>
    </div>
  );
}

interface CardProps {
  task: Task;
  onDragStart: () => void;
  onDrop: (e: DragEvent) => void;
  onRename: (title: string) => void;
  onRemove: () => void;
  onMove: (s: Status) => void;
}

function Card({ task, onDragStart, onDrop, onRename, onRemove, onMove }: CardProps) {
  const [editing, setEditing] = useState(false);
  return (
    <article className={`card p-${task.priority}`} draggable onDragStart={onDragStart} onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      {editing ? (
        <input autoFocus defaultValue={task.title} aria-label="Edit title"
          onBlur={(e) => { onRename(e.target.value); setEditing(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setEditing(false); }} />
      ) : (
        <p onDoubleClick={() => setEditing(true)} title="Double-click to edit">{task.title}</p>
      )}
      <div className="row">
        <span className="pill">{task.priority}</span>
        {/* Buttons make the board usable on touch screens and keyboards, where drag-and-drop isn't. */}
        <select value={task.status} onChange={(e) => onMove(e.target.value as Status)} aria-label="Move to">
          {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <button className="icon" onClick={onRemove} aria-label="Delete task">×</button>
      </div>
    </article>
  );
}
