'use client';

interface ActDistributionChartProps {
  act1: number;
  act2: number;
  act3: number;
}

export function ActDistributionChart({ act1, act2, act3 }: ActDistributionChartProps): React.ReactElement {
  const total = act1 + act2 + act3;
  const act1Percent = total > 0 ? (act1 / total) * 100 : 0;
  const act2Percent = total > 0 ? (act2 / total) * 100 : 0;
  const act3Percent = total > 0 ? (act3 / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">3-Act Structure Distribution</h2>
      
      <div className="flex h-4 rounded-full overflow-hidden bg-slate-100 mb-3">
        <div className="bg-indigo-400" style={{ width: `${act1Percent}%` }} />
        <div className="bg-blue-400" style={{ width: `${act2Percent}%` }} />
        <div className="bg-rose-400" style={{ width: `${act3Percent}%` }} />
      </div>
      
      <div className="flex justify-between text-xs font-medium text-slate-500">
        <span className="text-indigo-600">Act 1: {act1}</span>
        <span className="text-blue-600">Act 2: {act2}</span>
        <span className="text-rose-600">Act 3: {act3}</span>
      </div>
    </div>
  );
}