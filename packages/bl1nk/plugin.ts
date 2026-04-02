/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Hooks, Plugin, PluginInput } from "@kilocode/plugin";
import { tool } from "@kilocode/plugin/tool";
import { z } from "zod";
import { buildInitialGraph } from "./analyzer.js";
import { formatSearchResults, searchStoryReferences } from "./exa-search.js";
import { toCanvasJSON } from "./exporters/canvas.js";
import { toMarkdown } from "./exporters/markdown.js";
import { toMermaid } from "./exporters/mermaid.js";
import type { StoryGraph } from "./types.js";
import { formatToolError } from "./utils/error-handler.js";
import { validateGraph } from "./validators.js";

// --- Helpers ---

function formatGraphForTool(graph: StoryGraph): string {
	return JSON.stringify(graph, null, 2);
}

// --- Tool Args Schemas ---

const AnalyzeStoryArgs = z.object({
	text: z.string().describe("Story text to analyze"),
	includeMetadata: z.boolean().default(true),
});

const ExportMermaidArgs = z.object({
	text: z.string().describe("Story text to analyze and export as Mermaid"),
	style: z.enum(["default", "dark", "minimal"]).default("default"),
	includeMetadata: z.boolean().default(true),
});

const ExportMarkdownArgs = z.object({
	text: z.string().describe("Story text to analyze and export as Markdown"),
	includeMetadata: z.boolean().default(true),
	includeAnalysis: z.boolean().default(true),
});

const ExportCanvasArgs = z.object({
	text: z.string().describe("Story text to analyze and export as Canvas JSON"),
	includeMetadata: z.boolean().default(true),
});

const ValidateStoryArgs = z.object({
	text: z.string().describe("Story text to analyze and validate"),
	strict: z.boolean().default(false),
});

const ExtractCharactersArgs = z.object({
	text: z.string().describe("Story text to extract characters from"),
	detailed: z.boolean().default(true),
});

const ExtractConflictsArgs = z.object({
	text: z.string().describe("Story text to extract conflicts from"),
	includeEscalation: z.boolean().default(true),
});

const ExaSearchArgs = z.object({
	query: z.string().describe("Search query for story writing references"),
	category: z
		.enum([
			"writing_techniques",
			"character_archetypes",
			"story_tropes",
			"narrative_structure",
			"genre_conventions",
			"conflict_types",
			"general",
		])
		.default("general")
		.describe("Category for better results"),
	numResults: z
		.number()
		.int()
		.min(1)
		.max(10)
		.default(5)
		.describe("Number of results (1-10)"),
});

// --- Plugin ---

const bl1nkPlugin: Plugin = async ({ client }: PluginInput): Promise<Hooks> => {
	// Structured logging via client.app.log()
	await client.app.log({
		body: {
			service: "bl1nk-visual-mcp",
			level: "info",
			message: "bl1nk-visual-mcp plugin loaded",
			extra: { tools: 8 },
		},
	});

	return {
		tool: {
			analyze_story: tool({
				description:
					"Analyze story text and generate a StoryGraph with characters, events, conflicts, and relationships. " +
					'Recognizes patterns like "Title:", "Character: Name, role: protagonist", "Event: ...", "Conflict: ...".',
				args: AnalyzeStoryArgs.shape as any,
				async execute(args: any, ctx: any) {
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "analyze_story called",
							extra: {
								sessionID: ctx.sessionID,
								textLen: (args as any).text.length,
							},
						},
					});

					const graph = buildInitialGraph((args as any).text);
					if ((args as any).includeMetadata) {
						graph.meta.createdAt = new Date().toISOString();
						graph.meta.updatedAt = new Date().toISOString();
					}
					const validation = validateGraph(graph);

					return JSON.stringify({ graph, analysis: validation }, null, 2);
				},
			}),

			export_mermaid: tool({
				description:
					"Analyze story text and export as a Mermaid diagram. " +
					"Creates a flowchart grouped by Acts with different shapes for climax, midpoint, and inciting events.",
				args: ExportMermaidArgs.shape as any,
				async execute(args: any, ctx: any) {
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "export_mermaid called",
							extra: { sessionID: ctx.sessionID, style: (args as any).style },
						},
					});

					const graph = buildInitialGraph((args as any).text);
					return toMermaid(graph, {
						style: (args as any).style,
						includeMetadata: (args as any).includeMetadata,
					});
				},
			}),

			export_markdown: tool({
				description:
					"Analyze story text and export as structured Markdown documentation. " +
					"Includes story metadata, analysis statistics, character roster, events, and conflicts.",
				args: ExportMarkdownArgs.shape as any,
				async execute(args: any, ctx: any) {
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "export_markdown called",
							extra: { sessionID: ctx.sessionID },
						},
					});

					const graph = buildInitialGraph((args as any).text);
					return toMarkdown(graph, {
						includeMetadata: (args as any).includeMetadata,
						includeAnalysis: (args as any).includeAnalysis,
					});
				},
			}),

			export_canvas: tool({
				description:
					"Analyze story text and export as Canvas JSON (Obsidian-compatible). " +
					"Creates nodes for events, characters, and conflicts with edges for sequence and relationships.",
				args: ExportCanvasArgs.shape as any,
				async execute(args: any, ctx: any) {
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "export_canvas called",
							extra: { sessionID: ctx.sessionID },
						},
					});

					const graph = buildInitialGraph((args as any).text);
					const canvas = toCanvasJSON(graph, {
						includeMetadata: (args as any).includeMetadata,
					});
					return JSON.stringify(canvas, null, 2);
				},
			}),

			validate_story_structure: tool({
				description:
					"Validate story text against 3-act structure rules. " +
					"Checks for missing title, protagonist, acts, climax, midpoint, and act distribution (25-50-25 rule).",
				args: ValidateStoryArgs.shape as any,
				async execute(args: any, ctx: any) {
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "validate_story_structure called",
							extra: { sessionID: ctx.sessionID, strict: (args as any).strict },
						},
					});

					const graph = buildInitialGraph((args as any).text);
					const result = validateGraph(graph, (args as any).strict);
					return JSON.stringify(result, null, 2);
				},
			}),

			extract_characters: tool({
				description:
					"Extract characters from story text. Identifies names, roles (protagonist/antagonist/mentor/supporting), and appearances across acts.",
				args: ExtractCharactersArgs.shape as any,
				async execute(args: any, ctx: any) {
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "extract_characters called",
							extra: { sessionID: ctx.sessionID },
						},
					});

					const graph = buildInitialGraph((args as any).text);
					const chars = graph.characters;
					return JSON.stringify(
						{ count: chars.length, characters: chars },
						null,
						2,
					);
				},
			}),

			extract_conflicts: tool({
				description:
					"Extract conflicts from story text. Identifies internal vs external conflicts and escalation stages.",
				args: ExtractConflictsArgs.shape as any,
				async execute(args: any, ctx: any) {
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "extract_conflicts called",
							extra: { sessionID: ctx.sessionID },
						},
					});

					const graph = buildInitialGraph((args as any).text);
					const conflicts = graph.conflicts;
					return JSON.stringify(
						{ count: conflicts.length, conflicts },
						null,
						2,
					);
				},
			}),

			exa_search_story: tool({
				description:
					"Search the web for story writing references using Exa AI. " +
					"Returns writing techniques, character archetypes, tropes, narrative structures, and genre conventions.",
				args: ExaSearchArgs.shape as any,
				async execute(args: any, ctx: any) {
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "exa_search_story called",
							extra: {
								sessionID: ctx.sessionID,
								query: (args as any).query,
								category: (args as any).category,
							},
						},
					});

					try {
						const response = await searchStoryReferences(
							(args as any).query,
							(args as any).category,
							(args as any).numResults,
						);
						return formatSearchResults(response, (args as any).query);
					} catch (error: unknown) {
						// Note: formatToolError returns MCP tool response format
						const errorResult = formatToolError(
							error,
							"exa_search_story",
							true,
						);
						return errorResult.content[0].text;
					}
				},
			}),
		},
	};
};

export default bl1nkPlugin;
