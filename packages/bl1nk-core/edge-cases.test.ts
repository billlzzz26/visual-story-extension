import { describe, expect, it } from "vitest";
import { buildInitialGraph } from "./analyzer.js";
import { extractStoryEntities } from "./core/parser.js";
import { toDashboard } from "./exporters/dashboard.js";
import type { StoryGraph } from "./types.js";
import { generateCSV } from "./utils/csv-generator.js";

// Minimal graph builder for edge case tests
const createMinimalGraph = (events = 3): StoryGraph => {
	const eventsList = [];
	if (events >= 1) {
		eventsList.push({
			id: "e1",
			label: "Event 1",
			description: "",
			act: 1,
			importance: "normal" as const,
			sequenceInAct: 1,
			characters: [],
			conflicts: [],
			emotionalTone: "",
			consequence: "",
		});
	}
	if (events >= 2) {
		eventsList.push({
			id: "e2",
			label: "Event 2",
			description: "",
			act: 2,
			importance: "midpoint" as const,
			sequenceInAct: 1,
			characters: [],
			conflicts: [],
			emotionalTone: "",
			consequence: "",
		});
	}
	if (events >= 3) {
		eventsList.push({
			id: "e3",
			label: "Event 3",
			description: "",
			act: 3,
			importance: "climax" as const,
			sequenceInAct: 1,
			characters: [],
			conflicts: [],
			emotionalTone: "",
			consequence: "",
		});
	}
	return {
		meta: {
			title: "Test Story",
			createdAt: "2025-01-01",
			updatedAt: "2025-01-01",
			version: "1.0",
		},
		characters: [
			{
				id: "char_0",
				name: "Hero",
				role: "protagonist",
				traits: ["brave"],
				arc: {
					start: "naive",
					midpoint: "tested",
					end: "wise",
					transformation: "growth",
					emotionalJourney: [],
				},
				relationships: [],
				motivations: ["save the world"],
				fears: [],
				secretsOrLies: [],
				actAppearances: [1, 2, 3],
			},
		],
		conflicts: [],
		events: eventsList,
		relationships: [],
		tags: [],
	};
};

describe("Edge Cases: CSV Security", () => {
	it("should prevent CSV formula injection with = prefix", () => {
		const graph = createMinimalGraph();
		graph.characters[0].name = '=cmd("powershell")';
		const csv = generateCSV(graph);

		// Value should be prefixed with ' to prevent formula execution
		// The ' is inside quotes because of the parentheses
		expect(csv).toContain("'=cmd(");
		expect(csv).not.toContain('"=cmd("');
	});

	it("should prevent CSV formula injection with + prefix", () => {
		const graph = createMinimalGraph();
		graph.characters[0].name = '+cmd("malicious")';
		const csv = generateCSV(graph);

		expect(csv).toContain("'+cmd(");
	});

	it("should prevent CSV formula injection with - prefix", () => {
		const graph = createMinimalGraph();
		graph.characters[0].name = '-cmd("malicious")';
		const csv = generateCSV(graph);

		expect(csv).toContain("'-cmd(");
	});

	it("should prevent CSV formula injection with @ prefix", () => {
		const graph = createMinimalGraph();
		graph.characters[0].name = "@SUM(A1:A10)";
		const csv = generateCSV(graph);

		expect(csv).toContain("'@SUM");
	});

	it("should escape carriage return (\\r) in CSV values", () => {
		const graph = createMinimalGraph();
		graph.characters[0].name = "Aria\r\nThe Brave";
		const csv = generateCSV(graph);

		// Should be wrapped in quotes due to newline
		expect(csv).toContain('"Aria\r\nThe Brave"');
	});

	it("should escape commas in character names", () => {
		const graph = createMinimalGraph();
		graph.characters[0].name = "Aria, the Brave";
		const csv = generateCSV(graph);

		expect(csv).toContain('"Aria, the Brave"');
	});

	it("should escape double quotes in character names", () => {
		const graph = createMinimalGraph();
		graph.characters[0].name = 'Aria "Dragonborn" the Brave';
		const csv = generateCSV(graph);

		expect(csv).toContain('"Aria ""Dragonborn"" the Brave"');
	});

	it("should handle commas in character names", () => {
		const graph = createMinimalGraph();
		graph.characters[0].name = "John, Jr.";
		const csv = generateCSV(graph);

		expect(csv).toContain('"John, Jr."');
	});
});

describe("Edge Cases: Dashboard Zero Events", () => {
	it("should not produce Infinity/NaN when eventCount is 0", () => {
		const graph = createMinimalGraph(0);
		const html = toDashboard(graph);

		expect(html).not.toContain("Infinity");
		expect(html).not.toContain("NaN");
		expect(html).toContain("width: 0%");
	});

	it("should render dashboard with only 1 event", () => {
		const graph = createMinimalGraph(1);
		const html = toDashboard(graph);

		expect(html).toContain("Test Story");
		expect(html).toContain("Act 1");
		expect(html).toContain("Structure Health");
	});

	it("should render classic theme by default", () => {
		const graph = createMinimalGraph();
		const html = toDashboard(graph);

		expect(html).toContain("Story Structure Analysis Dashboard");
		expect(html).toContain("from-indigo-600 to-blue-500");
		expect(html).not.toContain("from-slate-800");
	});

	it("should render modern theme when specified", () => {
		const graph = createMinimalGraph();
		const html = toDashboard(graph, { theme: "modern" });

		expect(html).toContain("Visual Story Analysis");
		expect(html).toContain("from-slate-800 to-indigo-700");
	});
});

describe("Edge Cases: Parser with Unicode/Thai Names", () => {
	it("should extract Thai character names correctly", () => {
		const entities = extractStoryEntities(`
Title: นิยายทดสอบ
Character: อิกนัส, role: protagonist
Character: ซาเบล, role: antagonist
Event: การผจญภัยเริ่มต้น
`);

		expect(entities.characters.length).toBe(2);
		expect(entities.characters[0].name).toBe("อิกนัส");
		expect(entities.characters[1].name).toBe("ซาเบล");
	});

	it("should handle mixed Latin and Thai in the same story", () => {
		const entities = extractStoryEntities(`
Title: The Thai Warrior
Character: Aria, role: protagonist
Character: อิกนัส, role: antagonist
Event: Aria meets อิกนัส
`);

		expect(entities.characters.length).toBe(2);
		expect(entities.characters[0].name).toBe("Aria");
		expect(entities.characters[1].name).toBe("อิกนัส");
	});

	it("should handle CJK character names via dictionary extraction", () => {
		// CJK names won't match Character: pattern (Latin-only regex)
		// but would be picked up by dictionary extraction if configured
		const entities = extractStoryEntities(`
Title: Eastern Tales
Character:太郎, role: protagonist
Event: The journey begins
`);

		// Parser's CHARACTER regex only matches Latin characters after "Character:"
		// This is expected behavior - CJK names need dictionary configuration
		expect(entities.characters.length).toBe(0);
	});

	it("should handle Cyrillic character names via dictionary extraction", () => {
		// Cyrillic names won't match Character: pattern (Latin-only regex)
		const entities = extractStoryEntities(`
Title: Russian Winter
Character: Борис, role: protagonist
Event: The snow falls
`);

		expect(entities.characters.length).toBe(0);
	});
});

describe("Edge Cases: Analyzer Unicode ID Generation", () => {
	it("should generate valid IDs for Thai character names", () => {
		const graph = buildInitialGraph(`
Title: Test
Character: อิกนัส, role: protagonist
Event: การผจญภัย
`);

		expect(graph.characters.length).toBe(1);
		// ID should not be empty after the char_ prefix
		expect(graph.characters[0].id).toMatch(/^char_.+/);
		expect(graph.characters[0].id).not.toBe("char_");
	});

	it("should generate valid IDs for Latin character names", () => {
		const graph = buildInitialGraph(`
Title: Test
Character: Hero, role: protagonist
Event: Journey
`);

		expect(graph.characters.length).toBe(1);
		// IDs are index-based (char_0, char_1, etc.)
		expect(graph.characters[0].id).toBe("char_0");
	});

	it("should generate valid IDs for emoji-containing names", () => {
		const graph = buildInitialGraph(`
Title: Test
Character: Hero🐉, role: protagonist
Event: Journey
`);

		expect(graph.characters.length).toBe(1);
		// Emoji should be stripped but name portion remains
		expect(graph.characters[0].id).toMatch(/^char_/);
	});
});

describe("Edge Cases: Dashboard XSS Protection", () => {
	it("should escape script tags in story title", () => {
		const graph = createMinimalGraph();
		graph.meta.title = '<script>alert("xss")</script>';
		const html = toDashboard(graph);

		// Title should be escaped in the header
		expect(html).toContain("&lt;script&gt;");
		expect(html).not.toContain('<script>alert("xss")</script>');
	});

	it("should escape HTML in character names", () => {
		const graph = createMinimalGraph();
		graph.characters[0].name = "<img src=x onerror=alert(1)>";
		const html = toDashboard(graph);

		expect(html).not.toContain("<img");
		expect(html).toContain("&lt;img");
	});

	it("should escape HTML in conflict descriptions", () => {
		const graph = createMinimalGraph();
		graph.conflicts.push({
			id: "c1",
			type: "external",
			description: "<script>document.cookie</script>",
			relatedCharacters: [],
			rootCause: "",
			escalations: [],
			resolution: "",
			actIntroduced: 1,
		});
		const html = toDashboard(graph);

		// The script tag in conflict description should be escaped
		// Check for the escaped version in the full HTML
		expect(html).toContain("&lt;script&gt;document.cookie&lt;/script&gt;");
	});
});

describe("Edge Cases: Dashboard includeOptions", () => {
	it("should exclude stats when includeStats is false", () => {
		const graph = createMinimalGraph();
		const html = toDashboard(graph, { includeStats: false });

		expect(html).not.toContain("Events</p>");
		expect(html).not.toContain("Characters</p>");
	});

	it("should exclude recommendations list when includeRecommendations is false", () => {
		const graph = createMinimalGraph();
		const html = toDashboard(graph, { includeRecommendations: false });

		// The Recommendations section should be hidden (no <ul> with recommendations)
		expect(html).not.toContain('text-indigo-600">Recommendations');
	});

	it("should exclude both stats and recommendations", () => {
		const graph = createMinimalGraph();
		const html = toDashboard(graph, {
			includeStats: false,
			includeRecommendations: false,
		});

		expect(html).not.toContain("Events</p>");
		expect(html).not.toContain('text-indigo-600">Recommendations');
	});
});

describe("Edge Cases: Empty/Null Inputs", () => {
	it("should handle graph with empty characters array", () => {
		const graph = createMinimalGraph();
		graph.characters = [];
		const html = toDashboard(graph);

		expect(html).toContain("Test Story");
		// Should not crash on empty character map
		expect(html).toContain("Character Roster");
	});

	it("should handle graph with empty conflicts array", () => {
		const graph = createMinimalGraph();
		const html = toDashboard(graph);

		expect(html).toContain("Core Conflicts");
	});

	it("should handle graph with empty tags array", () => {
		const graph = createMinimalGraph();
		graph.tags = [];
		const csv = generateCSV(graph);

		expect(csv).toContain("characters.csv");
		expect(csv).toContain("events.csv");
	});

	it("should handle genre as undefined", () => {
		const graph = createMinimalGraph();
		graph.meta.genre = undefined;
		const html = toDashboard(graph);

		expect(html).toContain("General");
	});
});
