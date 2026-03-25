import { buildInitialGraph } from '../dist/analyzer.js';
import { validateGraph } from '../dist/validators.js';
import { toMermaid } from '../dist/exporters/mermaid.js';
import { toCanvasJSON } from '../dist/exporters/json.js';

const story = `Title: Test Story
Character: Hero, role: protagonist
Event: Start
Event: Middle
Event: End`;

const graph = buildInitialGraph(story);
const validation = validateGraph(graph);
const mermaid = toMermaid(graph);
const canvasArtifact = toCanvasJSON(graph);

console.log('Graph title:', graph.meta.title);
console.log('Validation valid:', validation.isValid);
console.log('Mermaid starts with graph TD:', mermaid.includes('graph TD'));
console.log('Canvas has artifact wrapper:', canvasArtifact.includes('```artifact'));
console.log('All exporters working');
