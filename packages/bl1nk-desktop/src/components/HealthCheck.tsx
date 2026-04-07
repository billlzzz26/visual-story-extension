"use client";

interface HealthCheckProps {
	hasMidpoint: boolean;
	hasClimax: boolean;
	balanceScore: number;
}

export function HealthCheck({
	hasMidpoint,
	hasClimax,
	balanceScore,
}: HealthCheckProps): React.ReactElement {
	const scorePercent = Math.round(balanceScore * 100);

	return (
		<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
			<h2 className="text-lg font-semibold text-slate-800 mb-4">
				Structure Health
			</h2>

			<div className="space-y-3">
				<div
					className={`flex items-center justify-between p-3 rounded-lg ${hasMidpoint ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}
				>
					<span className="font-medium">Midpoint</span>
					<span>{hasMidpoint ? "✓" : "✗"}</span>
				</div>

				<div
					className={`flex items-center justify-between p-3 rounded-lg ${hasClimax ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}
				>
					<span className="font-medium">Climax</span>
					<span>{hasClimax ? "✓" : "✗"}</span>
				</div>

				<div className="p-4 bg-indigo-50 rounded-xl mt-4">
					<p className="text-xs font-bold text-indigo-600 uppercase mb-1">
						Structure Score
					</p>
					<p className="text-2xl font-bold text-indigo-900">{scorePercent}%</p>
					<p className="text-xs text-indigo-500 mt-1">Based on act symmetry</p>
				</div>
			</div>
		</div>
	);
}
