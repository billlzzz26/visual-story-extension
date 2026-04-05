import type { StoryGraph } from "../types.js";
import { validateGraph } from "../validators.js";

export function toDashboard(
	graph: StoryGraph,
	options: { includeStats?: boolean; includeRecommendations?: boolean } = {},
): string {
	const v = validateGraph(graph);
	const escapeHtml = (s: string) =>
		s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(graph.meta.title)} - bl1nk Story Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        .card { background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: transform 0.2s; }
        .card:hover { transform: translateY(-2px); }
        .act-1 { background-color: #818cf8; }
        .act-2 { background-color: #60a5fa; }
        .act-3 { background-color: #f87171; }
    </style>
</head>
<body class="p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <header class="mb-8 bg-gradient-to-r from-indigo-600 to-blue-500 p-8 rounded-2xl text-white shadow-lg">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-4xl font-bold mb-2">${escapeHtml(graph.meta.title)}</h1>
                    <p class="text-indigo-100 opacity-90">Story Structure Analysis Dashboard</p>
                </div>
                <div class="text-right">
                    <span class="px-3 py-1 bg-white/20 rounded-full text-sm font-medium uppercase tracking-wider">
                        ${escapeHtml(graph.meta.genre || "General")}
                    </span>
                    <p class="mt-2 text-xs opacity-75">v${graph.meta.version}</p>
                </div>
            </div>
        </header>

        ${
					options.includeStats !== false
						? `
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="card p-6 text-center">
                <p class="text-sm text-gray-500 font-medium uppercase mb-1">Events</p>
                <p class="text-3xl font-bold text-indigo-600">${v.analysis.eventCount}</p>
            </div>
            <div class="card p-6 text-center">
                <p class="text-sm text-gray-500 font-medium uppercase mb-1">Characters</p>
                <p class="text-3xl font-bold text-blue-600">${v.analysis.characterCount}</p>
            </div>
            <div class="card p-6 text-center">
                <p class="text-sm text-gray-500 font-medium uppercase mb-1">Conflicts</p>
                <p class="text-3xl font-bold text-orange-500">${v.analysis.conflictCount}</p>
            </div>
            <div class="card p-6 text-center">
                <p class="text-sm text-gray-500 font-medium uppercase mb-1">Pacing</p>
                <p class="text-3xl font-bold text-emerald-500 capitalize">${v.analysis.pacing}</p>
            </div>
        </div>
        `
						: ""
				}

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Act Distribution -->
            <div class="card p-6 lg:col-span-2">
                <h2 class="text-xl font-bold mb-6 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    3-Act Structure Distribution
                </h2>
                <div class="h-64">
                    <canvas id="actChart"></canvas>
                </div>
                <div class="mt-6 flex h-4 rounded-full overflow-hidden bg-gray-100">
                    <div class="act-1" style="width: ${(v.analysis.actBalance.act1 / v.analysis.eventCount) * 100}%"></div>
                    <div class="act-2" style="width: ${(v.analysis.actBalance.act2 / v.analysis.eventCount) * 100}%"></div>
                    <div class="act-3" style="width: ${(v.analysis.actBalance.act3 / v.analysis.eventCount) * 100}%"></div>
                </div>
                <div class="mt-2 flex justify-between text-xs font-medium text-gray-500">
                    <span>Act 1: ${v.analysis.actBalance.act1}</span>
                    <span>Act 2: ${v.analysis.actBalance.act2}</span>
                    <span>Act 3: ${v.analysis.actBalance.act3}</span>
                </div>
            </div>

            <!-- Key Milestones -->
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-6">Key Milestones</h2>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 rounded-lg ${v.analysis.hasMidpoint ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"}">
                        <span class="font-medium">Midpoint</span>
                        <span>${v.analysis.hasMidpoint ? "✅" : "❌"}</span>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-lg ${v.analysis.hasClimax ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"}">
                        <span class="font-medium">Climax</span>
                        <span>${v.analysis.hasClimax ? "✅" : "❌"}</span>
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
                <h2 class="text-xl font-bold mb-4 text-red-600">Structural Issues</h2>
                ${
									v.issues.length > 0
										? `
                    <div class="space-y-3">
                        ${v.issues
													.map(
														(i) => `
                            <div class="p-3 rounded-lg border-l-4 ${i.severity === "error" ? "bg-red-50 border-red-500 text-red-700" : "bg-orange-50 border-orange-500 text-orange-700"}">
                                <p class="text-sm font-bold uppercase text-xs mb-1">${escapeHtml(i.code)}</p>
                                <p class="text-sm">${escapeHtml(i.message)}</p>
                            </div>
                        `,
													)
													.join("")}
                    </div>
                `
										: '<p class="text-emerald-600 font-medium">No structural issues found! ✨</p>'
								}
            </div>
            ${
							options.includeRecommendations !== false
								? `
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-4 text-indigo-600">Recommendations</h2>
                <ul class="space-y-3">
                    ${v.recommendations
											.map(
												(r) => `
                        <li class="flex items-start">
                            <svg class="w-5 h-5 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            <span class="text-gray-700 text-sm">${escapeHtml(r)}</span>
                        </li>
                    `,
											)
											.join("")}
                </ul>
            </div>
            `
								: ""
						}
        </div>

        <!-- Characters & Conflicts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-4">Character Roster</h2>
                <div class="divide-y divide-gray-100">
                    ${graph.characters
											.map(
												(c) => `
                        <div class="py-3 flex justify-between items-center">
                            <div>
                                <p class="font-bold text-gray-900">${escapeHtml(c.name)}</p>
                                <p class="text-xs text-gray-500">${escapeHtml(c.traits.slice(0, 3).join(", "))}</p>
                            </div>
                            <span class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold uppercase">${escapeHtml(c.role)}</span>
                        </div>
                    `,
											)
											.join("")}
                </div>
            </div>
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-4">Core Conflicts</h2>
                <div class="space-y-4">
                    ${graph.conflicts
											.map(
												(c) => `
                        <div class="p-4 bg-gray-50 rounded-xl">
                            <div class="flex justify-between mb-2">
                                <span class="text-xs font-bold text-indigo-600 uppercase">${escapeHtml(c.type)}</span>
                                <span class="text-xs text-gray-400">Act ${c.actIntroduced}</span>
                            </div>
                            <p class="text-sm text-gray-800 font-medium">${escapeHtml(c.description)}</p>
                        </div>
                    `,
											)
											.join("")}
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
                    backgroundColor: ['#818cf8', '#60a5fa', '#f87171'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    </script>
</body>
</html>`;

	return html;
}
