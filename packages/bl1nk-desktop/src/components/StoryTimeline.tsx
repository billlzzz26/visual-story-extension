"use client";

import { getImportanceColor } from "../lib/colors";
import type { EventNode } from "../types/story";

interface StoryTimelineProps {
	events: EventNode[];
}

export function StoryTimeline({
	events,
}: StoryTimelineProps): React.ReactElement {
	const sortedEvents = [...events].sort((a, b) => {
		if (a.act !== b.act) return a.act - b.act;
		return a.sequenceInAct - b.sequenceInAct;
	});

	const currentAct = {
		1: "Act I - Setup",
		2: "Act II - Confrontation",
		3: "Act III - Resolution",
	};

	return (
		<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
			<h2 className="text-lg font-semibold text-slate-800 mb-4">
				Story Timeline
			</h2>

			<div className="space-y-4">
				{sortedEvents.map((event, index) => {
					const colors = getImportanceColor(event.importance);
					return (
						<div key={event.id} className="flex items-start gap-4">
							<div className="flex flex-col items-center">
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colors.bg} ${colors.text}`}
								>
									{index + 1}
								</div>
								{index < sortedEvents.length - 1 && (
									<div className="w-0.5 h-12 bg-slate-200 mt-1" />
								)}
							</div>

							<div className="flex-1 pb-4">
								<div className="flex items-center gap-2 mb-1">
									<span className="text-xs font-medium text-slate-500">
										{currentAct[event.act as keyof typeof currentAct]}
									</span>
									<span
										className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
									>
										{event.importance}
									</span>
								</div>
								<h3 className="font-semibold text-slate-800">{event.label}</h3>
								<p className="text-sm text-slate-500 mt-1">
									{event.description}
								</p>
								{event.location && (
									<p className="text-xs text-slate-400 mt-1">
										📍 {event.location}
									</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
