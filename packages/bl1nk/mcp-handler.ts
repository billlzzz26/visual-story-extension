/**
 * MCP Handler wrapper for initializing the server with per-request configuration.
 *
 * This module provides the bridge between the mcp-handler library and our
 * existing index.ts implementation, allowing dynamic configuration per request.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
				// Inject exaApiKey into args if provided (for exa_search_story tool)
				if (tool.name === "exa_search_story" && config.exaApiKey) {
					// Note: exa-search.ts reads from process.env.EXA_API_KEY
					// We need to set it dynamically here
					const originalKey = process.env.EXA_API_KEY;
					try {
						process.env.EXA_API_KEY = config.exaApiKey;
						return executeStoryTool(tool.name, args);
					} finally {
						if (originalKey) {
							process.env.EXA_API_KEY = originalKey;
						} else {
							process.env.EXA_API_KEY = undefined;
						}
					}
				}

				return executeStoryTool(tool.name, args);
			},
		);
	}

	if (debug) {
		console.log("[EXA-MCP] Server initialization complete");
	}
}
