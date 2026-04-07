"use client";

import type React from "react";
import { useState } from "react";
import { ActDistributionChart } from "./components/ActDistributionChart";
import { CharacterCard } from "./components/CharacterCard";
import { ConflictCard } from "./components/ConflictCard";
import { HealthCheck } from "./components/HealthCheck";
import { MermaidViewer } from "./components/MermaidViewer";
import { StatCard } from "./components/StatCard";
import { StoryTimeline } from "./components/StoryTimeline";
import { ValidationPanel } from "./components/ValidationPanel";
import {
	mockMermaidDiagram,
	mockStoryGraph,
	mockValidationResult,
} from "./lib/mock-data";

type ActiveView = "editor" | "graph" | "timeline" | "insights";

interface NavItem {
	id: ActiveView;
	label: string;
	icon: string;
}

const NAV_ITEMS: NavItem[] = [
	{ id: "editor", label: "Editor", icon: "✏️" },
	{ id: "graph", label: "Graph", icon: "🕸️" },
	{ id: "timeline", label: "Timeline", icon: "📅" },
	{ id: "insights", label: "Insights", icon: "📊" },
];

function App(): React.ReactElement {
	const [activeView, setActiveView] = useState<ActiveView>("editor");

	const graph = mockStoryGraph;
	const validation = mockValidationResult;

	return (
		<div className="flex h-screen w-screen bg-slate-50 text-slate-800 overflow-hidden">
			<aside className="flex flex-col w-60 min-w-[240px] bg-white border-r border-slate-200 shadow-sm">
				<div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
					<div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm select-none">
						VSP
					</div>
					<span className="font-semibold text-slate-800 tracking-tight">
						Visual Story Planner
					</span>
				</div>

				<nav
					className="flex-1 px-2 py-4 space-y-1"
					aria-label="Main navigation"
				>
					{NAV_ITEMS.map((item) => (
						<button
							key={item.id}
							onClick={() => setActiveView(item.id)}
							aria-current={activeView === item.id ? "page" : undefined}
							className={[
								"flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
								activeView === item.id
									? "bg-indigo-50 text-indigo-700"
									: "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
							].join(" ")}
						>
							<span aria-hidden="true">{item.icon}</span>
							{item.label}
						</button>
					))}
				</nav>

				<div className="px-2 py-4 border-t border-slate-100">
					<button
						className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
						aria-label="Settings"
					>
						<span aria-hidden="true">⚙️</span>
						Settings
					</button>
				</div>
			</aside>

			<main className="flex-1 flex flex-col overflow-hidden">
				<header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
					<h1 className="text-lg font-semibold text-slate-800 capitalize">
						{activeView}
					</h1>
					<div className="flex items-center gap-2">
						<span className="text-xs text-slate-400">
							Visual Story Planner v0.1.0
						</span>
					</div>
				</header>

				<div className="flex-1 overflow-auto p-6">
					<ViewContent
						activeView={activeView}
						graph={graph}
						validation={validation}
					/>
				</div>
			</main>
		</div>
	);
}

interface ViewContentProps {
	activeView: ActiveView;
	graph: typeof mockStoryGraph;
	validation: typeof mockValidationResult;
}

function ViewContent({
	activeView,
	graph,
	validation,
}: ViewContentProps): React.ReactElement {
	switch (activeView) {
		case "editor":
			return <EditorView graph={graph} />;
		case "graph":
			return (
				<div className="space-y-6">
					<div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 rounded-xl text-white shadow-lg">
						<h2 className="text-2xl font-bold mb-2">{graph.meta.title}</h2>
						<p className="text-indigo-100">
							{graph.meta.genre || "General"} • v{graph.meta.version}
						</p>
					</div>
					<MermaidViewer diagram={mockMermaidDiagram} />
				</div>
			);
		case "timeline":
			return <StoryTimeline events={graph.events} />;
		case "insights":
			return <InsightsView graph={graph} validation={validation} />;
		default:
			return <div>Unknown view</div>;
	}
}

function EditorView({
	graph,
}: { graph: typeof mockStoryGraph }): React.ReactElement {
	return (
		<div className="space-y-6">
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
				<h2 className="text-lg font-semibold text-slate-800 mb-4">
					Characters
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{graph.characters.map((character) => (
						<CharacterCard key={character.id} character={character} />
					))}
				</div>
			</div>

			<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
				<h2 className="text-lg font-semibold text-slate-800 mb-4">Conflicts</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{graph.conflicts.map((conflict) => (
						<ConflictCard key={conflict.id} conflict={conflict} />
					))}
				</div>
			</div>
		</div>
	);
}

function InsightsView({
	graph,
	validation,
}: {
	graph: typeof mockStoryGraph;
	validation: typeof mockValidationResult;
}): React.ReactElement {
	return (
		<div className="space-y-6">
			<div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 rounded-xl text-white shadow-lg">
				<h2 className="text-2xl font-bold mb-2">{graph.meta.title}</h2>
				<p className="text-indigo-100">
					{graph.meta.genre || "General"} • v{graph.meta.version}
				</p>
				<div className="flex gap-2 mt-3">
					{graph.tags.map((tag) => (
						<span key={tag} className="px-2 py-1 bg-white/20 rounded text-xs">
							{tag}
						</span>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<StatCard
					label="Events"
					value={validation.analysis.eventCount}
					color="indigo"
				/>
				<StatCard
					label="Characters"
					value={validation.analysis.characterCount}
					color="blue"
				/>
				<StatCard
					label="Conflicts"
					value={validation.analysis.conflictCount}
					color="orange"
				/>
				<StatCard
					label="Pacing"
					value={validation.analysis.pacing}
					color="emerald"
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<ActDistributionChart
						act1={validation.analysis.actBalance.act1}
						act2={validation.analysis.actBalance.act2}
						act3={validation.analysis.actBalance.act3}
					/>
				</div>
				<HealthCheck
					hasMidpoint={validation.analysis.hasMidpoint}
					hasClimax={validation.analysis.hasClimax}
					balanceScore={validation.analysis.actBalance.balance}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<ValidationPanel validation={validation} />
				<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
					<h2 className="text-lg font-semibold text-slate-800 mb-4">
						Character Roster
					</h2>
					<div className="divide-y divide-slate-100">
						{graph.characters.map((character) => (
							<div
								key={character.id}
								className="py-3 flex justify-between items-center"
							>
								<div>
									<p className="font-bold text-slate-900">{character.name}</p>
									<p className="text-xs text-slate-500">
										{character.traits.slice(0, 3).join(", ")}
									</p>
								</div>
								<span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold uppercase">
									{character.role}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
					<h2 className="text-lg font-semibold text-slate-800 mb-4">
						Core Conflicts
					</h2>
					<div className="space-y-4">
						{graph.conflicts.map((conflict) => (
							<div key={conflict.id} className="p-4 bg-slate-50 rounded-xl">
								<div className="flex justify-between mb-2">
									<span className="text-xs font-bold text-indigo-600 uppercase">
										{conflict.type}
									</span>
									<span className="text-xs text-slate-400">
										Act {conflict.actIntroduced}
									</span>
								</div>
								<p className="text-sm text-slate-800 font-medium">
									{conflict.description}
								</p>
							</div>
						))}
					</div>
				</div>
				<MermaidViewer diagram={mockMermaidDiagram} />
			</div>
		</div>
	);
}

export default App;
