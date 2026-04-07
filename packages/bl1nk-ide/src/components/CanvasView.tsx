import { useEffect, useRef, useState } from "react";
import { Pencil, Square, Circle, Minus, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "../lib/utils";

type Tool = "pen" | "rect" | "circle" | "line" | "select";

interface Point { x: number; y: number }
interface Shape {
  id: string;
  tool: Tool;
  points: Point[];
  color: string;
  strokeWidth: number;
}

export function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [drawing, setDrawing] = useState(false);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [current, setCurrent] = useState<Point[]>([]);
  const [scale, setScale] = useState(1);
  const [color, setColor] = useState("#00bcd4");
  const strokeWidth = 2;

  const tools: { t: Tool; icon: React.ReactNode; label: string }[] = [
    { t: "pen", icon: <Pencil size={13} />, label: "Pen" },
    { t: "line", icon: <Minus size={13} />, label: "Line" },
    { t: "rect", icon: <Square size={13} />, label: "Rectangle" },
    { t: "circle", icon: <Circle size={13} />, label: "Circle" },
  ];

  const colors = ["#00bcd4", "#00e5ff", "#cce8e8", "#ff6b6b", "#ffd93d", "#6bcb77"];

  function getPos(e: React.MouseEvent<HTMLCanvasElement>): Point {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  }

  function redraw(shapes: Shape[], current: Point[]) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);

    const drawShape = (s: Shape | { tool: Tool; points: Point[]; color: string; strokeWidth: number }) => {
      if (s.points.length < 1) return;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const [first, last] = [s.points[0], s.points[s.points.length - 1]];
      ctx.beginPath();
      if (s.tool === "pen") {
        ctx.moveTo(first.x, first.y);
        s.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } else if (s.tool === "line") {
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      } else if (s.tool === "rect") {
        ctx.strokeRect(first.x, first.y, last.x - first.x, last.y - first.y);
      } else if (s.tool === "circle") {
        const rx = Math.abs(last.x - first.x) / 2;
        const ry = Math.abs(last.y - first.y) / 2;
        ctx.ellipse(first.x + (last.x - first.x) / 2, first.y + (last.y - first.y) / 2, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    for (const s of shapes) drawShape(s);
    if (current.length > 0) drawShape({ tool, points: current, color, strokeWidth });

    ctx.restore();
  }

  useEffect(() => { redraw(shapes, current); }, [shapes, current, scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redraw(shapes, current);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [shapes]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-2 border-b shrink-0"
        style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center rounded-md overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {tools.map(({ t, icon, label }) => (
            <button
              key={t}
              title={label}
              onClick={() => setTool(t)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all",
                tool === t
                  ? "text-[var(--teal)] bg-[rgba(0,188,212,0.12)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.03)]"
              )}
            >
              {icon}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-4 h-4 rounded-full transition-all hover:scale-125"
              style={{
                background: c,
                outline: color === c ? `2px solid ${c}` : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
            className="flex items-center justify-center w-7 h-7 rounded transition-all hover:bg-[rgba(0,188,212,0.06)]"
            style={{ color: "var(--text-secondary)" }}>
            <ZoomOut size={13} />
          </button>
          <span className="text-xs w-10 text-center" style={{ color: "var(--text-muted)" }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.1))}
            className="flex items-center justify-center w-7 h-7 rounded transition-all hover:bg-[rgba(0,188,212,0.06)]"
            style={{ color: "var(--text-secondary)" }}>
            <ZoomIn size={13} />
          </button>
        </div>

        <button
          onClick={() => setShapes([])}
          title="Clear canvas"
          className="flex items-center justify-center w-7 h-7 rounded transition-all hover:text-red-400 hover:bg-red-400/10"
          style={{ color: "var(--text-secondary)" }}>
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, var(--teal) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: tool === "select" ? "default" : "crosshair" }}
          onMouseDown={e => {
            setDrawing(true);
            setCurrent([getPos(e)]);
          }}
          onMouseMove={e => {
            if (!drawing) return;
            const pos = getPos(e);
            setCurrent(prev => tool === "pen" ? [...prev, pos] : [prev[0], pos]);
          }}
          onMouseUp={() => {
            if (current.length > 0) {
              setShapes(s => [...s, { id: `${Date.now()}`, tool, points: current, color, strokeWidth }]);
            }
            setCurrent([]);
            setDrawing(false);
          }}
        />
      </div>
    </div>
  );
}
