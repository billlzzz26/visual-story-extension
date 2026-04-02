/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tool execution dispatcher - granular tools (11) + legacy tools (4).
 */

import { buildInitialGraph } from "../analyzer.js";
import { formatSearchResults, searchStoryReferences } from "../exa-search.js";
import { toCanvasJSON } from "../exporters/canvas.js";
import { toDashboard } from "../exporters/dashboard.js";
import { toMarkdown } from "../exporters/markdown.js";
import { toMcpUiDashboard } from "../exporters/mcp-ui-dashboard.js";
import { toMermaid } from "../exporters/mermaid.js";
import { formatToolError } from "../utils/error-handler.js";
import { validateGraph } from "../validators.js";
import { generateArtifactsTool } from "./generate-artifacts.js";
import { searchEntriesTool } from "./search-entries.js";

function formatErrorResult(toolName: string, error: unknown) {
	return formatToolError(error, toolName);
}

// ============================================================================
// Granular Tool Executor (11 tools)
// ============================================================================

export async function executeGranularTool(
	toolName: string,
	args: Record<string, unknown>,
) {
	if (!args || typeof args !== "object") {
		return {
			content: [
				{ type: "text" as const, text: "Error: Invalid arguments provided" },
			],
			isError: true,
		};
	}

	try {
		switch (toolName) {
			case "analyze_story": {
				const text = args.text as string;
				if (!text || typeof text !== "string") {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: text parameter is required",
							},
						],
						isError: true,
					};
				}
				const graph = buildInitialGraph(text);
				return {
					content: [
						{ type: "text" as const, text: JSON.stringify(graph, null, 2) },
					],
				};
			}

			case "export_mermaid": {
				const graph = args.graph;
				if (graph == null) {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: graph parameter is required",
							},
						],
						isError: true,
					};
				}
				const style = (args.style as string) || "default";
				const includeMetadata = args.includeMetadata !== false;
				const mermaid = toMermaid(graph as Parameters<typeof toMermaid>[0], {
					style: style as "default" | "dark" | "minimal",
					includeMetadata,
				});
				return {
					content: [{ type: "text" as const, text: mermaid }],
				};
			}

			case "export_canvas": {
				const graph = args.graph;
				if (graph == null) {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: graph parameter is required",
							},
						],
						isError: true,
					};
				}
				const includeMetadata = args.includeMetadata !== false;
				const autoLayout = args.autoLayout !== false;
				const canvas = toCanvasJSON(
					graph as Parameters<typeof toCanvasJSON>[0],
					{
						includeMetadata,
						autoLayout,
					},
				);
				return {
					content: [
						{ type: "text" as const, text: JSON.stringify(canvas, null, 2) },
					],
				};
			}

			case "export_dashboard": {
				const graph = args.graph;
				if (graph == null) {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: graph parameter is required",
							},
						],
						isError: true,
					};
				}
				const includeStats = args.includeStats !== false;
				const includeRecommendations = args.includeRecommendations !== false;
				const html = toDashboard(graph as Parameters<typeof toDashboard>[0], {
					includeStats,
					includeRecommendations,
				});
				return {
					content: [{ type: "text" as const, text: html }],
				};
			}

			case "export_markdown": {
				const graph = args.graph;
				if (graph == null) {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: graph parameter is required",
							},
						],
						isError: true,
					};
				}
				const includeMetadata = args.includeMetadata !== false;
				const includeAnalysis = args.includeAnalysis !== false;
				const md = toMarkdown(graph as Parameters<typeof toMarkdown>[0], {
					includeMetadata,
					includeAnalysis,
				});
				return {
					content: [{ type: "text" as const, text: md }],
				};
			}

			case "validate_story_structure": {
				const graph = args.graph;
				if (graph == null) {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: graph parameter is required",
							},
						],
						isError: true,
					};
				}
				const strict = args.strict === true;
				const includeRecommendations = args.includeRecommendations !== false;
				const result = validateGraph(
					graph as Parameters<typeof validateGraph>[0],
					strict,
				);
				const { recommendations, ...rest } = result;
				return {
					content: [
						{
							type: "text" as const,
							text: JSON.stringify(
								includeRecommendations ? result : rest,
								null,
								2,
							),
						},
					],
				};
			}

			case "extract_characters": {
				const graph = args.graph;
				if (graph == null) {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: graph parameter is required",
							},
						],
						isError: true,
					};
				}
				const detailed = args.detailed !== false;
				const characters = (graph as Record<string, unknown>).characters;
				const output = detailed
					? characters
					: (characters as Array<Record<string, unknown>>)?.map((c) => ({
							id: c.id,
							name: c.name,
							role: c.role,
						}));
				return {
					content: [
						{ type: "text" as const, text: JSON.stringify(output, null, 2) },
					],
				};
			}

			case "extract_conflicts": {
				const graph = args.graph;
				if (graph == null) {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: graph parameter is required",
							},
						],
						isError: true,
					};
				}
				const includeEscalation = args.includeEscalation !== false;
				const conflicts = (graph as Record<string, unknown>).conflicts;
				const output = includeEscalation
					? conflicts
					: (conflicts as Array<Record<string, unknown>>)?.map((c) => ({
							id: c.id,
							type: c.type,
							description: c.description,
							relatedCharacters: c.relatedCharacters,
						}));
				return {
					content: [
						{ type: "text" as const, text: JSON.stringify(output, null, 2) },
					],
				};
			}

			case "build_relationship_graph": {
				const graph = args.graph;
				if (graph == null) {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: graph parameter is required",
							},
						],
						isError: true,
					};
				}
				const includeStats = args.includeStats !== false;
				const relationships = (graph as Record<string, unknown>).relationships;
				const characters = (graph as Record<string, unknown>).characters as
					| Array<Record<string, unknown>>
					| undefined;
				const output = {
					relationships,
					...(includeStats && {
						stats: {
							totalRelationships:
								(relationships as Array<unknown>)?.length || 0,
							totalCharacters: characters?.length || 0,
						},
					}),
				};
				return {
					content: [
						{ type: "text" as const, text: JSON.stringify(output, null, 2) },
					],
				};
			}

			case "export_mcp_ui_dashboard": {
				const graph = args.graph;
				if (graph == null) {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: graph parameter is required",
							},
						],
						isError: true,
					};
				}
				const includeStats = args.includeStats !== false;
				const includeRecommendations = args.includeRecommendations !== false;
				const html = toMcpUiDashboard(
					graph as Parameters<typeof toMcpUiDashboard>[0],
					{
						includeStats,
						includeRecommendations,
					},
				);
				return {
					content: [{ type: "text" as const, text: html }],
				};
			}

			case "exa_search_story": {
				const query = args.query as string;
				if (!query || typeof query !== "string") {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: query parameter is required",
							},
						],
						isError: true,
					};
				}
				const category = (args.category as string) || "general";
				const numResults = (args.numResults as number) || 5;
				const results = await searchStoryReferences(
					query,
					category as Parameters<typeof searchStoryReferences>[1],
					numResults,
				);
				return {
					content: [
						{
							type: "text" as const,
							text: formatSearchResults(results, query),
						},
					],
				};
			}

			default:
				return {
					content: [
						{ type: "text" as const, text: `Error: Unknown tool ${toolName}` },
					],
					isError: true,
				};
		}
	} catch (error: unknown) {
		return formatErrorResult(toolName, error);
	}
}

// ============================================================================
// Legacy Tool Executor (4 tools - backward compatibility)
// ============================================================================

export async function executeStoryTool(
	toolName: string,
	args: Record<string, unknown>,
) {
	if (!args || typeof args !== "object") {
		return {
			content: [
				{ type: "text" as const, text: "Error: Invalid arguments provided" },
			],
			isError: true,
		};
	}

	try {
		switch (toolName) {
			case "search_entries": {
				return await searchEntriesTool.execute(
					args as Parameters<typeof searchEntriesTool.execute>[0],
				);
			}

			case "validate_story": {
				const text = args.text as string;
				if (!text || typeof text !== "string") {
					return {
						content: [
							{
								type: "text" as const,
								text: "Error: text parameter is required",
							},
						],
						isError: true,
					};
				}
				const graph = buildInitialGraph(text);
				const result = validateGraph(graph, args.strict === true);
				return {
					content: [
						{ type: "text" as const, text: JSON.stringify(result, null, 2) },
					],
				};
			}

			case "generate_artifacts": {
				return await generateArtifactsTool.execute(
					args as Parameters<typeof generateArtifactsTool.execute>[0],
				);
			}

			case "sync_github": {
				return {
					content: [
						{
							type: "text" as const,
							text: "GitHub sync not yet implemented. Use github-sync package instead.",
						},
					],
				};
			}

			default:
				return {
					content: [
						{ type: "text" as const, text: `Error: Unknown tool ${toolName}` },
					],
					isError: true,
				};
		}
	} catch (error: unknown) {
		return formatErrorResult(toolName, error);
	}
}

export { formatErrorResult };
