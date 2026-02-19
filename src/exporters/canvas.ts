import { StoryGraph } from './types.js';

export function toCanvasJSON(graph: StoryGraph, options: { includeMetadata?: boolean; autoLayout?: boolean } = {}) {
  const nodes = graph.events.map((e, i) => ({
    id: e.id,
    data: { label: e.label, description: e.description, act: e.act, importance: e.importance },
    position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 140 },
    type: e.importance,
    style: getStyle(e.importance),
  }));

  graph.characters.forEach((c, i) => {
    nodes.push({
      id: c.id,
      data: { label: c.name, description: `${c.role}: ${c.traits.join(', ')}` },
      position: { x: 50, y: 100 + i * 80 },
      type: 'character',
      style: { backgroundColor: '#e3f2fd', borderColor: '#1976d2', borderWidth: 2 },
    });
  });

  const edges = graph.relationships.map((r, i) => ({
    id: `edge_${i}`, source: r.from, target: r.to, type: r.type, label: r.type,
  }));

  const canvasData = {
    nodes,
    edges,
    metadata: options.includeMetadata !== false ? {
      title: graph.meta.title, eventCount: graph.events.length,
      characterCount: graph.characters.length, conflictCount: graph.conflicts.length,
      exportedAt: new Date().toISOString(),
    } : {},
  };

  // Wrap in artifact format
  return `\`\`\`artifact
id: vsp3_canvas_complete
name: ${graph.meta.title.replace(/\s+/g, '_')}_Canvas
type: application/json
content: |-
${JSON.stringify(canvasData, null, 2).split('\n').map(line => '  ' + line).join('\n')}
\`\`\``;
}

function getStyle(importance: string) {
  const styles: Record<string, any> = {
    inciting: { backgroundColor: '#fff9c4', borderColor: '#fbc02d', borderWidth: 3 },
    midpoint: { backgroundColor: '#ffe0b2', borderColor: '#f57c00', borderWidth: 3 },
    climax: { backgroundColor: '#ffcdd2', borderColor: '#d32f2f', borderWidth: 4 },
    resolution: { backgroundColor: '#c8e6c9', borderColor: '#388e3c', borderWidth: 2 },
  };
  return styles[importance] || { backgroundColor: '#ffffff', borderColor: '#757575', borderWidth: 1 };
}
