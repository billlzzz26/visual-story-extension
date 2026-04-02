/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Visual Story Planner MCP Server
 *
 * Main entry point for running the MCP server via stdio.
 * For Vercel deployment, use api/mcp.ts instead.
 * For KiloCode plugin, use src/plugin.ts instead.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { buildInitialGraph } from './analyzer.js';
import { toMermaid } from './exporters/mermaid.js';
import { toCanvasJSON } from './exporters/canvas.js';
import { toDashboard } from './exporters/dashboard.js';
import { toMarkdown } from './exporters/markdown.js';
import { toMcpUiDashboard } from './exporters/mcp-ui-dashboard.js';
import { validateGraph } from './validators.js';
import { searchStoryReferences, formatSearchResults } from './exa-search.js';
import { formatToolError } from './utils/error-handler.js';
import { BL1NK_VISUAL_TOOLS, executeStoryTool } from './tools/index.js';
import { searchEntriesTool } from './tools/search-entries.js';

// Re-export types and utilities for external use
export type { StoryGraph, Character, Conflict, EventNode, Relationship } from './types.js';
export { buildInitialGraph } from './analyzer.js';
export { validateGraph } from './validators.js';
export { toMermaid } from './exporters/mermaid.js';
export { toCanvasJSON } from './exporters/canvas.js';
export { toDashboard } from './exporters/dashboard.js';
export { toMarkdown } from './exporters/markdown.js';
export { toMcpUiDashboard } from './exporters/mcp-ui-dashboard.js';
export { searchStoryReferences, formatSearchResults } from './exa-search.js';
export { formatToolError, ExaError, retryWithBackoff, handleRateLimitError } from './utils/error-handler.js';
export { BL1NK_VISUAL_TOOLS, executeStoryTool } from './tools/index.js';
export { searchEntriesTool } from './tools/search-entries.js';

// ============================================================================
// Schema Definitions
// ============================================================================

const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  traits: z.array(z.string()),
  arc: z.object({
    start: z.string(),
    midpoint: z.string(),
    end: z.string(),
    transformation: z.string(),
    emotionalJourney: z.array(z.string())
  }),
  relationships: z.array(z.string()),
  motivations: z.array(z.string()),
  fears: z.array(z.string()),
  secretsOrLies: z.array(z.string()),
  actAppearances: z.array(z.number())
});

const ConflictSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  relatedCharacters: z.array(z.string()),
  rootCause: z.string(),
  escalations: z.array(z.object({
    stage: z.number(),
    description: z.string(),
    intensity: z.number(),
    affectedCharacters: z.array(z.string())
  })),
  resolution: z.string(),
  actIntroduced: z.number()
});

const EventNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  act: z.number(),
  importance: z.string(),
  sequenceInAct: z.number(),
  location: z.string().optional(),
  characters: z.array(z.string()),
  conflicts: z.array(z.string()),
  emotionalTone: z.string(),
  consequence: z.string()
});

const RelationshipSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.string(),
  strength: z.number(),
  description: z.string().optional()
});

const StoryGraphSchema = z.object({
  meta: z.object({
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    version: z.string(),
    genre: z.string().optional()
  }),
  characters: z.array(CharacterSchema),
  conflicts: z.array(ConflictSchema),
  events: z.array(EventNodeSchema),
  relationships: z.array(RelationshipSchema),
  tags: z.array(z.string())
});

// ============================================================================
// Tool Schemas
// ============================================================================

export const Schemas = {
  analyze_story: z.object({
    text: z.string().describe('Story text to analyze'),
    depth: z.enum(['basic', 'detailed', 'deep']).default('detailed'),
    includeMetadata: z.boolean().default(true),
  }),
  export_mermaid: z.object({
    graph: StoryGraphSchema.describe('StoryGraph object'),
    includeMetadata: z.boolean().default(true),
    style: z.enum(['default', 'dark', 'minimal']).default('default'),
  }),
  export_canvas: z.object({
    graph: StoryGraphSchema.describe('StoryGraph object'),
    includeMetadata: z.boolean().default(true),
    autoLayout: z.boolean().default(true),
  }),
  export_dashboard: z.object({
    graph: StoryGraphSchema.describe('StoryGraph object'),
    includeStats: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
  }),
  export_markdown: z.object({
    graph: StoryGraphSchema.describe('StoryGraph object'),
    includeMetadata: z.boolean().default(true),
    includeAnalysis: z.boolean().default(true),
  }),
  validate_story_structure: z.object({
    graph: StoryGraphSchema.describe('StoryGraph object'),
    strict: z.boolean().default(false),
    includeRecommendations: z.boolean().default(true),
  }),
  extract_characters: z.object({
    graph: StoryGraphSchema.describe('StoryGraph object'),
    detailed: z.boolean().default(true),
  }),
  extract_conflicts: z.object({
    graph: StoryGraphSchema.describe('StoryGraph object'),
    includeEscalation: z.boolean().default(true),
  }),
  build_relationship_graph: z.object({
    graph: StoryGraphSchema.describe('StoryGraph object'),
    includeStats: z.boolean().default(true),
  }),
  export_mcp_ui_dashboard: z.object({
    graph: StoryGraphSchema.describe('StoryGraph object'),
    includeStats: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
  }),
  exa_search_story: z.object({
    query: z.string().describe('Search query for story research'),
    category: z.enum([
      'writing_techniques',
      'character_archetypes',
      'story_tropes',
      'narrative_structure',
      'genre_conventions',
      'conflict_types',
      'general',
    ]).default('general').describe('Category for better results'),
    numResults: z.number().int().min(1).max(10).default(5)
      .describe('Number of results (1-10)'),
  }),
};

// ============================================================================
// MCP Server Setup
// ============================================================================

const server = new McpServer({
  name: 'bl1nk-visual-mcp',
  version: '3.0.0',
});

BL1NK_VISUAL_TOOLS.forEach((tool) => {
  const schema = (Schemas as any)[tool.name];
  server.tool(
    tool.name,
    tool.description,
    schema.shape as any,
    async (args: any) => executeStoryTool(tool.name, args)
  );
});

// Register search_entries tool
server.tool(
  searchEntriesTool.name,
  searchEntriesTool.description,
  searchEntriesTool.inputSchema.shape,
  async (args: any) => searchEntriesTool.execute(args)
);

async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('bl1nk-visual-mcp Server started');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to start bl1nk-visual-mcp: ${message}`);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default server;
