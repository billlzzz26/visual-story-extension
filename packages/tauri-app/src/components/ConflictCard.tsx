"use client";

import { getConflictColor } from "../lib/colors";
import type { Conflict } from "../types/story";

interface ConflictCardProps {
	conflict: Conflict;
}

export function ConflictCard({
	conflict,
}: ConflictCardProps): React.ReactElement {
	const colors = getConflictColor(conflict.type);

	return (
		<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
			<div className="flex justify-between items-center mb-2">
				<span
					className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors.bg} ${colors.text}`}
				>
					{conflict.type}
				</span>
				<span className="text-xs text-slate-400">
					Act {conflict.actIntroduced}
				</span>
			</div>

			<p className="text-sm text-slate-700 font-medium mb-3">
				{conflict.description}
			</p>

			<div className="border-t border-slate-100 pt-2">
				<p className="text-xs font-medium text-slate-500 mb-1">Escalations</p>
				<p className="text-xs text-slate-400">
					{conflict.escalations.length} stages
				</p>
			</div>
		</div>
	);
}
