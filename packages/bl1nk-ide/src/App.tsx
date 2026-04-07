import { useState, useCallback, useMemo } from "react";
import { Note, Task, notesStore, extractTasksFromNotes } from "./store/notes";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { TaskTracker } from "./components/TaskTracker";
import { CanvasView } from "./components/CanvasView";
import { PanelLeftClose, PanelLeft } from "lucide-react";

type Panel = "files" | "tasks" | "canvas" | "search";

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => notesStore.load());
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id ?? null);
  const [activePanel, setActivePanel] = useState<Panel>("files");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [standaloneTaskList, setStandaloneTaskList] = useState<Task[]>(() => notesStore.tasksLoad());

  const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId) ?? null, [notes, activeNoteId]);

  const allTasks = useMemo(() => {
    const fromNotes = extractTasksFromNotes(notes);
    return [...standaloneTaskList, ...fromNotes];
  }, [notes, standaloneTaskList]);

  const handleNoteChange = useCallback((id: string, content: string) => {
    setNotes(prev => {
      const next = prev.map(n => n.id === id ? { ...n, content, updatedAt: Date.now() } : n);
      notesStore.save(next);
      return next;
    });
  }, []);

  const handleNewNote = useCallback(() => {
    const note = notesStore.create(`Untitled ${notes.length + 1}`);
    setNotes(prev => {
      const next = [note, ...prev];
      notesStore.save(next);
      return next;
    });
    setActiveNoteId(note.id);
    setActivePanel("files");
  }, [notes.length]);

  const handleToggleTask = useCallback((id: string) => {
    setStandaloneTaskList(prev => {
      const next = prev.map(t => t.id === id ? { ...t, done: !t.done } : t);
      notesStore.tasksSave(next);
      return next;
    });
  }, []);

  const handleAddTask = useCallback((text: string, priority: Task["priority"]) => {
    const task: Task = {
      id: `task-${Date.now()}`,
      text,
      done: false,
      priority,
    };
    setStandaloneTaskList(prev => {
      const next = [task, ...prev];
      notesStore.tasksSave(next);
      return next;
    });
  }, []);

  const showTaskPanel = activePanel === "tasks";
  const showCanvasPanel = activePanel === "canvas";
  const showEditor = !showTaskPanel && !showCanvasPanel;

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {sidebarOpen && (
        <div className="flex shrink-0 border-r" style={{ width: 244, borderColor: "var(--border)" }}>
          <Sidebar
            notes={notes}
            activeNoteId={activeNoteId}
            activePanel={activePanel}
            onSelectNote={id => { setActiveNoteId(id); setActivePanel("files"); }}
            onNewNote={handleNewNote}
            onPanelChange={p => {
              setActivePanel(p);
              if (p === "tasks" || p === "canvas") setActiveNoteId(null);
            }}
          />
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div
          className="flex items-center px-3 py-1.5 border-b shrink-0"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border)",
            backdropFilter: "blur(20px)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="flex items-center justify-center w-7 h-7 rounded transition-all hover:bg-[rgba(0,188,212,0.08)]"
            style={{ color: "var(--text-secondary)" }}
          >
            {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
          </button>

          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs font-semibold tracking-widest uppercase teal-text-glow" style={{ color: "var(--teal)" }}>
              AI · IDE
            </span>
          </div>

          <div className="flex items-center gap-1">
            {(["files", "tasks", "canvas"] as Panel[]).map(p => (
              <button
                key={p}
                onClick={() => {
                  setActivePanel(p);
                  if (p === "files" && !activeNoteId && notes.length) setActiveNoteId(notes[0].id);
                }}
                className="text-xs px-2.5 py-1 rounded-md capitalize transition-all"
                style={{
                  color: activePanel === p ? "var(--teal)" : "var(--text-secondary)",
                  background: activePanel === p ? "rgba(0,188,212,0.1)" : "transparent",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {showEditor && (
            <Editor note={activeNote} onChange={handleNoteChange} />
          )}
          {showTaskPanel && (
            <TaskTracker
              tasks={allTasks}
              onToggle={handleToggleTask}
              onAdd={handleAddTask}
            />
          )}
          {showCanvasPanel && (
            <CanvasView />
          )}
        </div>
      </div>
    </div>
  );
}
