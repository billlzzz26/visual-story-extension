import { describe, expect, it } from "vitest";
import { buildInitialGraph } from "../packages/bl1nk/analyzer.js";
import { toCanvasJSON } from "../packages/bl1nk/exporters/canvas.js";
import { toDashboard } from "../packages/bl1nk/exporters/dashboard.js";
import { toMermaid } from "../packages/bl1nk/exporters/mermaid.js";
import { executeStoryTool } from "../packages/bl1nk/src/index.js";
import type {
	CanvasEdge,
	CanvasNode,
	StoryGraph,
} from "../packages/bl1nk/types.js";
import { validateGraph } from "../packages/bl1nk/validators.js";

describe("bl1nk-visual-mcp Core Logic", () => {
	const storyText = `
Title: The Dragon's Heir

Character: Aria, role: protagonist
Aria is brave and determined.

Character: Shadow King, role: antagonist
The Shadow King is corrupted and powerful.

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

	describe("Validators - Enhanced", () => {
		it("should validate story structure and detect climax", () => {
			const graph = buildInitialGraph(storyText);
			const result = validateGraph(graph);

			expect(result.isValid).toBe(true);
			expect(result.analysis.hasClimax).toBe(true);
			expect(result.analysis.eventCount).toBe(13);
		});

		it("should detect missing climax as error", () => {
			const noClimaxStory = `
Title: No Climax
Character: Hero, role: protagonist
Event: Just walking
Event: Still walking
Event: The end
`;
			const graph = buildInitialGraph(noClimaxStory);
			const result = validateGraph(graph);

			expect(result.isValid).toBe(false);
			expect(result.issues.some((i) => i.code === "MISSING_CLIMAX")).toBe(true);
			expect(
				result.issues.find((i) => i.code === "MISSING_CLIMAX")?.severity,
			).toBe("error");
			expect(
				result.issues.find((i) => i.code === "MISSING_CLIMAX")?.suggestion,
			).toContain("Act 3");
		});

		it("should validate act distribution (25-50-25 rule)", () => {
			const graph = buildInitialGraph(storyText);
			const result = validateGraph(graph);

			// Should have proper act distribution
			const act1Pct =
				(result.analysis.actBalance.act1 / result.analysis.eventCount) * 100;
			const act2Pct =
				(result.analysis.actBalance.act2 / result.analysis.eventCount) * 100;
			const act3Pct =
				(result.analysis.actBalance.act3 / result.analysis.eventCount) * 100;

			expect(act1Pct).toBeGreaterThan(15);
			expect(act1Pct).toBeLessThan(35);
			expect(act2Pct).toBeGreaterThan(30);
			expect(act3Pct).toBeGreaterThan(15);
		});

		it("should detect Act 1 imbalance", () => {
			const graph = buildInitialGraph(storyText);
			// Force imbalance - make all events Act 1
			graph.events.forEach((e, i) => {
				if (i < 8) e.act = 1;
				else if (i < 9) e.act = 2;
				else e.act = 3;
			});

			const result = validateGraph(graph);
			expect(result.issues.some((i) => i.code === "ACT1_IMBALANCE")).toBe(true);
			expect(
				result.issues.find((i) => i.code === "ACT1_IMBALANCE")?.message,
			).toContain("25%");
		});

		it("should detect Act 2 imbalance", () => {
			const graph = buildInitialGraph(storyText);
			// Force imbalance - make Act 2 too small
			graph.events.forEach((e, i) => {
				if (i < 5) e.act = 1;
				else if (i < 7)
					e.act = 2; // Only 2 events in Act 2
				else e.act = 3;
			});

			const result = validateGraph(graph);
			expect(result.issues.some((i) => i.code === "ACT2_IMBALANCE")).toBe(true);
		});

		it("should detect Act 3 imbalance", () => {
			const graph = buildInitialGraph(storyText);
			// Force imbalance - make Act 3 too large
			graph.events.forEach((e, i) => {
				if (i < 3) e.act = 1;
				else if (i < 5) e.act = 2;
				else e.act = 3; // Most events in Act 3
			});

			const result = validateGraph(graph);
			expect(result.issues.some((i) => i.code === "ACT3_IMBALANCE")).toBe(true);
		});

		it("should validate in strict mode and check character motivations", () => {
			const graph = buildInitialGraph(storyText);
			const result = validateGraph(graph, true);

			// Characters created by buildInitialGraph have empty motivations array
			expect(result.issues.some((i) => i.code === "NO_MOTIVATION")).toBe(true);
			expect(
				result.issues.filter((i) => i.code === "NO_MOTIVATION").length,
			).toBe(2); // Both characters
		});

		it("should check character transformation arc in strict mode", () => {
			const graph = buildInitialGraph(storyText);
			const result = validateGraph(graph, true);

			// Characters created by buildInitialGraph have empty transformation
			expect(result.issues.some((i) => i.code === "NO_ARC")).toBe(true);
			expect(result.issues.find((i) => i.code === "NO_ARC")?.severity).toBe(
				"warning",
			);
		});

		it("should not validate character details in non-strict mode", () => {
			const graph = buildInitialGraph(storyText);
			const result = validateGraph(graph, false);

			// Should not check motivations in non-strict mode
			expect(result.issues.some((i) => i.code === "NO_MOTIVATION")).toBe(false);
		});

		it("should provide recommendations for missing climax", () => {
			const noClimaxStory = `
Title: No Climax
Character: Hero, role: protagonist
Event: Event 1
Event: Event 2
Event: Event 3
Event: Event 4
`;
			const graph = buildInitialGraph(noClimaxStory);
			const result = validateGraph(graph);

			expect(result.recommendations).toContain(
				"Define a clear Climax in Act 3 to resolve the main conflict",
			);
		});

		it("should recommend expanding Act 2 if too small", () => {
			const graph = buildInitialGraph(storyText);
			// Make Act 2 < 40%
			graph.events.forEach((e, i) => {
				if (i < 6) e.act = 1;
				else if (i < 8)
					e.act = 2; // Only 2 out of 13 events
				else e.act = 3;
			});

			const result = validateGraph(graph);
			expect(result.recommendations).toContain(
				"Expand Act 2 to develop the rising action and character relationships",
			);
		});

		it("should recommend adding conflicts if too few", () => {
			const graph = buildInitialGraph(storyText);
			graph.conflicts = [graph.conflicts[0]]; // Only 1 conflict

			const result = validateGraph(graph);
			expect(result.recommendations).toContain(
				"Consider adding subplots or internal conflicts to increase depth",
			);
		});

		it("should calculate pacing correctly", () => {
			const slowStory = `
Title: Slow
Character: Hero, role: protagonist
Event: Event 1
Event: Event 2
`;
			const slowGraph = buildInitialGraph(slowStory);
			const slowResult = validateGraph(slowGraph);
			expect(slowResult.analysis.pacing).toBe("slow");

			const fastGraph = buildInitialGraph(storyText);
			// Add more events to make it fast (>15)
			for (let i = 0; i < 5; i++) {
				fastGraph.events.push({
					id: `extra_${i}`,
					label: `Extra event ${i}`,
					description: "Extra",
					act: 2,
					importance: "rising",
					sequenceInAct: i,
					characters: [],
					conflicts: [],
					emotionalTone: "neutral",
					consequence: "",
				});
			}
			const fastResult = validateGraph(fastGraph);
			expect(fastResult.analysis.pacing).toBe("fast");
		});

		it("should handle edge case with no events", () => {
			const emptyGraph: StoryGraph = {
				meta: {
					title: "Empty",
					createdAt: "",
					updatedAt: "",
					version: "1.0.0",
				},
				characters: [],
				conflicts: [],
				events: [],
				relationships: [],
				tags: [],
			};

			const result = validateGraph(emptyGraph);
			expect(result.isValid).toBe(false);
			expect(result.analysis.eventCount).toBe(0);
			expect(result.analysis.actBalance.balance).toBe(0);
		});
	});

	describe("Canvas Exporter - Enhanced", () => {
		it("should return proper structure with nodes and edges", () => {
			const graph = buildInitialGraph(storyText);
			const canvas = toCanvasJSON(graph);

			expect(canvas).toHaveProperty("nodes");
			expect(canvas).toHaveProperty("edges");
			expect(canvas).toHaveProperty("viewport");
			expect(Array.isArray(canvas.nodes)).toBe(true);
			expect(Array.isArray(canvas.edges)).toBe(true);
		});

		it("should create event nodes with proper structure", () => {
			const graph = buildInitialGraph(storyText);
			const canvas = toCanvasJSON(graph);

			const eventNodes = canvas.nodes.filter(
				(n: CanvasNode) => n.type === "event",
			);
			expect(eventNodes.length).toBe(graph.events.length);

			const firstEvent = eventNodes[0];
			expect(firstEvent).toHaveProperty("id");
			expect(firstEvent).toHaveProperty("type", "event");
			expect(firstEvent).toHaveProperty("data");
			expect(firstEvent.data).toHaveProperty("label");
			expect(firstEvent.data).toHaveProperty("act");
			expect(firstEvent.data).toHaveProperty("importance");
			expect(firstEvent.data).toHaveProperty("emotionalTone");
			expect(firstEvent).toHaveProperty("position");
			expect(firstEvent).toHaveProperty("style");
		});

		it("should create character nodes with proper structure", () => {
			const graph = buildInitialGraph(storyText);
			const canvas = toCanvasJSON(graph);

			const charNodes = canvas.nodes.filter(
				(n: CanvasNode) => n.type === "character",
			);
			expect(charNodes.length).toBe(graph.characters.length);

			const firstChar = charNodes[0];
			expect(firstChar.data).toHaveProperty("label");
			expect(firstChar.data).toHaveProperty("role");
			expect(firstChar.data).toHaveProperty("traits");
			expect(firstChar.data).toHaveProperty("arc");
			expect(firstChar.style).toHaveProperty("backgroundColor", "#e3f2fd");
		});

		it("should create conflict nodes with proper structure", () => {
			const graph = buildInitialGraph(storyText);
			const canvas = toCanvasJSON(graph);

			const conflictNodes = canvas.nodes.filter(
				(n: CanvasNode) => n.type === "conflict",
			);
			expect(conflictNodes.length).toBe(graph.conflicts.length);

			const firstConflict = conflictNodes[0];
			expect(firstConflict.data).toHaveProperty("label");
			expect(firstConflict.data).toHaveProperty("type");
			expect(firstConflict.data).toHaveProperty("intensity");
			expect(firstConflict.style).toHaveProperty("shape", "diamond");
		});

		it("should create sequential edges between events", () => {
			const graph = buildInitialGraph(storyText);
			const canvas = toCanvasJSON(graph);

			const seqEdges = canvas.edges.filter((e: CanvasEdge) =>
				e.id.startsWith("seq_"),
			);
			// Should have n-1 sequential edges for n events
			expect(seqEdges.length).toBe(graph.events.length - 1);
		});

		it("should create relationship edges", () => {
			const graph = buildInitialGraph(storyText);
			const canvas = toCanvasJSON(graph);

			const relEdges = canvas.edges.filter((e: CanvasEdge) =>
				e.id.startsWith("rel_"),
			);
			expect(relEdges.length).toBe(graph.relationships.length);
		});

		it("should apply correct styles for different importance levels", () => {
			const graph = buildInitialGraph(storyText);
			const canvas = toCanvasJSON(graph);

			const climaxEvents = canvas.nodes.filter(
				(n: CanvasNode) => n.type === "event" && n.data.importance === "climax",
			);

			if (climaxEvents.length > 0) {
				const style = climaxEvents[0].style;
				expect(style?.backgroundColor).toBe("#ffebee");
				expect(style?.borderColor).toBe("#c62828");
				expect(style?.borderWidth).toBe(4);
			}
		});

		it("should include metadata when requested", () => {
			const graph = buildInitialGraph(storyText);
			const canvas = toCanvasJSON(graph, { includeMetadata: true });

			expect(canvas.metadata).toBeDefined();
			expect(canvas.metadata?.title).toBe(graph.meta.title);
			expect(canvas.metadata?.stats).toHaveProperty("events");
			expect(canvas.metadata?.stats).toHaveProperty("characters");
			expect(canvas.metadata?.stats).toHaveProperty("conflicts");
		});

		it("should exclude metadata when not requested", () => {
			const graph = buildInitialGraph(storyText);
			const canvas = toCanvasJSON(graph, { includeMetadata: false });

			expect(canvas.metadata).toBeUndefined();
		});

		it("should animate high-strength relationships", () => {
			const graph = buildInitialGraph(storyText);
			// Set high strength
			if (graph.relationships.length > 0) {
				graph.relationships[0].strength = 8;
			}
			const canvas = toCanvasJSON(graph);

			const relEdges = canvas.edges.filter((e: CanvasEdge) =>
				e.id.startsWith("rel_"),
			);
			if (relEdges.length > 0) {
				const highStrength = relEdges.find(
					(e: CanvasEdge) => e.animated === true,
				);
				expect(highStrength).toBeDefined();
			}
		});

		it("should position events by act", () => {
			const graph = buildInitialGraph(storyText);
			const canvas = toCanvasJSON(graph);

			const act1Events = canvas.nodes.filter(
				(n: CanvasNode) => n.type === "event" && n.data.act === 1,
			);
			const act2Events = canvas.nodes.filter(
				(n: CanvasNode) => n.type === "event" && n.data.act === 2,
			);

			if (act1Events.length > 0 && act2Events.length > 0) {
				// Act 2 events should be further right (x position)
				expect(act2Events[0].position.x).toBeGreaterThan(
					act1Events[0].position.x,
				);
			}
		});
	});

	describe("Mermaid Exporter - Enhanced", () => {
		it("should generate mermaid diagram with proper header", () => {
			const graph = buildInitialGraph(storyText);
			const mermaid = toMermaid(graph);

			expect(mermaid).toContain("graph TD");
			expect(mermaid).toContain("bl1nk-visual-mcp");
		});

		it("should use different shapes for different importance levels", () => {
			const graph = buildInitialGraph(storyText);
			const mermaid = toMermaid(graph);

			// Climax should use double circle shape ((...))
			const hasClimax = graph.events.some((e) => e.importance === "climax");
			if (hasClimax) {
				expect(mermaid).toMatch(/\(\(/); // Double circle
			}
		});

		it("should apply dark theme when requested", () => {
			const graph = buildInitialGraph(storyText);
			const mermaid = toMermaid(graph, { style: "dark" });

			expect(mermaid).toContain("'theme': 'dark'");
		});

		it("should apply neutral theme for minimal style", () => {
			const graph = buildInitialGraph(storyText);
			const mermaid = toMermaid(graph, { style: "minimal" });

			expect(mermaid).toContain("'theme': 'neutral'");
		});

		it("should use default theme when not specified", () => {
			const graph = buildInitialGraph(storyText);
			const mermaid = toMermaid(graph);

			expect(mermaid).toContain("'theme': 'default'");
		});

		it("should create subgraphs for each act", () => {
			const graph = buildInitialGraph(storyText);
			const mermaid = toMermaid(graph);

			expect(mermaid).toContain("subgraph Act_1");
			expect(mermaid).toContain("subgraph Act_2");
			expect(mermaid).toContain("subgraph Act_3");
		});

		it("should include style definitions", () => {
			const graph = buildInitialGraph(storyText);
			const mermaid = toMermaid(graph);

			expect(mermaid).toContain("classDef inciting");
			expect(mermaid).toContain("classDef midpoint");
			expect(mermaid).toContain("classDef climax");
			expect(mermaid).toContain("classDef resolution");
			expect(mermaid).toContain("classDef rising");
		});

		it("should connect events in sequence", () => {
			const graph = buildInitialGraph(storyText);
			const mermaid = toMermaid(graph);

			// Should have arrows connecting events
			expect(mermaid).toContain("-->");
		});

		it("should include metadata when requested", () => {
			const graph = buildInitialGraph(storyText);
			const mermaid = toMermaid(graph, { includeMetadata: true });

			expect(mermaid).toContain(`%% Title: ${graph.meta.title}`);
		});

		it("should exclude metadata when not requested", () => {
			const graph = buildInitialGraph(storyText);
			const mermaid = toMermaid(graph, { includeMetadata: false });

			expect(mermaid).not.toContain("%% Title:");
		});

		it("should handle quotes in event labels", () => {
			const graph = buildInitialGraph(storyText);
			graph.events[0].label = 'Event with "quotes"';
			const mermaid = toMermaid(graph);

			// Should replace double quotes with single quotes
			expect(mermaid).toContain("'quotes'");
		});
	});

	describe("Dashboard Exporter - Enhanced", () => {
		it("should generate valid HTML5 document", () => {
			const graph = buildInitialGraph(storyText);
			const html = toDashboard(graph);

			expect(html).toContain("<!DOCTYPE html>");
			expect(html).toContain('<html lang="en">');
			expect(html).toContain("</html>");
		});

		it("should include Tailwind CSS and Chart.js", () => {
			const graph = buildInitialGraph(storyText);
			const html = toDashboard(graph);

			expect(html).toContain("tailwindcss.com");
			expect(html).toContain("chart.js");
		});

		it("should display story title and metadata", () => {
			const graph = buildInitialGraph(storyText);
			const html = toDashboard(graph);

			expect(html).toContain(graph.meta.title);
			expect(html).toContain("Story Structure Analysis Dashboard");
		});

		it("should display statistics grid", () => {
			const graph = buildInitialGraph(storyText);
			const html = toDashboard(graph);

			expect(html).toContain("Events");
			expect(html).toContain("Characters");
			expect(html).toContain("Conflicts");
			expect(html).toContain("Pacing");
		});

		it("should include act distribution chart", () => {
			const graph = buildInitialGraph(storyText);
			const html = toDashboard(graph);

			expect(html).toContain("actChart");
			expect(html).toContain("3-Act Structure Distribution");
			expect(html).toContain("Chart(ctx");
		});

		it("should display key milestones", () => {
			const graph = buildInitialGraph(storyText);
			const html = toDashboard(graph);

			expect(html).toContain("Midpoint");
			expect(html).toContain("Climax");
			expect(html).toContain("Structure Score");
		});

		it("should show structural issues", () => {
			const noClimaxStory = `
Title: No Climax
Character: Hero, role: protagonist
Event: Event 1
Event: Event 2
`;
			const graph = buildInitialGraph(noClimaxStory);
			const html = toDashboard(graph);

			expect(html).toContain("Structural Issues");
			expect(html).toContain("MISSING_CLIMAX");
		});

		it("should display recommendations", () => {
			const graph = buildInitialGraph(storyText);
			const html = toDashboard(graph);

			expect(html).toContain("Recommendations");
		});

		it("should list characters with roles", () => {
			const graph = buildInitialGraph(storyText);
			const html = toDashboard(graph);

			expect(html).toContain("Character Roster");
			expect(html).toContain("Aria");
			expect(html).toContain("Shadow King");
		});

		it("should list conflicts", () => {
			const graph = buildInitialGraph(storyText);
			const html = toDashboard(graph);

			expect(html).toContain("Core Conflicts");
			expect(html).toContain("Aria vs Shadow King");
		});

		it("should properly escape HTML entities", () => {
			const graph = buildInitialGraph(storyText);
			graph.meta.title = 'Test <script>alert("xss")</script>';
			const html = toDashboard(graph);

			// Check that the title specifically is escaped (not the legitimate script tags for Chart.js)
			expect(html).toContain(
				'<title>Test &lt;script&gt;alert("xss")&lt;/script&gt; - bl1nk Story Dashboard</title>',
			);
			expect(html).toContain(
				'<h1 class="text-4xl font-bold mb-2">Test &lt;script&gt;alert("xss")&lt;/script&gt;</h1>',
			);
		});

		it("should show success message when no issues", () => {
			const graph = buildInitialGraph(storyText);
			const html = toDashboard(graph);

			// If valid, should show success message
			const validation = validateGraph(graph);
			if (validation.issues.length === 0) {
				expect(html).toContain("No structural issues found");
			}
		});

		it("should display genre when available", () => {
			const graph = buildInitialGraph(storyText);
			graph.meta.genre = "Fantasy";
			const html = toDashboard(graph);

			expect(html).toContain("Fantasy");
		});

		it("should display version number", () => {
			const graph = buildInitialGraph(storyText);
			const html = toDashboard(graph);

			expect(html).toContain(`v${graph.meta.version}`);
		});
	});

	describe("Server - Enhanced Error Handling", () => {
		it("should handle analyze_story tool correctly", async () => {
			const result = await executeStoryTool("analyze_story", {
				text: storyText,
				includeMetadata: true,
			});

			expect(result.content).toBeDefined();
			expect(result.content[0].type).toBe("text");
			expect(result.content[0].text).toContain("The Dragon's Heir");
		});

		it("should handle export_mermaid tool correctly", async () => {
			const graph = buildInitialGraph(storyText);
			const result = await executeStoryTool("export_mermaid", {
				graph,
				style: "dark",
			});

			expect(result.content[0].text).toContain("graph TD");
			expect(result.content[0].text).toContain("dark");
		});

		it("should handle export_canvas tool correctly", async () => {
			const graph = buildInitialGraph(storyText);
			const result = await executeStoryTool("export_canvas", {
				graph,
				includeMetadata: true,
			});

			const canvas = JSON.parse(result.content[0].text);
			expect(canvas).toHaveProperty("nodes");
			expect(canvas).toHaveProperty("edges");
		});

		it("should handle export_dashboard tool correctly", async () => {
			const graph = buildInitialGraph(storyText);
			const result = await executeStoryTool("export_dashboard", {
				graph,
				includeStats: true,
			});

			expect(result.content[0].text).toContain("<!DOCTYPE html>");
		});

		it("should handle validate_story_structure tool correctly", async () => {
			const graph = buildInitialGraph(storyText);
			const result = await executeStoryTool("validate_story_structure", {
				graph,
				strict: false,
			});

			const validation = JSON.parse(result.content[0].text);
			expect(validation).toHaveProperty("isValid");
			expect(validation).toHaveProperty("issues");
			expect(validation).toHaveProperty("analysis");
		});

		it("should handle extract_characters tool correctly", async () => {
			const graph = buildInitialGraph(storyText);
			const result = await executeStoryTool("extract_characters", {
				graph,
				detailed: true,
			});

			const data = JSON.parse(result.content[0].text);
			expect(data.count).toBe(2);
			expect(data.characters).toBeDefined();
		});

		it("should handle extract_conflicts tool correctly", async () => {
			const graph = buildInitialGraph(storyText);
			const result = await executeStoryTool("extract_conflicts", {
				graph,
				includeEscalation: true,
			});

			const data = JSON.parse(result.content[0].text);
			expect(data.count).toBe(2);
			expect(data.conflicts).toBeDefined();
		});

		it("should handle build_relationship_graph tool correctly", async () => {
			const graph = buildInitialGraph(storyText);
			const result = await executeStoryTool("build_relationship_graph", {
				graph,
				includeStats: true,
			});

			const data = JSON.parse(result.content[0].text);
			expect(data.count).toBeGreaterThan(0);
			expect(data.relationships).toBeDefined();
		});

		it("should return error for unknown tool", async () => {
			const result = await executeStoryTool("unknown_tool", {});

			expect(result.isError).toBe(true);
			expect(result.content[0].text).toContain("Unknown tool");
		});

		it("should catch and return errors during execution", async () => {
			// Pass invalid data to cause an error
			const result = await executeStoryTool("export_mermaid", {
				graph: null,
			});

			expect(result.isError).toBe(true);
			expect(result.content[0].text).toContain("export_mermaid error:");
		});
	});

	describe("Edge Cases and Regression Tests", () => {
		it("should handle empty story text gracefully", () => {
			const graph = buildInitialGraph("");
			const result = validateGraph(graph);

			expect(result.isValid).toBe(false);
			expect(result.issues.length).toBeGreaterThan(0);
		});

		it("should handle story with only title", () => {
			const graph = buildInitialGraph("Title: Minimal Story");
			expect(graph.meta.title).toBe("Minimal Story");
			expect(graph.events.length).toBe(0);
			expect(graph.characters.length).toBe(0);
		});

		it("should handle very long story with many events", () => {
			let longStory = "Title: Epic\nCharacter: Hero, role: protagonist\n";
			for (let i = 0; i < 50; i++) {
				longStory += `Event: Event ${i}\n`;
			}
			const graph = buildInitialGraph(longStory);
			expect(graph.events.length).toBe(50);

			const result = validateGraph(graph);
			expect(result.analysis.pacing).toBe("fast");
		});

		it("should handle conflict intensity edge values", () => {
			const graph = buildInitialGraph(storyText);
			if (graph.conflicts.length > 0) {
				// Due to `|| 5` fallback, 0 intensity will default to 5
				graph.conflicts[0].escalations[0].intensity = 0;
				const canvas1 = toCanvasJSON(graph);
				const conflictNode1 = canvas1.nodes.find(
					(n: CanvasNode) => n.type === "conflict",
				);
				expect(conflictNode1?.data.intensity).toBe(5); // Falls back to default

				// Test with actual value
				graph.conflicts[0].escalations[0].intensity = 10;
				const canvas2 = toCanvasJSON(graph);
				const conflictNode2 = canvas2.nodes.find(
					(n: CanvasNode) => n.type === "conflict",
				);
				expect(conflictNode2?.data.intensity).toBe(10);
			}
		});

		it("should handle events without importance classification", () => {
			const graph = buildInitialGraph(storyText);
			graph.events[0].importance = "unknown";
			const canvas = toCanvasJSON(graph);

			const eventNode = canvas.nodes.find(
				(n: CanvasNode) => n.id === graph.events[0].id,
			);
			expect(eventNode?.style?.backgroundColor).toBe("#ffffff");
		});

		it("should validate balance calculation edge case", () => {
			const graph = buildInitialGraph(storyText);
			for (let i = 0; i < graph.events.length; i++) {
				graph.events[i].act = (i % 3) + 1; // Distribute evenly
			}

			const result = validateGraph(graph);
			// Balance should be close to 1 for even distribution
			expect(result.analysis.actBalance.balance).toBeGreaterThan(0.7);
		});

		it("should handle relationship strength at boundaries", () => {
			const graph = buildInitialGraph(storyText);
			if (graph.relationships.length > 0) {
				graph.relationships[0].strength = 1;
				const canvas1 = toCanvasJSON(graph);
				const edge1 = canvas1.edges.find((e: CanvasEdge) => e.id === "rel_0");
				expect(edge1?.animated).toBe(false);

				graph.relationships[0].strength = 8;
				const canvas2 = toCanvasJSON(graph);
				const edge2 = canvas2.edges.find((e: CanvasEdge) => e.id === "rel_0");
				expect(edge2?.animated).toBe(true);
			}
		});

		it("should handle special characters in titles and labels", () => {
			const specialStory = `
Title: Story with <special> & "quoted" characters
Character: O'Brien, role: protagonist
Event: Event with "quotes" and <tags>
`;
			const graph = buildInitialGraph(specialStory);
			const html = toDashboard(graph);

			// Should be properly escaped
			expect(html).not.toContain("<special>");
			expect(html).toContain("&lt;special&gt;");
		});

		it("should handle missing act in events", () => {
			const graph = buildInitialGraph(storyText);
			const canvas = toCanvasJSON(graph);

			// All event nodes should have valid positions
			const eventNodes = canvas.nodes.filter(
				(n: CanvasNode) => n.type === "event",
			);
			for (const node of eventNodes) {
				expect(node.position.x).toBeGreaterThanOrEqual(0);
				expect(node.position.y).toBeGreaterThanOrEqual(0);
			}
		});
	});
});
