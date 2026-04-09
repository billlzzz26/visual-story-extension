/**
 * MCP Handler wrapper for initializing the server with per-request configuration.
 *
 * This module provides the bridge between the mcp-handler library and our
 * existing index.ts implementation, allowing dynamic configuration per request.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StorySearchCategory } from "./exa-search.js";
import { searchStoryReferences } from "./exa-search.js";
import { BL1NK_VISUAL_TOOLS, Schemas, executeStoryTool } from "./index.js";

export interface McpHandlerConfig {
	exaApiKey?: string;
	enabledTools?: string[];
	debug?: boolean;
	userProvidedApiKey?: boolean;
}

/**
 * Initialize the MCP server with the given configuration.
 * This function is called by the mcp-handler library for each request.
 */
export function initializeMcpServer(
	server: McpServer,
	config: McpHandlerConfig,
): void {
	const { enabledTools, debug } = config;

	// Filter tools if enabledTools is specified
	const toolsToRegister = enabledTools
		? BL1NK_VISUAL_TOOLS.filter((tool) => enabledTools.includes(tool.name))
		: BL1NK_VISUAL_TOOLS;

	if (debug) {
		console.log(
			`[EXA-MCP] Registering ${toolsToRegister.length} tools: ${toolsToRegister.map((t) => t.name).join(", ")}`,
		);
	}

	// Register each tool with the server
	for (const tool of toolsToRegister) {
		const schema = (Schemas as Record<string, { shape: unknown }>)[tool.name];
		if (!schema) {
			console.error(`[EXA-MCP] Missing schema for tool: ${tool.name}`);
			continue;
		}

		server.tool(
			tool.name,
			tool.description,
			schema.shape as Record<string, unknown>,
			async (args: Record<string, unknown>) => {
				// Pass exaApiKey directly to searchStoryReferences to avoid
				// race conditions from mutating process.env
				if (tool.name === "exa_search_story" && config.exaApiKey) {
					const { query, category, numResults } = args as {
						query?: string;
						category?: StorySearchCategory;
						numResults?: number;
					};
					const result = await searchStoryReferences(
						query ?? "",
						category,
						numResults,
						config.exaApiKey,
					);
					return {
						content: [{ type: "text" as const, text: JSON.stringify(result) }],
					};
				}

				return executeStoryTool(tool.name, args);
			},
		);
	}

	if (debug) {
		console.log("[EXA-MCP] Server initialization complete");
	}
}
