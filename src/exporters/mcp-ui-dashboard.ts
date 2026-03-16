import { StoryGraph } from '../types.js';
import { validateGraph } from '../validators.js';

export function toMcpUiDashboard(graph: StoryGraph, options: { includeStats?: boolean; includeRecommendations?: boolean } = {}): string {
    const v = validateGraph(graph);
    const escape = (str: string) => str.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m] || m);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Story Planner Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        .card { background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
        .act-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    </style>
</head>
<body class="p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 class="text-3xl font-bold text-slate-900 mb-1">${escape(graph.meta.title)}</h1>
                <p class="text-slate-500 flex items-center">
                    <span class="mr-2">Visual Story Analysis</span>
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono">${graph.meta.version}</span>
                </p>
            </div>
            <div class="flex gap-2">
                ${graph.tags.map(t => `<span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">#${escape(t)}</span>`).join('')}
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="card p-4 flex flex-col items-center justify-center text-center">
                <p class="text-slate-500 text-xs font-bold uppercase mb-1">Characters</p>
                <p class="text-3xl font-bold text-indigo-600">${v.analysis.characterCount}</p>
            </div>
            <div class="card p-4 flex flex-col items-center justify-center text-center">
                <p class="text-slate-500 text-xs font-bold uppercase mb-1">Events</p>
                <p class="text-3xl font-bold text-blue-600">${v.analysis.eventCount}</p>
            </div>
            <div class="card p-4 flex flex-col items-center justify-center text-center">
                <p class="text-slate-500 text-xs font-bold uppercase mb-1">Conflicts</p>
                <p class="text-3xl font-bold text-rose-600">${v.analysis.conflictCount}</p>
            </div>
            <div class="card p-4 flex flex-col items-center justify-center text-center">
                <p class="text-slate-500 text-xs font-bold uppercase mb-1">Pacing</p>
                <p class="text-xl font-bold text-slate-700 capitalize">${v.analysis.pacing}</p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Act Distribution -->
            <div class="card p-6 lg:col-span-2">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-slate-800">Act Distribution</h2>
                    <div class="flex gap-2">
                        <span class="act-badge bg-indigo-100 text-indigo-700">Act 1</span>
                        <span class="act-badge bg-blue-100 text-blue-700">Act 2</span>
                        <span class="act-badge bg-rose-100 text-rose-700">Act 3</span>
                    </div>
                </div>
                <div class="h-64 relative">
                    <canvas id="actChart"></canvas>
                </div>
            </div>

            <!-- Health Check -->
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-6 text-slate-800">Structure Health</h2>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 rounded-lg ${v.analysis.hasMidpoint ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}">
                        <span class="font-medium">Midpoint</span>
                        <span>${v.analysis.hasMidpoint ? '✅' : '❌'}</span>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-lg ${v.analysis.hasClimax ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}">
                        <span class="font-medium">Climax</span>
                        <span>${v.analysis.hasClimax ? '✅' : '❌'}</span>
                    </div>
                    <div class="p-4 bg-indigo-50 rounded-xl mt-4">
                        <p class="text-xs text-indigo-600 font-bold uppercase mb-1">Structure Score</p>
                        <p class="text-2xl font-bold text-indigo-900">${(v.analysis.actBalance.balance * 100).toFixed(0)}%</p>
                        <p class="text-xs text-indigo-500 mt-1">Based on act symmetry</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Issues & Recommendations -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-4 text-rose-600">Structural Issues</h2>
                ${v.issues.length > 0 ? `
                    <div class="space-y-3">
                        ${v.issues.map(i => `
                            <div class="p-3 rounded-lg border-l-4 ${i.severity === 'error' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-amber-50 border-amber-500 text-amber-700'}">
                                <p class="text-sm font-bold uppercase text-xs mb-1">${escape(i.code)}</p>
                                <p class="text-sm">${escape(i.message)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-emerald-600 font-medium">No structural issues found! ✨</p>'}
            </div>
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-4 text-indigo-600">Recommendations</h2>
                <ul class="space-y-3">
                    ${v.recommendations.map(r => `
                        <li class="flex items-start">
                            <svg class="w-5 h-5 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            <span class="text-slate-700 text-sm">${escape(r)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>

        <!-- Characters & Conflicts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-4 text-slate-800">Character Roster</h2>
                <div class="divide-y divide-slate-100">
                    ${graph.characters.map(c => `
                        <div class="py-3 flex justify-between items-center">
                            <div>
                                <p class="font-bold text-slate-900">${escape(c.name)}</p>
                                <p class="text-xs text-slate-500">${escape(c.traits.slice(0, 3).join(', '))}</p>
                            </div>
                            <span class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold uppercase">${escape(c.role)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-4 text-slate-800">Core Conflicts</h2>
                <div class="space-y-4">
                    ${graph.conflicts.map(c => `
                        <div class="p-4 bg-slate-50 rounded-xl">
                            <div class="flex justify-between mb-2">
                                <span class="text-xs font-bold text-indigo-600 uppercase">${escape(c.type)}</span>
                                <span class="text-xs text-slate-400">Act ${c.actIntroduced}</span>
                            </div>
                            <p class="text-sm text-slate-800 font-medium">${escape(c.description)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
    <script>
        const ctx = document.getElementById('actChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Act 1', 'Act 2', 'Act 3'],
                datasets: [{
                    label: 'Number of Events',
                    data: [${v.analysis.actBalance.act1}, ${v.analysis.actBalance.act2}, ${v.analysis.actBalance.act3}],
                    backgroundColor: ['#818cf8', '#60a5fa', '#fb7185'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    </script>
</body>
</html>`;
    return html;
}
