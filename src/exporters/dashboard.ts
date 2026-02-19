import { StoryGraph } from './types.js';
import { validateGraph } from '../validators.js';

export function toDashboard(graph: StoryGraph, options: { includeStats?: boolean; includeRecommendations?: boolean } = {}): string {
  const v = validateGraph(graph);
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${escape(graph.meta.title)} - Dashboard</title>
<style>
body{font-family:system-ui,sans-serif;background:#f5f5f5;padding:20px}
.container{max-width:1200px;margin:0 auto}
header{background:linear-gradient(135deg,#1976d2,#42a5f5);color:white;padding:30px;border-radius:12px;margin-bottom:20px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
.card{background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.card h2{color:#1976d2;border-bottom:2px solid #e0e0e0;padding-bottom:10px}
.stat{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee}
.act-bar{display:flex;height:40px;border-radius:8px;overflow:hidden;margin:15px 0}
.act-1{background:#4caf50}.act-2{background:#2196f3}.act-3{background:#f44336}
.act-segment{display:flex;align-items:center;justify-content:center;color:white;font-weight:bold}
.issue{padding:12px;margin:10px 0;border-radius:8px;border-left:4px solid}
.issue.error{background:#ffebee;border-color:#d32f2f}.issue.warning{background:#fff3e0;border-color:#f57c00}
</style></head>
<body><div class="container">
<header><h1>${escape(graph.meta.title)}</h1><p>Genre: ${escape(graph.meta.genre || 'N/A')}</p></header>
<div class="grid">
${options.includeStats !== false ? `
<div class="card"><h2>📊 Statistics</h2>
<div class="stat"><span>Events</span><span>${v.analysis.eventCount}</span></div>
<div class="stat"><span>Characters</span><span>${v.analysis.characterCount}</span></div>
<div class="stat"><span>Conflicts</span><span>${v.analysis.conflictCount}</span></div>
<div class="stat"><span>Midpoint</span><span>${v.analysis.hasMidpoint ? '✅' : '❌'}</span></div>
<div class="stat"><span>Climax</span><span>${v.analysis.hasClimax ? '✅' : '❌'}</span></div>
<div class="stat"><span>Pacing</span><span>${v.analysis.pacing}</span></div>
</div>
<div class="card"><h2>📐 Act Distribution</h2>
<div class="act-bar">
<div class="act-segment act-1" style="width:${(v.analysis.actBalance.act1 / v.analysis.eventCount) * 100}%">Act1(${v.analysis.actBalance.act1})</div>
<div class="act-segment act-2" style="width:${(v.analysis.actBalance.act2 / v.analysis.eventCount) * 100}%">Act2(${v.analysis.actBalance.act2})</div>
<div class="act-segment act-3" style="width:${(v.analysis.actBalance.act3 / v.analysis.eventCount) * 100}%">Act3(${v.analysis.actBalance.act3})</div>
</div></div>` : ''}
${v.issues.length > 0 ? `
<div class="card" style="grid-column:1/-1"><h2>⚠️ Issues (${v.issues.length})</h2>
${v.issues.map(i => `<div class="issue ${i.severity}"><strong>[${i.code}]</strong> ${escape(i.message)}</div>`).join('')}
</div>` : '<div class="card" style="grid-column:1/-1"><h2>✅ Validation Passed</h2></div>'}
<div class="card"><h2>👥 Characters</h2><ul>${graph.characters.map(c => `<li><strong>${escape(c.name)}</strong> (${c.role})</li>`).join('')}</ul></div>
<div class="card"><h2>⚔️ Conflicts</h2><ul>${graph.conflicts.map(c => `<li>${escape(c.description)} (${c.type})</li>`).join('')}</ul></div>
</div></div></body></html>`;

  // Wrap in artifact format
  return `\`\`\`artifact
id: vsp3_html_dashboard
name: ${graph.meta.title.replace(/\s+/g, '_')}_Dashboard
type: text/html
content: |-
${html.split('\n').map(line => '  ' + line).join('\n')}
\`\`\``;
}
