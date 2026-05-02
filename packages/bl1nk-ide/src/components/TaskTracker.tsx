import { useState } from "react";
import { Plus, Circle, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Task } from "../store/notes";
import { cn } from "../lib/utils";

interface TaskTrackerProps {
	tasks: Task[];
	onToggle: (id: string) => void;
	onAdd: (text: string, priority: Task["priority"]) => void;
}

export function TaskTracker({ tasks, onToggle, onAdd }: TaskTrackerProps) {
	const [newText, setNewText] = useState("");
	const [priority, setPriority] = useState<Task["priority"]>("medium");
	const [filter, setFilter] = useState<"all" | "todo" | "done">("all");

	const filters: { key: typeof filter; label: string }[] = [
		{ key: "all", label: "All" },
		{ key: "todo", label: "To Do" },
		{ key: "done", label: "Done" },
	];

	const visible = tasks.filter((t) =>
		filter === "all" ? true : filter === "todo" ? !t.done : t.done,
	);

	const done = tasks.filter((t) => t.done).length;
	const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

	const priorityColors: Record<Task["priority"], string> = {
		low: "var(--text-muted)",
		medium: "var(--teal)",
		high: "#ff6b6b",
	};

	const PriorityIcon = ({ p }: { p: Task["priority"] }) =>
		p === "high" ? (
			<AlertCircle size={12} style={{ color: priorityColors[p] }} />
		) : p === "medium" ? (
			<Clock size={12} style={{ color: priorityColors[p] }} />
		) : (
			<Circle size={12} style={{ color: priorityColors[p] }} />
		);

	function handleAdd() {
		if (!newText.trim()) return;
		onAdd(newText.trim(), priority);
		setNewText("");
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div
				className="px-6 py-5 border-b shrink-0"
				style={{ borderColor: "var(--border)" }}
			>
				<h2
					className="text-base font-semibold mb-3"
					style={{ color: "var(--text-primary)" }}
				>
					Task Tracker
				</h2>

				<div className="mb-3">
					<div
						className="flex justify-between text-xs mb-1.5"
						style={{ color: "var(--text-secondary)" }}
					>
						<span>
							{done} / {tasks.length} completed
						</span>
						<span style={{ color: "var(--teal)" }}>{progress}%</span>
					</div>
					<div
						className="h-1 rounded-full overflow-hidden"
						style={{ background: "rgba(0,188,212,0.1)" }}
					>
						<div
							className="h-full rounded-full transition-all duration-500"
							style={{
								width: `${progress}%`,
								background:
									"linear-gradient(90deg, var(--teal), var(--teal-bright))",
							}}
						/>
					</div>
				</div>

				<div
					className="flex items-center gap-1 p-1 rounded-lg"
					style={{
						background: "rgba(0,188,212,0.04)",
						border: "1px solid var(--border)",
					}}
				>
					{filters.map(({ key, label }) => (
						<button
							key={key}
							onClick={() => setFilter(key)}
							className={cn(
								"flex-1 text-xs py-1 rounded-md transition-all",
								filter === key
									? "text-[var(--teal)] bg-[rgba(0,188,212,0.12)]"
									: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
							)}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
				{visible.length === 0 && (
					<div className="flex flex-col items-center justify-center h-32 gap-2">
						<CheckCircle2 size={24} style={{ color: "var(--text-muted)" }} />
						<p className="text-xs" style={{ color: "var(--text-muted)" }}>
							No tasks here
						</p>
					</div>
				)}
				{visible.map((task) => (
					<button
						key={task.id}
						onClick={() => onToggle(task.id)}
						className={cn(
							"flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all group",
							task.done ? "opacity-50" : "hover:bg-[rgba(0,188,212,0.04)]",
						)}
						style={{ border: "1px solid transparent" }}
						onMouseEnter={(e) =>
							!task.done &&
							(e.currentTarget.style.borderColor = "var(--border)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.borderColor = "transparent")
						}
					>
						{task.done ? (
							<CheckCircle2
								size={15}
								style={{ color: "var(--teal)", flexShrink: 0 }}
							/>
						) : (
							<Circle
								size={15}
								style={{ color: "var(--text-muted)", flexShrink: 0 }}
							/>
						)}
						<span
							className={cn("flex-1 text-sm", task.done && "line-through")}
							style={{ color: "var(--text-primary)" }}
						>
							{task.text}
						</span>
						<PriorityIcon p={task.priority} />
					</button>
				))}
			</div>

			<div
				className="px-4 py-3 border-t shrink-0"
				style={{
					borderColor: "var(--border)",
					background: "var(--bg-elevated)",
				}}
			>
				<div className="flex items-center gap-2 mb-2">
					{(["low", "medium", "high"] as Task["priority"][]).map((p) => (
						<button
							key={p}
							onClick={() => setPriority(p)}
							className={cn(
								"text-xs px-2 py-0.5 rounded-full capitalize transition-all",
								priority === p ? "font-medium" : "opacity-50",
							)}
							style={{
								background:
									priority === p ? `${priorityColors[p]}20` : "transparent",
								color: priorityColors[p],
								border: `1px solid ${priority === p ? priorityColors[p] + "40" : "transparent"}`,
							}}
						>
							{p}
						</button>
					))}
				</div>
				<div className="flex items-center gap-2">
					<input
						value={newText}
						onChange={(e) => setNewText(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleAdd()}
						placeholder="Add a task..."
						className="flex-1 bg-transparent text-sm outline-none px-3 py-2 rounded-lg"
						style={{
							color: "var(--text-primary)",
							background: "rgba(0, 188, 212, 0.04)",
							border: "1px solid var(--border)",
						}}
					/>
					<button
						onClick={handleAdd}
						disabled={!newText.trim()}
						className="flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-30"
						style={{ background: "var(--teal)", color: "#000" }}
					>
						<Plus size={14} />
					</button>
				</div>
			</div>
		</div>
	);
}
