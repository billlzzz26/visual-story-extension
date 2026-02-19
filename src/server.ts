import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { buildInitialGraph } from './analyzer.js';
import { toMermaid } from './exporters/mermaid.js';
import { toCanvasJSON } from './exporters/canvas.js';
import { toDashboard } from './exporters/dashboard.js';
import { toMarkdown } from './exporters/markdown.js';
import { validateGraph } from './validators.js';

const server = new McpServer({
  name: 'visual-story-planner',
  version: '3.0.0',
});

// Tool 1: analyze_story
server.tool(
  'analyze_story',
  'Analyze story text and generate StoryGraph JSON',
  {
    text: z.string().describe('Story text to analyze'),
    depth: z.enum(['basic', 'detailed', 'deep']).default('detailed'),
    includeMetadata: z.boolean().default(true),
  },
  async (input: { text: string; depth?: string; includeMetadata?: boolean }) => {
    const graph = buildInitialGraph(input.text);
    if (input.includeMetadata) {
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
);

// Tool 2: export_mermaid
server.tool(
  'export_mermaid',
  'Convert StoryGraph to Mermaid diagram',
  {
    graph: z.any().describe('StoryGraph object'),
    includeMetadata: z.boolean().default(true),
    style: z.enum(['default', 'dark', 'minimal']).default('default'),
  },
  async (input: { graph: any; includeMetadata?: boolean; style?: string }) => {
    const mermaid = toMermaid(input.graph, { includeMetadata: input.includeMetadata, style: input.style as any });
    return { content: [{ type: 'text', text: mermaid }] };
  }
);

// Tool 3: export_canvas
server.tool(
  'export_canvas',
  'Convert StoryGraph to Canvas JSON',
  {
    graph: z.any().describe('StoryGraph object'),
    includeMetadata: z.boolean().default(true),
    autoLayout: z.boolean().default(true),
  },
  async (input: { graph: any; includeMetadata?: boolean; autoLayout?: boolean }) => {
    const canvas = toCanvasJSON(input.graph, { includeMetadata: input.includeMetadata, autoLayout: input.autoLayout });
    return { content: [{ type: 'text', text: JSON.stringify(canvas, null, 2) }] };
  }
);

// Tool 4: export_dashboard
server.tool(
  'export_dashboard',
  'Generate HTML dashboard',
  {
    graph: z.any().describe('StoryGraph object'),
    includeStats: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
  },
  async (input: { graph: any; includeStats?: boolean; includeRecommendations?: boolean }) => {
    const html = toDashboard(input.graph, { includeStats: input.includeStats, includeRecommendations: input.includeRecommendations });
    return { content: [{ type: 'text', text: html }] };
  }
);

// Tool 5: export_markdown
server.tool(
  'export_markdown',
  'Convert StoryGraph to Markdown',
  {
    graph: z.any().describe('StoryGraph object'),
    includeMetadata: z.boolean().default(true),
    includeAnalysis: z.boolean().default(true),
  },
  async (input: { graph: any; includeMetadata?: boolean; includeAnalysis?: boolean }) => {
    const md = toMarkdown(input.graph, { includeMetadata: input.includeMetadata, includeAnalysis: input.includeAnalysis });
    return { content: [{ type: 'text', text: md }] };
  }
);

// Tool 6: validate_story_structure
server.tool(
  'validate_story_structure',
  'Validate story structure',
  {
    graph: z.any().describe('StoryGraph object'),
    strict: z.boolean().default(false),
    includeRecommendations: z.boolean().default(true),
  },
  async (input: { graph: any; strict?: boolean; includeRecommendations?: boolean }) => {
    const result = validateGraph(input.graph, input.strict);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// Tool 7: extract_characters
server.tool(
  'extract_characters',
  'Extract characters from StoryGraph',
  {
    graph: z.any().describe('StoryGraph object'),
    detailed: z.boolean().default(true),
  },
  async (input: { graph: any; detailed?: boolean }) => {
    const chars = input.graph.characters || [];
    return { content: [{ type: 'text', text: JSON.stringify({ count: chars.length, characters: chars }, null, 2) }] };
  }
);

// Tool 8: extract_conflicts
server.tool(
  'extract_conflicts',
  'Extract conflicts from StoryGraph',
  {
    graph: z.any().describe('StoryGraph object'),
    includeEscalation: z.boolean().default(true),
  },
  async (input: { graph: any; includeEscalation?: boolean }) => {
    const conflicts = input.graph.conflicts || [];
    return { content: [{ type: 'text', text: JSON.stringify({ count: conflicts.length, conflicts }, null, 2) }] };
  }
);

// Tool 9: build_relationship_graph
server.tool(
  'build_relationship_graph',
  'Build relationship graph',
  {
    graph: z.any().describe('StoryGraph object'),
    includeStats: z.boolean().default(true),
  },
  async (input: { graph: any; includeStats?: boolean }) => {
    const rels = input.graph.relationships || [];
    return { content: [{ type: 'text', text: JSON.stringify({ count: rels.length, relationships: rels }, null, 2) }] };
  }
);

async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Visual Story Planner MCP Server started');
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default server;
