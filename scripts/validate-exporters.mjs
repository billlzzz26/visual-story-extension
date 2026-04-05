#!/usr/bin/env node
/**
 * Validate all exporters produce correct output from a test StoryGraph.
 * Runs in CI after `npm run build`.
 *
 * Exit code 0 = all pass, 1 = failure.
 */

import { buildInitialGraph } from "../packages/bl1nk/analyzer.js";
import { toCanvasJSON } from "../packages/bl1nk/exporters/canvas.js";
import { toDashboard } from "../packages/bl1nk/exporters/dashboard.js";
import { toMarkdown } from "../packages/bl1nk/exporters/markdown.js";
import { toMermaid } from "../packages/bl1nk/exporters/mermaid.js";
import { validateGraph } from "../packages/bl1nk/validators.js";

const SAMPLE = `
Title: Dragon's Heir

Character: Aria, role: protagonist
Aria is brave and determined.

Character: Shadow King, role: antagonist
The Shadow King is corrupted and powerful.

Event: Aria discovers the amulet
Event: Mysterious Stranger arrives
Event: Learning the truth
Event: Journey to Whispering Woods
Event: Meeting Kael
Event: Shadow King's forces attack
Event: Aria loses control
Event: Arrival at Dragon Temple
Event: Shadow King awaits
Event: Final battle
Event: Aria embraces her heritage

Conflict: Aria vs Shadow King
Conflict: Aria vs Self-Doubt
`;

let passed = 0;
let failed = 0;

function assert(condition, message) {
	if (!condition) {
		console.error(`  FAIL: ${message}`);
		failed++;
	} else {
		passed++;
	}
}

// --- Build graph ---
console.log("\n--- Analyzer ---");
const graph = buildInitialGraph(SAMPLE);

assert(graph.meta.title === "Dragon's Heir", "title extracted");
assert(
	graph.characters.length === 2,
	`expected 2 characters, got ${graph.characters.length}`,
);
assert(
	graph.events.length === 11,
	`expected 11 events, got ${graph.events.length}`,
);
assert(
	graph.conflicts.length === 2,
	`expected 2 conflicts, got ${graph.conflicts.length}`,
);
assert(graph.relationships.length >= 1, "has relationships");

// --- Validator ---
console.log("\n--- Validator ---");
const result = validateGraph(graph);
assert(result.isValid === true, "graph is valid");
assert(result.analysis.eventCount === 11, "eventCount correct");
assert(result.analysis.characterCount === 2, "characterCount correct");
assert(result.analysis.hasClimax === true, "hasClimax detected");

// --- Mermaid ---
console.log("\n--- Mermaid Exporter ---");
const mermaid = toMermaid(graph);
assert(typeof mermaid === "string", "mermaid output is string");
assert(mermaid.includes("graph TD"), "has graph header");
assert(mermaid.includes("subgraph Act_1"), "has Act 1 subgraph");
assert(mermaid.includes("subgraph Act_2"), "has Act 2 subgraph");
assert(mermaid.includes("subgraph Act_3"), "has Act 3 subgraph");
assert(mermaid.includes("-->"), "has connections");
assert(mermaid.includes("classDef climax"), "has climax style");

const mermaidDark = toMermaid(graph, { style: "dark" });
assert(mermaidDark.includes("'theme': 'dark'"), "dark theme applied");

const mermaidMinimal = toMermaid(graph, { style: "minimal" });
assert(mermaidMinimal.includes("'theme': 'neutral'"), "minimal theme applied");

// --- Canvas ---
console.log("\n--- Canvas Exporter ---");
const canvas = toCanvasJSON(graph);
assert(Array.isArray(canvas.nodes), "canvas has nodes array");
assert(Array.isArray(canvas.edges), "canvas has edges array");
assert(
	canvas.nodes.length ===
		graph.events.length + graph.characters.length + graph.conflicts.length,
	`node count: expected ${graph.events.length + graph.characters.length + graph.conflicts.length}, got ${canvas.nodes.length}`,
);
assert(canvas.viewport, "has viewport");
assert(canvas.metadata, "has metadata by default");
assert(canvas.metadata.title === "Dragon's Heir", "metadata has title");

const eventNodes = canvas.nodes.filter((n) => n.type === "event");
assert(eventNodes.length === 11, "correct event node count");

const charNodes = canvas.nodes.filter((n) => n.type === "character");
assert(charNodes.length === 2, "correct character node count");

const conflictNodes = canvas.nodes.filter((n) => n.type === "conflict");
assert(conflictNodes.length === 2, "correct conflict node count");

const seqEdges = canvas.edges.filter((e) => e.id.startsWith("seq_"));
assert(
	seqEdges.length === graph.events.length - 1,
	"correct sequential edge count",
);

const canvasNoMeta = toCanvasJSON(graph, { includeMetadata: false });
assert(canvasNoMeta.metadata === undefined, "metadata excluded when requested");

// --- Markdown ---
console.log("\n--- Markdown Exporter ---");
const md = toMarkdown(graph);
assert(typeof md === "string", "markdown output is string");
assert(md.includes("Dragon's Heir"), "has title");
assert(md.includes("## Characters"), "has Characters section");
assert(md.includes("## Events"), "has Events section");
assert(md.includes("## Conflicts"), "has Conflicts section");
assert(md.includes("Aria"), "mentions Aria");
assert(md.includes("Shadow King"), "mentions Shadow King");
assert(md.includes("Act 1"), "has Act 1");
assert(md.includes("Act 2"), "has Act 2");
assert(md.includes("Act 3"), "has Act 3");

// --- Dashboard ---
console.log("\n--- Dashboard Exporter ---");
const dashboard = toDashboard(graph);
assert(typeof dashboard === "string", "dashboard output is string");
assert(dashboard.includes("<!DOCTYPE html>"), "is valid HTML5");
assert(dashboard.includes("Dragon's Heir"), "has title");
assert(dashboard.includes("chart.js"), "includes Chart.js");
assert(dashboard.includes("tailwindcss.com"), "includes Tailwind");
assert(dashboard.includes("Aria"), "mentions Aria");
assert(dashboard.includes("actChart"), "has act distribution chart");

// XSS check — title should be escaped in <title> and <h1>
const xssGraph = buildInitialGraph(
	'Title: Test <script>alert("xss")</script>\nCharacter: Hero, role: protagonist',
);
const xssDashboard = toDashboard(xssGraph);
assert(
	xssDashboard.includes("&lt;script&gt;"),
	"HTML entities escaped in dashboard",
);

// --- Summary ---
console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);

if (failed > 0) {
	process.exit(1);
}
