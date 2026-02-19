import { StoryGraph } from "../schema.js";

export function toCanvasJSON(graph: StoryGraph) {
  const nodes = (graph.events || []).map((e, i) => ({
    id: e.id,
    data: { label: e.label, act: e.act, importance: e.importance || null },
    position: { x: (i % 6) * 200, y: Math.floor(i / 6) * 140 }
  }));

  const edges = (graph.relationships || []).map((r, i) => ({
    id: "e" + i,
    source: r.from,
    target: r.to,
    type: r.type || "sequence"
  }));

  const canvasData = JSON.stringify({ nodes, edges, meta: graph.meta }, null, 2);
  
  // Wrap in artifact format
  return `\`\`\`artifact
id: vsp3_canvas_json
name: ${graph.meta.title.replace(/\s+/g, '_')}_Canvas_JSON
type: application/json
content: |-
${canvasData.split('\n').map(line => '  ' + line).join('\n')}
\`\`\``;
}
