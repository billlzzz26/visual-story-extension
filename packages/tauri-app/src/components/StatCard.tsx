'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: 'indigo' | 'blue' | 'orange' | 'emerald';
}

export function StatCard({ label, value, color = 'indigo' }: StatCardProps): React.ReactElement {
  const colorMap = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    emerald: 'text-emerald-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
      <p className="text-xs font-medium uppercase text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}