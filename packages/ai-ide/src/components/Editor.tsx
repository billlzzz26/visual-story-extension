import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Split, Clock } from "lucide-react";
import { Note } from "../store/notes";
import { MarkdownPreview } from "./MarkdownPreview";
import { cn } from "../lib/utils";

interface EditorProps {
  note: Note | null;
  onChange: (id: string, content: string) => void;
}

type ViewMode = "edit" | "split" | "preview";

export function Editor({ note, onChange }: EditorProps) {
  const [mode, setMode] = useState<ViewMode>("split");
  const [localContent, setLocalContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (note) setLocalContent(note.content);
  }, [note?.id]);

  function handleChange(val: string) {
    setLocalContent(val);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (note) onChange(note.id, val);
    }, 400);
  }

  function handleTab(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const { selectionStart, selectionEnd } = ta;
      const next = localContent.slice(0, selectionStart) + "  " + localContent.slice(selectionEnd);
      setLocalContent(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 2;
      });
    }
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-3"
        style={{ background: "var(--bg-base)", color: "var(--text-muted)" }}>
        <div className="text-5xl opacity-20">✍</div>
        <p className="text-sm">Select a note or create a new one</p>
      </div>
    );
  }

  const modeButtons: { icon: React.ReactNode; m: ViewMode; label: string }[] = [
    { icon: <Split size={12} />, m: "split", label: "Split" },
    { icon: <EyeOff size={12} />, m: "edit", label: "Edit" },
    { icon: <Eye size={12} />, m: "preview", label: "Preview" },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-2 border-b shrink-0"
        style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{note.title}</span>
          {note.tags.map(t => (
            <span key={t} className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(0,188,212,0.1)", color: "var(--teal)", border: "1px solid rgba(0,188,212,0.2)" }}>
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <Clock size={11} />
            {new Date(note.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <div className="flex items-center rounded-md overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {modeButtons.map(({ icon, m, label }) => (
              <button
                key={m}
                title={label}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs transition-all",
                  mode === m
                    ? "text-[var(--teal)] bg-[rgba(0,188,212,0.12)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.03)]"
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {(mode === "edit" || mode === "split") && (
          <div
            className={cn("flex flex-col overflow-hidden", mode === "split" ? "w-1/2 border-r" : "w-full")}
            style={{ borderColor: "var(--border)" }}
          >
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={e => handleChange(e.target.value)}
              onKeyDown={handleTab}
              spellCheck={false}
              className="flex-1 resize-none outline-none px-8 py-8 editor-font text-sm leading-relaxed"
              style={{
                background: "transparent",
                color: "var(--text-primary)",
                caretColor: "var(--teal)",
              }}
              placeholder="Start writing in Markdown..."
            />
          </div>
        )}

        {(mode === "preview" || mode === "split") && (
          <div
            className={cn("flex flex-col overflow-hidden", mode === "split" ? "w-1/2" : "w-full")}
            style={{ background: "rgba(5, 15, 15, 0.5)" }}
          >
            <MarkdownPreview content={localContent} />
          </div>
        )}
      </div>
    </div>
  );
}
