/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tool: generate_artifacts
 * 
 * Generate ALL artifacts from StoryGraph automatically.
 * No format selection needed - generates everything.
 */

import { z } from 'zod';
import { toMermaid } from '../exporters/mermaid.js';
import { toCanvasJSON } from '../exporters/canvas.js';
import { toMarkdown } from '../exporters/markdown.js';
import { toDashboard } from '../exporters/dashboard.js';
import type { StoryGraph } from '../types.js';

export const generateArtifactsTool = {
  name: 'generate_artifacts',
  description: `Generate ALL artifacts from StoryGraph automatically.

GENERATES ALL FORMATS:
- mermaid.md: Mermaid diagram (GitHub/Obsidian preview)
- canvas.json: Canvas JSON (Obsidian canvas)
- story.md: Markdown document (reading)
- dashboard.html: HTML dashboard (interactive view)
- database.csv: CSV files (Notion/Airtable import)

NO FORMAT SELECTION NEEDED - generates everything automatically.`,

  inputSchema: z.object({
    graph: z.any().describe('StoryGraph JSON object')
  }),

  async execute(args: z.infer<typeof generateArtifactsTool['inputSchema']>) {
    const graph: StoryGraph = args.graph;

    // Generate ALL formats automatically
    const artifacts = {
      'mermaid.md': toMermaid(graph, { style: 'default', includeMetadata: true }),
      'canvas.json': JSON.stringify(toCanvasJSON(graph, { includeMetadata: true }), null, 2),
      'story.md': toMarkdown(graph, { includeMetadata: true, includeAnalysis: true }),
      'dashboard.html': toDashboard(graph, { includeStats: true, includeRecommendations: true }),
      'database.csv': generateCSV(graph)
    };

    // Return all files
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          generated: Object.keys(artifacts),
          files: artifacts
        }, null, 2)
      }]
    };
  }
};

// ============================================================================
// CSV Generation
// ============================================================================

function generateCSV(graph: StoryGraph): string {
  const lines: string[] = [];

  // Characters CSV
  lines.push('--- characters.csv ---');
  lines.push('id,name,role,status,tags');
  for (const char of graph.characters) {
    lines.push(`${char.id},"${char.name}",${char.role},alive,"${char.tags?.join(',') || ''}"`);
  }

  // Events CSV
  lines.push('\n--- events.csv ---');
  lines.push('id,label,act,importance,characters');
  for (const event of graph.events) {
    lines.push(`${event.id},"${event.label}",${event.act},${event.importance || 'normal'},"${event.characters?.join(',') || ''}"`);
  }

  // Conflicts CSV
  lines.push('\n--- conflicts.csv ---');
  lines.push('id,type,description,relatedCharacters');
  for (const conflict of graph.conflicts) {
    lines.push(`${conflict.id},${conflict.type},"${conflict.description}","${conflict.relatedCharacters?.join(',') || ''}"`);
  }

  return lines.join('\n');
}
