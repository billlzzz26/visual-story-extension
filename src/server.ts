/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { buildInitialGraph } from './analyzer.js';
import { toMermaid } from './exporters/mermaid.js';
import { toCanvasJSON } from './exporters/canvas.js';
import { toDashboard } from './exporters/dashboard.js';
import { toMarkdown } from './exporters/markdown.js';
import { validateGraph } from './validators.js';

// --- 1. Define Deep Schemas ---

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

const Schemas = {
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
  })
};

// --- 2. Tool Definitions ---

export const BL1NK_VISUAL_TOOLS = [
  { name: 'analyze_story', description: 'Analyze story text and generate StoryGraph JSON' },
  { name: 'export_mermaid', description: 'Convert StoryGraph to Mermaid diagram' },
  { name: 'export_canvas', description: 'Convert StoryGraph to Canvas JSON' },
  { name: 'export_dashboard', description: 'Generate HTML dashboard' },
  { name: 'export_markdown', description: 'Convert StoryGraph to Markdown' },
  { name: 'validate_story_structure', description: 'Validate story structure' },
  { name: 'extract_characters', description: 'Extract characters from StoryGraph' },
  { name: 'extract_conflicts', description: 'Extract conflicts from StoryGraph' },
  { name: 'build_relationship_graph', description: 'Build relationship graph' },
];

// --- 3. Execution Logic ---

export async function executeStoryTool(toolName: string, args: any) {
  try {
    switch (toolName) {
      case "analyze_story": {
        const graph = buildInitialGraph(args.text);
        if (args.includeMetadata) {
          graph.meta.createdAt = new Date().toISOString();
          graph.meta.updatedAt = new Date().toISOString();
          graph.meta.version = '1.0.0';
        }
        const validation = validateGraph(graph);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ graph, analysis: validation }, null, 2),
          }],
        };
      }

      case "export_mermaid": {
        const mermaid = toMermaid(args.graph, { includeMetadata: args.includeMetadata, style: args.style });
        return { content: [{ type: 'text', text: mermaid }] };
      }

      case "export_canvas": {
        const canvas = toCanvasJSON(args.graph, { includeMetadata: args.includeMetadata, autoLayout: args.autoLayout });
        return { content: [{ type: 'text', text: JSON.stringify(canvas, null, 2) }] };
      }

      case "export_dashboard": {
        const html = toDashboard(args.graph, { includeStats: args.includeStats, includeRecommendations: args.includeRecommendations });
        return { content: [{ type: 'text', text: html }] };
      }

      case "export_markdown": {
        const md = toMarkdown(args.graph, { includeMetadata: args.includeMetadata, includeAnalysis: args.includeAnalysis });
        return { content: [{ type: 'text', text: md }] };
      }

      case "validate_story_structure": {
        const result = validateGraph(args.graph, args.strict);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case "extract_characters": {
        const chars = args.graph.characters || [];
        return { content: [{ type: 'text', text: JSON.stringify({ count: chars.length, characters: chars }, null, 2) }] };
      }

      case "extract_conflicts": {
        const conflicts = args.graph.conflicts || [];
        return { content: [{ type: 'text', text: JSON.stringify({ count: conflicts.length, conflicts }, null, 2) }] };
      }

      case "build_relationship_graph": {
        const rels = args.graph.relationships || [];
        return { content: [{ type: 'text', text: JSON.stringify({ count: rels.length, relationships: rels }, null, 2) }] };
      }

      default:
        return {
          content: [{ type: 'text', text: `Error: Unknown tool ${toolName}` }],
          isError: true
        };
    }
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error executing ${toolName}: ${error.message}` }],
      isError: true
    };
  }
}

// --- 4. MCP Server Setup ---

const server = new McpServer({
  name: 'bl1nk-visual-mcp',
  version: '3.0.0',
});

BL1NK_VISUAL_TOOLS.forEach((tool) => {
  server.tool(
    tool.name,
    tool.description,
    (Schemas as any)[tool.name],
    async (args) => executeStoryTool(tool.name, args)
  );
});

async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('bl1nk-visual-mcp Server started');
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default server;