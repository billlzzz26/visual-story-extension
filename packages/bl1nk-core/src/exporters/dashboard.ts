/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dashboard HTML export — single source with theme support.
 *
 * Themes:
 * - "classic": Indigo/blue gradient header, traditional card styles
 * - "modern":  Slate/indigo gradient, bordered cards, rose accents (MCP-UI)
 */

import type { StoryGraph } from "../types.js";
import { validateGraph } from "../validators.js";

export type DashboardTheme = "classic" | "modern";

export function toDashboard(
	graph: StoryGraph,
	options: {
		includeStats?: boolean;
		includeRecommendations?: boolean;
		theme?: DashboardTheme;
	} = {},
): string {
	const theme = options.theme ?? "classic";
	const isModern = theme === "modern";
	const v = validateGraph(graph);
	const htmlMap: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;",
	};
	const escapeHtml = (s: string) =>
		s.replace(/[&<>"']/g, (m) => htmlMap[m] || m);

	// Theme-dependent color tokens
	const colors = {
		headerGradient: isModern
			? "from-slate-800 to-indigo-700"
			: "from-indigo-600 to-blue-500",
		headerSubtitle: isModern ? "text-slate-300" : "text-indigo-100",
		headerTitle: isModern
			? "Visual Story Analysis"
			: "Story Structure Analysis Dashboard",
		cardBorder: isModern ? "border: 1px solid #e2e8f0;" : "",
		cardBg: isModern ? "bg-slate-50" : "bg-gray-50",
		cardTextPrimary: isModern ? "text-slate-800" : "text-gray-900",
		cardTextSecondary: isModern ? "text-slate-500" : "text-gray-500",
		cardTextMuted: isModern ? "text-slate-400" : "text-gray-400",
		divideColor: isModern ? "divide-slate-100" : "divide-gray-100",
		progressBg: isModern ? "bg-slate-100" : "bg-gray-100",
		progressText: isModern ? "text-slate-500" : "text-gray-500",
		milestoneBg: isModern ? "bg-slate-50" : "bg-gray-50",
		milestoneText: isModern ? "text-slate-400" : "text-gray-400",
		issueBgAlt: isModern ? "bg-amber-50" : "bg-orange-50",
		issueBorderAlt: isModern ? "border-amber-500" : "border-orange-500",
		issueTextAlt: isModern ? "text-amber-700" : "text-orange-700",
		conflictBg: isModern ? "bg-slate-50" : "bg-gray-50",
		conflictText: isModern ? "text-slate-800" : "text-gray-800",
		charRoleBg: "bg-blue-50",
		charRoleText: "text-blue-600",
		issuesHeader: isModern ? "text-rose-600" : "text-red-600",
		issuesBg: isModern ? "bg-rose-50" : "bg-red-50",
		issuesBorder: isModern ? "border-rose-500" : "border-red-500",
		issuesText: isModern ? "text-rose-700" : "text-red-700",
		recHeader: isModern ? "text-indigo-600" : "text-indigo-600",
		recIcon: isModern ? "text-indigo-500" : "text-indigo-500",
		recText: isModern ? "text-slate-700" : "text-gray-700",
		structureHeader: isModern ? "text-slate-800" : "text-indigo-600",
		statEvent: isModern ? "text-blue-600" : "text-indigo-600",
		statChar: isModern ? "text-indigo-600" : "text-blue-600",
		statConflict: isModern ? "text-rose-600" : "text-orange-500",
		statPacing: isModern ? "text-slate-700" : "text-emerald-500",
		statLabel: isModern ? "text-slate-500" : "text-gray-500",
		actBadge1: isModern ? "bg-indigo-100 text-indigo-700" : "",
		actBadge2: isModern ? "bg-blue-100 text-blue-700" : "",
		actBadge3: isModern ? "bg-rose-100 text-rose-700" : "",
		actBar1: isModern ? "#818cf8" : "#818cf8",
		actBar2: isModern ? "#60a5fa" : "#60a5fa",
		actBar3: isModern ? "#fb7185" : "#f87171",
		chartGrid: isModern ? "#f1f5f9" : "transparent",
		chartShowGrid: isModern,
		milestoneBoxBg: "bg-indigo-50",
		milestoneBoxText: "text-indigo-600",
		milestoneBoxValue: "text-indigo-900",
		milestoneBoxLabel: "text-indigo-500",
	};

	const actBadgeMarkup = isModern
		? `<div class="flex gap-2">
                        <span class="px-2 py-0.5 rounded-full text-xs font-bold uppercase ${colors.actBadge1}">Act 1</span>
                        <span class="px-2 py-0.5 rounded-full text-xs font-bold uppercase ${colors.actBadge2}">Act 2</span>
                        <span class="px-2 py-0.5 rounded-full text-xs font-bold uppercase ${colors.actBadge3}">Act 3</span>
                    </div>`
		: "";

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
        .card { background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: transform 0.2s; ${colors.cardBorder} }
        .card:hover { transform: translateY(-2px); }
        .act-1 { background-color: ${colors.actBar1}; }
        .act-2 { background-color: ${colors.actBar2}; }
        .act-3 { background-color: ${colors.actBar3}; }
    </style>
</head>
<body class="p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <header class="mb-8 bg-gradient-to-r ${colors.headerGradient} p-8 rounded-2xl text-white shadow-lg">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-4xl font-bold mb-2">${escapeHtml(graph.meta.title)}</h1>
                    <p class="${colors.headerSubtitle} opacity-90">${colors.headerTitle}</p>
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
                <p class="text-sm ${colors.statLabel} font-medium uppercase mb-1">Events</p>
                <p class="text-3xl font-bold ${colors.statEvent}">${v.analysis.eventCount}</p>
            </div>
            <div class="card p-6 text-center">
                <p class="text-sm ${colors.statLabel} font-medium uppercase mb-1">Characters</p>
                <p class="text-3xl font-bold ${colors.statChar}">${v.analysis.characterCount}</p>
            </div>
            <div class="card p-6 text-center">
                <p class="text-sm ${colors.statLabel} font-medium uppercase mb-1">Conflicts</p>
                <p class="text-3xl font-bold ${colors.statConflict}">${v.analysis.conflictCount}</p>
            </div>
            <div class="card p-6 text-center">
                <p class="text-sm ${colors.statLabel} font-medium uppercase mb-1">Pacing</p>
                <p class="text-3xl font-bold ${colors.statPacing} capitalize">${v.analysis.pacing}</p>
            </div>
        </div>
        `
						: ""
				}

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Act Distribution -->
            <div class="card p-6 lg:col-span-2">
                <h2 class="text-xl font-bold mb-6 flex items-center justify-between">
                    <span class="flex items-center">
                    <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    3-Act Structure Distribution
                    </span>
                    ${actBadgeMarkup}
                </h2>
                <div class="h-64">
                    <canvas id="actChart"></canvas>
                </div>
                <div class="mt-6 flex h-4 rounded-full overflow-hidden ${colors.progressBg}">
                    <div class="act-1" style="width: ${(v.analysis.actBalance.act1 / (v.analysis.eventCount || 1)) * 100}%"></div>
                    <div class="act-2" style="width: ${(v.analysis.actBalance.act2 / (v.analysis.eventCount || 1)) * 100}%"></div>
                    <div class="act-3" style="width: ${(v.analysis.actBalance.act3 / (v.analysis.eventCount || 1)) * 100}%"></div>
                </div>
                <div class="mt-2 flex justify-between text-xs font-medium ${colors.progressText}">
                    <span>Act 1: ${v.analysis.actBalance.act1}</span>
                    <span>Act 2: ${v.analysis.actBalance.act2}</span>
                    <span>Act 3: ${v.analysis.actBalance.act3}</span>
                </div>
            </div>

            <!-- Key Milestones -->
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-6 ${colors.structureHeader}">Structure Health</h2>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 rounded-lg ${v.analysis.hasMidpoint ? "bg-emerald-50 text-emerald-700" : `${colors.milestoneBg} ${colors.milestoneText}`}">
                        <span class="font-medium">Midpoint</span>
                        <span>${v.analysis.hasMidpoint ? "✅" : "❌"}</span>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-lg ${v.analysis.hasClimax ? "bg-emerald-50 text-emerald-700" : `${colors.milestoneBg} ${colors.milestoneText}`}">
                        <span class="font-medium">Climax</span>
                        <span>${v.analysis.hasClimax ? "✅" : "❌"}</span>
                    </div>
                    <div class="p-4 ${colors.milestoneBoxBg} rounded-xl mt-4">
                        <p class="text-xs ${colors.milestoneBoxText} font-bold uppercase mb-1">Structure Score</p>
                        <p class="text-2xl font-bold ${colors.milestoneBoxValue}">${(v.analysis.actBalance.balance * 100).toFixed(0)}%</p>
                        <p class="text-xs ${colors.milestoneBoxLabel} mt-1">Based on act symmetry</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Issues & Recommendations -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-4 ${colors.issuesHeader}">Structural Issues</h2>
                ${
									v.issues.length > 0
										? `
                    <div class="space-y-3">
                        ${v.issues
													.map(
														(i) => `
                            <div class="p-3 rounded-lg border-l-4 ${i.severity === "error" ? `${colors.issuesBg} ${colors.issuesBorder} ${colors.issuesText}` : `${colors.issueBgAlt} ${colors.issueBorderAlt} ${colors.issueTextAlt}`}">
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
                <h2 class="text-xl font-bold mb-4 ${colors.recHeader}">Recommendations</h2>
                <ul class="space-y-3">
                    ${v.recommendations
											.map(
												(r) => `
                        <li class="flex items-start">
                            <svg class="w-5 h-5 ${colors.recIcon} mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            <span class="${colors.recText} text-sm">${escapeHtml(r)}</span>
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
                <h2 class="text-xl font-bold mb-4 ${colors.cardTextPrimary}">Character Roster</h2>
                <div class="divide-y ${colors.divideColor}">
                    ${graph.characters
											.map(
												(c) => `
                        <div class="py-3 flex justify-between items-center">
                            <div>
                                <p class="font-bold ${colors.cardTextPrimary}">${escapeHtml(c.name)}</p>
                                <p class="text-xs ${colors.cardTextSecondary}">${escapeHtml(c.traits.slice(0, 3).join(", "))}</p>
                            </div>
                            <span class="px-2 py-1 ${colors.charRoleBg} ${colors.charRoleText} rounded text-xs font-bold uppercase">${escapeHtml(c.role)}</span>
                        </div>
                    `,
											)
											.join("")}
                </div>
            </div>
            <div class="card p-6">
                <h2 class="text-xl font-bold mb-4 ${colors.cardTextPrimary}">Core Conflicts</h2>
                <div class="space-y-4">
                    ${graph.conflicts
											.map(
												(c) => `
                        <div class="p-4 ${colors.conflictBg} rounded-xl">
                            <div class="flex justify-between mb-2">
                                <span class="text-xs font-bold ${colors.recIcon} uppercase">${escapeHtml(c.type)}</span>
                                <span class="text-xs ${colors.cardTextMuted}">Act ${c.actIntroduced}</span>
                            </div>
                            <p class="text-sm ${colors.conflictText} font-medium">${escapeHtml(c.description)}</p>
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
                    backgroundColor: [${JSON.stringify(colors.actBar1)}, ${JSON.stringify(colors.actBar2)}, ${JSON.stringify(colors.actBar3)}],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: ${JSON.stringify(colors.chartGrid)} } },
                    x: { grid: { display: ${colors.chartShowGrid ? "false" : "true"} } }
                }
            }
        });
    </script>
</body>
</html>`;

	return html;
}

/**
 * MCP-UI Dashboard — delegates to unified dashboard with modern theme.
 * Kept for backward compatibility.
 */
export function toMcpUiDashboard(
	graph: StoryGraph,
	options: { includeStats?: boolean; includeRecommendations?: boolean } = {},
): string {
	return toDashboard(graph, { ...options, theme: "modern" });
}
