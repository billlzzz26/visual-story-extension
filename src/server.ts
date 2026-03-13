/**
 * @license
 * Copyright 2026 Visual Story Planner
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

// --- 1. Define Zod Schemas สำหรับแต่ละ Tool ---

const Schemas = {
  analyze_story: {
    text: z.string().describe('Story text to analyze'),
    depth: z.enum(['basic', 'detailed', 'deep']).default('detailed'),
    includeMetadata: z.boolean().default(true),
  },
  export_mermaid: {
    graph: z.any().describe('StoryGraph object'),
    includeMetadata: z.boolean().default(true),
    style: z.enum(['default', 'dark', 'minimal']).default('default'),
  },
  export_canvas: {
    graph: z.any().describe('StoryGraph object'),
    includeMetadata: z.boolean().default(true),
    autoLayout: z.boolean().default(true),
  },
  export_dashboard: {
    graph: z.any().describe('StoryGraph object'),
    includeStats: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
  },
  export_markdown: {
    graph: z.any().describe('StoryGraph object'),
    includeMetadata: z.boolean().default(true),
    includeAnalysis: z.boolean().default(true),
  },
  validate_story_structure: {
    graph: z.any().describe('StoryGraph object'),
    strict: z.boolean().default(false),
    includeRecommendations: z.boolean().default(true),
  },
  extract_characters: {
    graph: z.any().describe('StoryGraph object'),
    detailed: z.boolean().default(true),
  },
  extract_conflicts: {
    graph: z.any().describe('StoryGraph object'),
    includeEscalation: z.boolean().default(true),
  },
  build_relationship_graph: {
    graph: z.any().describe('StoryGraph object'),
    includeStats: z.boolean().default(true),
  }
};

// --- 2. Tool Definitions Array (ใช้เก็บ Metadata) ---

export const STORY_PLANNER_TOOLS = [
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

// --- 3. Centralized Execution Logic (Switch Case) ---

export async function executeStoryTool(toolName: string, args: any) {
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
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// --- 4. MCP Server Setup & Registration ---

const server = new McpServer({
  name: 'visual-story-planner',
  version: '3.0.0',
});

// วนลูปเพื่อลงทะเบียน Tool โดยดึง Zod Schema จาก Schemas object
STORY_PLANNER_TOOLS.forEach((tool) => {
  server.tool(
    tool.name,
    tool.description,
    Schemas[tool.name as keyof typeof Schemas], // ผูก Zod Schema เข้ากับ Tool
    async (args) => executeStoryTool(tool.name, args) // ส่งงานเข้า Switch Case
  );
});

async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Visual Story Planner MCP Server started');
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default server;
