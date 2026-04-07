"use client";

interface MermaidViewerProps {
	diagram: string;
}

export function MermaidViewer({
	diagram,
}: MermaidViewerProps): React.ReactElement {
	return (
		<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
			<h2 className="text-lg font-semibold text-slate-800 mb-4">
				Story Flow Diagram
			</h2>

			<div className="bg-slate-50 rounded-lg p-4 overflow-auto">
				<pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap">
					{diagram}
				</pre>
			</div>

			<p className="text-xs text-slate-400 mt-3">
				Mermaid diagram visualization would render here in production
			</p>
		</div>
	);
}
