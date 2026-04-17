import { describe, expect, it } from "vitest";
import { buildInitialGraph } from "./analyzer.js";

describe("Performance Benchmark", () => {
	it("buildInitialGraph performance with large input", () => {
		const charCount = 100;
		const eventCount = 500;

		let storyText = "Title: Benchmark Story\n\n";
		for (let i = 0; i < charCount; i++) {
			storyText += `Character: Char${i}, role: supporting\n`;
		}

		for (let i = 0; i < eventCount; i++) {
			// Include some character names in events to trigger the assignment logic
			const charInEvent = `Char${i % charCount}`;
			storyText += `Event: ${charInEvent} does something in event ${i}\n`;
		}

		const start = performance.now();
		const graph = buildInitialGraph(storyText);
		const end = performance.now();

		console.log(
			`Execution time for ${charCount} chars and ${eventCount} events: ${(end - start).toFixed(2)}ms`,
		);
		console.log(
			`Graph statistics: ${graph.characters.length} characters, ${graph.events.length} events`,
		);

		// Basic sanity check
		expect(graph.characters.length).toBe(charCount);
		expect(graph.events.length).toBe(eventCount);

		// Verify that characters were assigned
		const totalAssignments = graph.events.reduce(
			(acc, e) => acc + e.characters.length,
			0,
		);
		console.log(`Total character-to-event assignments: ${totalAssignments}`);
		expect(totalAssignments).toBeGreaterThan(0);
	});
});
