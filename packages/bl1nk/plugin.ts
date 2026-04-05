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
	text: z.string().describe("Story text to analyze and extract conflicts from"),
	includeEscalation: z.boolean().default(true),
});

type AnalyzeStoryArgsType = z.infer<typeof AnalyzeStoryArgs>;
type ExportMermaidArgsType = z.infer<typeof ExportMermaidArgs>;
type ExportMarkdownArgsType = z.infer<typeof ExportMarkdownArgs>;
type ExportCanvasArgsType = z.infer<typeof ExportCanvasArgs>;
type ValidateStoryArgsType = z.infer<typeof ValidateStoryArgs>;
type ExtractCharactersArgsType = z.infer<typeof ExtractCharactersArgs>;
type ExtractConflictsArgsType = z.infer<typeof ExtractConflictsArgs>;
type ExaSearchArgsType = z.infer<typeof ExaSearchArgs>;

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
				args: AnalyzeStoryArgs.shape as Record<string, unknown>,
				async execute(args: unknown, ctx: { sessionID: string }) {
					const analyzeArgs = args as AnalyzeStoryArgsType;
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "analyze_story called",
							extra: {
								sessionID: ctx.sessionID,
								textLen: analyzeArgs.text.length,
							},
						},
					});

					const graph = buildInitialGraph(analyzeArgs.text);
					if (analyzeArgs.includeMetadata) {
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
				args: ExportMermaidArgs.shape as Record<string, unknown>,
				async execute(args: unknown, ctx: { sessionID: string }) {
					const exportArgs = args as ExportMermaidArgsType;
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "export_mermaid called",
							extra: { sessionID: ctx.sessionID, style: exportArgs.style },
						},
					});

					const graph = buildInitialGraph(exportArgs.text);
					return toMermaid(graph, {
						style: exportArgs.style,
						includeMetadata: exportArgs.includeMetadata,
					});
				},
			}),

			export_markdown: tool({
				description:
					"Analyze story text and export as structured Markdown documentation. " +
					"Includes story metadata, analysis statistics, character roster, events, and conflicts.",
				args: ExportMarkdownArgs.shape as Record<string, unknown>,
				async execute(args: unknown, ctx: { sessionID: string }) {
					const exportArgs = args as ExportMarkdownArgsType;
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "export_markdown called",
							extra: { sessionID: ctx.sessionID },
						},
					});

					const graph = buildInitialGraph(exportArgs.text);
					return toMarkdown(graph, {
						includeMetadata: exportArgs.includeMetadata,
						includeAnalysis: exportArgs.includeAnalysis,
					});
				},
			}),

			export_canvas: tool({
				description:
					"Analyze story text and export as Canvas JSON (Obsidian-compatible). " +
					"Creates nodes for events, characters, and conflicts with edges for sequence and relationships.",
				args: ExportCanvasArgs.shape as Record<string, unknown>,
				async execute(args: unknown, ctx: { sessionID: string }) {
					const exportArgs = args as ExportCanvasArgsType;
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "export_canvas called",
							extra: { sessionID: ctx.sessionID },
						},
					});

					const graph = buildInitialGraph(exportArgs.text);
					const canvas = toCanvasJSON(graph, {
						includeMetadata: exportArgs.includeMetadata,
					});
					return JSON.stringify(canvas, null, 2);
				},
			}),

			validate_story_structure: tool({
				description:
					"Validate story text against 3-act structure rules. " +
					"Checks for missing title, protagonist, acts, climax, midpoint, and act distribution (25-50-25 rule).",
				args: ValidateStoryArgs.shape as Record<string, unknown>,
				async execute(args: unknown, ctx: { sessionID: string }) {
					const validateArgs = args as ValidateStoryArgsType;
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "validate_story_structure called",
							extra: {
								sessionID: ctx.sessionID,
								strict: validateArgs.strict,
							},
						},
					});

					const graph = buildInitialGraph(validateArgs.text);
					const result = validateGraph(graph, validateArgs.strict);
					return JSON.stringify(result, null, 2);
				},
			}),

			extract_characters: tool({
				description:
					"Extract characters from story text. Identifies names, roles (protagonist/antagonist/mentor/supporting), and appearances across acts.",
				args: ExtractCharactersArgs.shape as Record<string, unknown>,
				async execute(args: unknown, ctx: { sessionID: string }) {
					const extractArgs = args as ExtractCharactersArgsType;
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "extract_characters called",
							extra: { sessionID: ctx.sessionID },
						},
					});

					const graph = buildInitialGraph(extractArgs.text);
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
				args: ExtractConflictsArgs.shape as Record<string, unknown>,
				async execute(args: unknown, ctx: { sessionID: string }) {
					const extractArgs = args as ExtractConflictsArgsType;
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "extract_conflicts called",
							extra: { sessionID: ctx.sessionID },
						},
					});

					const graph = buildInitialGraph(extractArgs.text);
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
				args: ExaSearchArgs.shape as Record<string, unknown>,
				async execute(args: unknown, ctx: { sessionID: string }) {
					const exaArgs = args as ExaSearchArgsType;
					await client.app.log({
						body: {
							service: "bl1nk-visual-mcp",
							level: "debug",
							message: "exa_search_story called",
							extra: {
								sessionID: ctx.sessionID,
								query: exaArgs.query,
								category: exaArgs.category,
							},
						},
					});

					try {
						const response = await searchStoryReferences(
							exaArgs.query,
							exaArgs.category,
							exaArgs.numResults,
						);
						return formatSearchResults(response, exaArgs.query);
					} catch (error: unknown) {
						return formatToolError("exa_search_story", error);
					}
				},
			}),
		},
	};
};

export default bl1nkPlugin;
