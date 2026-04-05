import { describe, expect, it } from "vitest";
import { buildInitialGraph } from "./analyzer.js";
import { extractStoryEntities } from "./core/parser.js";
import { toMermaid } from "./exporters/mermaid.js";
import { validateGraph } from "./validators.js";

describe("bl1nk-visual-mcp", () => {
	const storyText = `
Title: The Dragon's Heir

Character: Aria, role: protagonist
Aria is brave and determined.

Character: Shadow King, role: antagonist
The Shadow King is corrupted and powerful.

Character: Kael, role: supporting
Kael is a cunning rogue.

Character: Mysterious Stranger, role: mentor
The Stranger is wise and secretive.

Event: Aria works in father's forge
Event: Mysterious Stranger arrives
Event: The amulet appears
Event: Learning the truth
Event: Journey to Whispering Woods
Event: Meeting Kael
Event: Discovering the first key
Event: Shadow King's forces attack
Event: Aria loses control
Event: Arrival at Dragon Temple
Event: Shadow King awaits
Event: Final battle
Event: Aria embraces heritage

Conflict: Aria vs Shadow King
Conflict: Aria vs Self-Doubt
`;

	it("should analyze story correctly", () => {
		const graph = buildInitialGraph(storyText);

		expect(graph.meta.title).toBe("The Dragon's Heir");
		expect(graph.characters.length).toBe(4);
		expect(graph.events.length).toBe(13);
		expect(graph.conflicts.length).toBe(2);

		// Check characters
		expect(graph.characters[0].name).toBe("Aria");
		expect(graph.characters[0].role).toBe("protagonist");
		expect(graph.characters[1].name).toBe("Shadow King");
		expect(graph.characters[1].role).toBe("antagonist");

		// Check events distribution
		const act1Events = graph.events.filter((e) => e.act === 1);
		const act2Events = graph.events.filter((e) => e.act === 2);
		const act3Events = graph.events.filter((e) => e.act === 3);
		expect(act1Events.length).toBe(4);
		expect(act2Events.length).toBe(5);
		expect(act3Events.length).toBe(4);

		// Check importance
		const climax = graph.events.find((e) =>
			e.label.toLowerCase().includes("final"),
		);
		const resolution = graph.events.find((e) =>
			e.label.toLowerCase().includes("embraces"),
		);
		expect(climax).toBeDefined();
		expect(resolution).toBeDefined();
	});

	it("should validate story correctly", () => {
		const graph = buildInitialGraph(storyText);
		const result = validateGraph(graph);

		expect(result.isValid).toBe(true);
		expect(result.issues.filter((i) => i.severity === "error").length).toBe(0);
		expect(result.analysis.eventCount).toBe(13);
		expect(result.analysis.characterCount).toBe(4);
		expect(result.analysis.hasMidpoint).toBe(false); // No "midpoint" keyword in events
		expect(result.analysis.hasClimax).toBe(true);
	});

	it("should export mermaid diagram", () => {
		const graph = buildInitialGraph(storyText);
		const mermaid = toMermaid(graph);

		expect(mermaid).toContain("graph TD");
		expect(mermaid).toContain("subgraph Act_1");
		expect(mermaid).toContain("subgraph Act_2");
		expect(mermaid).toContain("subgraph Act_3");
		expect(mermaid).toContain("The Dragon's Heir");
	});

	it("should handle empty story", () => {
		const graph = buildInitialGraph("");
		expect(graph.meta.title).toBe("Untitled Story");
		expect(graph.characters.length).toBe(0);
		expect(graph.events.length).toBe(0);
	});

	it("should extract themes", () => {
		const storyWithThemes = `
Title: Test
Character: Hero, role: protagonist
Event: Hero fights for love and destiny
Event: Hero seeks power and survival
`;
		const graph = buildInitialGraph(storyWithThemes);
		expect(graph.tags).toContain("love");
		expect(graph.tags).toContain("destiny");
	});

	// ============================================================================
	// Edge Cases Tests
	// ============================================================================

	it("should handle act boundaries correctly", () => {
		// Exactly 4 events: first 4 should be act 1
		const fourEvents = `
Title: Test
Character: Hero, role: protagonist
Event: Event 1
Event: Event 2
Event: Event 3
Event: Event 4
`;
		const graph4 = buildInitialGraph(fourEvents);
		expect(graph4.events.filter((e) => e.act === 1).length).toBe(4);

		// Exactly 9 events: 4 act1, 5 act2, 0 act3
		const nineEvents = `
Title: Test
Character: Hero, role: protagonist
${Array.from({ length: 9 }, (_, i) => `Event: Event ${i + 1}`).join("\n")}
`;
		const graph9 = buildInitialGraph(nineEvents);
		expect(graph9.events.filter((e) => e.act === 1).length).toBe(4);
		expect(graph9.events.filter((e) => e.act === 2).length).toBe(5);
		expect(graph9.events.filter((e) => e.act === 3).length).toBe(0);

		// 10+ events: should distribute to all acts
		const tenEvents = `
Title: Test
Character: Hero, role: protagonist
${Array.from({ length: 10 }, (_, i) => `Event: Event ${i + 1}`).join("\n")}
`;
		const graph10 = buildInitialGraph(tenEvents);
		expect(graph10.events.filter((e) => e.act === 1).length).toBe(4);
		expect(graph10.events.filter((e) => e.act === 2).length).toBe(5);
		expect(graph10.events.filter((e) => e.act === 3).length).toBe(1);
	});

	it("should handle special characters in names", () => {
		const storyWithSpecialChars = `
Title: Test with "quotes" and 'apostrophes'
Character: O'Brien, role: protagonist
Character: José María
Character: Jean-Luc
Event: The "mysterious" quest
Event: Mission complete!
`;
		const graph = buildInitialGraph(storyWithSpecialChars);
		// Title keeps all special characters (current behavior)
		expect(graph.meta.title).toBe("Test with \"quotes\" and 'apostrophes'");
		expect(graph.characters.length).toBe(3);
		expect(graph.characters[0].name).toBe("O'Brien");
		expect(graph.characters[1].name).toBe("José María");
	});

	it("should handle duplicate characters", () => {
		const storyWithDuplicates = `
Title: Test
Character: Hero, role: protagonist
Character: Hero, role: supporting
Character: Villain
Event: Hero appears
Event: Hero saves the day
Event: Villain returns
`;
		const graph = buildInitialGraph(storyWithDuplicates);
		// Parser keeps all characters (including duplicates)
		// 2x Hero + 1x Villain = 3
		expect(graph.characters.length).toBe(3);
		const heroCount = graph.characters.filter(
			(c) => c.name.toLowerCase() === "hero",
		).length;
		// 2 Hero entries (duplicates)
		expect(heroCount).toBe(2);
	});

	it("should handle whitespace-only input", () => {
		const graph = buildInitialGraph("   \n\t  \n\r\n");
		expect(graph.meta.title).toBe("Untitled Story");
		expect(graph.characters.length).toBe(0);
	});

	it("should identify climax and resolution events", () => {
		const storyWithKeyEvents = `
Title: Test
Character: Hero, role: protagonist
Event: The journey begins
Event: Midpoint revelation
Event: Final confrontation
Event: Hero embraces destiny
`;
		const graph = buildInitialGraph(storyWithKeyEvents);
		const climax = graph.events.find((e) => e.importance === "climax");
		const resolution = graph.events.find((e) => e.importance === "resolution");
		const midpoint = graph.events.find((e) => e.importance === "midpoint");

		expect(climax).toBeDefined();
		expect(climax?.label).toContain("Final confrontation");
		expect(resolution).toBeDefined();
		expect(resolution?.label).toContain("embraces");
		expect(midpoint).toBeDefined();
		expect(midpoint?.label).toContain("Midpoint");
	});

	it("should parse entities correctly", () => {
		const entities = extractStoryEntities(`
Title: My Story
Character: Alice, role: protagonist
Character: Bob
Event: The beginning
Event: The ending
Conflict: Alice vs Bob
Chapter 1: Introduction
Chapter 2: Conclusion
`);

		expect(entities.title).toBe("My Story");
		expect(entities.characters).toHaveLength(2);
		expect(entities.events).toHaveLength(2);
		expect(entities.conflicts).toHaveLength(1);
		expect(entities.scenes).toHaveLength(2);
	});

	it("should detect character roles case-insensitively", () => {
		const story = `
Title: Test
Character: Hero, role: PROTAGONIST
Character: Villain, role: ANTAGONIST
Character: Guide, role: MENTOR
Character: Sidekick
`;
		const graph = buildInitialGraph(story);
		expect(graph.characters[0].role).toBe("protagonist");
		expect(graph.characters[1].role).toBe("antagonist");
		expect(graph.characters[2].role).toBe("mentor");
		expect(graph.characters[3].role).toBe("supporting");
	});

	it("should assign characters to events by name match", () => {
		const story = `
Title: Test
Character: Alice
Character: Bob
Event: Alice discovers truth
Event: Bob meets Alice
Event: The adventure continues
`;
		const graph = buildInitialGraph(story);
		const aliceEvent = graph.events.find((e) => e.label.includes("Alice"));
		const bobEvent = graph.events.find((e) => e.label.includes("Bob"));

		expect(aliceEvent?.characters).toContain("char_0");
		expect(bobEvent?.characters).toContain("char_1");
	});
});
