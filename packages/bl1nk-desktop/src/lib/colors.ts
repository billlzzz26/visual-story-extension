export function getImportanceColor(importance: string): {
	bg: string;
	text: string;
} {
	const colors: Record<string, { bg: string; text: string }> = {
		inciting: { bg: "bg-purple-100", text: "text-purple-700" },
		midpoint: { bg: "bg-yellow-100", text: "text-yellow-700" },
		climax: { bg: "bg-red-100", text: "text-red-700" },
		resolution: { bg: "bg-green-100", text: "text-green-700" },
		rising: { bg: "bg-slate-100", text: "text-slate-600" },
	};
	return colors[importance] ?? { bg: "bg-slate-100", text: "text-slate-600" };
}

export function getRoleColor(role: string): { bg: string; text: string } {
	const colors: Record<string, { bg: string; text: string }> = {
		protagonist: { bg: "bg-indigo-100", text: "text-indigo-700" },
		antagonist: { bg: "bg-rose-100", text: "text-rose-700" },
		mentor: { bg: "bg-amber-100", text: "text-amber-700" },
		supporting: { bg: "bg-slate-100", text: "text-slate-600" },
	};
	return colors[role] ?? { bg: "bg-slate-100", text: "text-slate-600" };
}

export function getConflictColor(type: string): { bg: string; text: string } {
	const colors: Record<string, { bg: string; text: string }> = {
		external: { bg: "bg-orange-100", text: "text-orange-700" },
		internal: { bg: "bg-violet-100", text: "text-violet-700" },
	};
	return colors[type] || { bg: "bg-slate-100", text: "text-slate-600" };
}

export function getIssueColor(severity: string): {
	bg: string;
	text: string;
	border: string;
} {
	const colors: Record<string, { bg: string; text: string; border: string }> = {
		error: { bg: "bg-red-50", text: "text-red-700", border: "border-red-500" },
		warning: {
			bg: "bg-amber-50",
			text: "text-amber-700",
			border: "border-amber-500",
		},
		info: {
			bg: "bg-blue-50",
			text: "text-blue-700",
			border: "border-blue-500",
		},
	};
	return (
		colors[severity] ?? {
			bg: "bg-blue-50",
			text: "text-blue-700",
			border: "border-blue-500",
		}
	);
}
