/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tool exports - 11 granular tools (source of truth) + 4 legacy tools (backward compat).
 *
 * GRANULAR TOOLS (Schemas):
 *   analyze_story, export_mermaid, export_canvas, export_dashboard,
 *   export_markdown, validate_story_structure, extract_characters,
 *   extract_conflicts, build_relationship_graph, export_mcp_ui_dashboard,
 *   exa_search_story
 *
 * LEGACY TOOLS (BL1NK_VISUAL_TOOLS - deprecated, kept for compat):
 *   search_entries, validate_story, generate_artifacts, sync_github
 */

// ============================================================================
// Granular Tool Definitions (11 tools - source of truth)
// ============================================================================

export const GRANULAR_TOOLS = [
	{
		name: "analyze_story",
		description: "Parse story text into StoryGraph JSON",
	},
	{
		name: "export_mermaid",
		description: "Export StoryGraph as Mermaid diagram markdown",
	},
	{
		name: "export_canvas",
		description: "Export StoryGraph as Canvas JSON (Obsidian/React Flow)",
	},
	{
		name: "export_dashboard",
		description: "Export StoryGraph as HTML dashboard (Chart.js + Tailwind)",
	},
	{
		name: "export_markdown",
		description: "Export StoryGraph as structured Markdown document",
	},
	{
		name: "validate_story_structure",
		description: "Validate StoryGraph against 3-act structure rules",
	},
	{
		name: "extract_characters",
		description: "Extract character data from StoryGraph",
	},
	{
		name: "extract_conflicts",
		description: "Extract conflict data from StoryGraph",
	},
	{
		name: "build_relationship_graph",
		description: "Build relationship graph from StoryGraph",
	},
	{
		name: "export_mcp_ui_dashboard",
		description: "Export StoryGraph as MCP-UI compatible HTML dashboard",
	},
	{
		name: "exa_search_story",
		description: "Search external references for story research",
	},
];

// ============================================================================
// Legacy Tool Definitions (4 tools - backward compatibility, deprecated)
// ============================================================================

/** @deprecated Use GRANULAR_TOOLS instead. Kept for backward compatibility. */
export const BL1NK_VISUAL_TOOLS = [
	{
		name: "search_entries",
		description:
			"Extract entities (characters, scenes, locations) from story text",
	},
	{
		name: "validate_story",
		description: "Validate story structure (3-act, climax, midpoint)",
	},
	{
		name: "generate_artifacts",
		description:
			"Generate ALL artifacts automatically (mermaid, canvas, markdown, html, csv)",
	},
	{
		name: "sync_github",
		description: "Push generated files to GitHub repository",
	},
];

// Tool executor
export {
	executeStoryTool,
	executeGranularTool,
	formatErrorResult,
} from "./execute.js";

// Individual tool exports (legacy)
export { searchEntriesTool } from "./search-entries.js";
export { generateArtifactsTool } from "./generate-artifacts.js";
