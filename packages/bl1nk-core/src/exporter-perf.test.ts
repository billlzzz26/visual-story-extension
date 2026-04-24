import { describe, expect, it } from "vitest";
import { toMarkdown } from "./exporters/markdown.js";
import { toMermaid } from "./exporters/mermaid.js";
import type { EventNode, StoryGraph } from "./types.js";

describe("Exporter Performance Benchmark", () => {
	const createLargeGraph = (eventCount: number): StoryGraph => {
		const events: EventNode[] = [];
		for (let i = 0; i < eventCount; i++) {
			const act = ((i % 3) + 1) as 1 | 2 | 3;
			events.push({
				id: `event_${i}`,
				label: `Event ${i}`,
				description: `Description for event ${i}`,
				act,
				importance: i % 10 === 0 ? "climax" : "rising",
				sequenceInAct: Math.floor(i / 3) + 1,
				characters: ["char_1"],
				conflicts: [],
				emotionalTone: "neutral",
				consequence: "",
			});
		}

		return {
			meta: {
				title: "Large Benchmark Story",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				version: "1.0.0",
			},
			characters: [
				{
					id: "char_1",
					name: "Protagonist",
					role: "protagonist",
					traits: [],
					arc: {
						start: "",
						midpoint: "",
						end: "",
						transformation: "",
						emotionalJourney: [],
					},
					relationships: [],
					motivations: [],
					fears: [],
					secretsOrLies: [],
					actAppearances: [1, 2, 3],
				},
			],
			conflicts: [],
			events,
			relationships: [],
			tags: [],
		};
	};

	it("toMarkdown performance with 5000 events", () => {
		const graph = createLargeGraph(5000);
		const start = performance.now();
		const output = toMarkdown(graph);
		const end = performance.now();
		console.log(`toMarkdown (5000 events): ${(end - start).toFixed(2)}ms`);
		expect(output).toBeDefined();
	});

	it("toMermaid performance with 5000 events", () => {
		const graph = createLargeGraph(5000);
		const start = performance.now();
		const output = toMermaid(graph);
		const end = performance.now();
		console.log(`toMermaid (5000 events): ${(end - start).toFixed(2)}ms`);
		expect(output).toBeDefined();
	});
});
