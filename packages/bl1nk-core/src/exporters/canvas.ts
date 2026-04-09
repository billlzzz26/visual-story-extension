import type { CanvasEdge, CanvasNode, StoryGraph } from "../types.js";

export function toCanvasJSON(
	graph: StoryGraph,
	options: { includeMetadata?: boolean; autoLayout?: boolean } = {},
) {
	const nodes: CanvasNode[] = [];
	const edges: CanvasEdge[] = [];

	// 1. Create Event Nodes
	graph.events.forEach((e, i) => {
		nodes.push({
			id: e.id,
			type: "event",
			data: {
				label: e.label,
				description: e.description,
				act: e.act,
				importance: e.importance,
				emotionalTone: e.emotionalTone,
			},
			position: {
				x: (e.act - 1) * 400 + e.sequenceInAct * 150,
				y: 200 + (i % 3) * 100,
			},
			style: getEventStyle(e.importance),
		});
	});

	// 2. Create Character Nodes
	graph.characters.forEach((c, i) => {
		nodes.push({
			id: c.id,
			type: "character",
			data: {
				label: c.name,
				role: c.role,
				traits: c.traits,
				arc: c.arc,
			},
			position: { x: 50, y: 100 + i * 120 },
			style: {
				backgroundColor: "#e3f2fd",
				borderColor: "#1976d2",
				borderWidth: 2,
				borderRadius: "8px",
				padding: "10px",
			},
		});
	});

	// 3. Create Conflict Nodes
	graph.conflicts.forEach((conf, i) => {
		nodes.push({
			id: conf.id,
			type: "conflict",
			data: {
				label: conf.description,
				type: conf.type,
				intensity: conf.escalations[0]?.intensity || 5,
			},
			position: { x: 800, y: 50 + i * 150 },
			style: {
				backgroundColor: "#fff3e0",
				borderColor: "#fb8c00",
				borderWidth: 2,
				shape: "diamond",
			},
		});
	});

	// 4. Create Edges (Relationships)
	graph.relationships.forEach((r, i) => {
		edges.push({
			id: `rel_${i}`,
			source: r.from,
			target: r.to,
			label: r.type,
			animated: r.strength > 7,
			style: { stroke: "#1976d2", strokeWidth: r.strength / 2 },
		});
	});

	// 5. Connect events in sequence
	const sortedEvents = [...graph.events].sort((a, b) => {
		if (a.act !== b.act) return a.act - b.act;
		return a.sequenceInAct - b.sequenceInAct;
	});

	for (let i = 0; i < sortedEvents.length - 1; i++) {
		edges.push({
			id: `seq_${i}`,
			source: sortedEvents[i].id,
			target: sortedEvents[i + 1].id,
			type: "smoothstep",
			style: { stroke: "#333", strokeWidth: 2 },
		});
	}

	return {
		nodes,
		edges,
		viewport: { x: 0, y: 0, zoom: 1 },
		metadata:
			options.includeMetadata !== false
				? {
						title: graph.meta.title,
						version: graph.meta.version,
						exportedAt: new Date().toISOString(),
						stats: {
							events: graph.events.length,
							characters: graph.characters.length,
							conflicts: graph.conflicts.length,
						},
					}
				: undefined,
	};
}

function getEventStyle(importance: string) {
	interface NodeStyle {
		backgroundColor: string;
		borderColor: string;
		borderWidth: number;
	}
	const styles: Record<string, NodeStyle> = {
		inciting: {
			backgroundColor: "#f3e5f5",
			borderColor: "#7b1fa2",
			borderWidth: 3,
		},
		midpoint: {
			backgroundColor: "#fff9c4",
			borderColor: "#fbc02d",
			borderWidth: 3,
		},
		climax: {
			backgroundColor: "#ffebee",
			borderColor: "#c62828",
			borderWidth: 4,
		},
		resolution: {
			backgroundColor: "#e8f5e9",
			borderColor: "#2e7d32",
			borderWidth: 2,
		},
	};
	return (
		styles[importance] || {
			backgroundColor: "#ffffff",
			borderColor: "#9e9e9e",
			borderWidth: 1,
		}
	);
}
