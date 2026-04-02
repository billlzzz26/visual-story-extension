'use client';

import type { ValidationResult } from '../types/story';
import { getIssueColor } from '../lib/colors';

interface ValidationPanelProps {
  validation: ValidationResult;
}

export function ValidationPanel({ validation }: ValidationPanelProps): React.ReactElement {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Validation</h2>
      
      {validation.issues.length === 0 ? (
        <div className="flex items-center gap-2 text-emerald-600">
          <span className="text-xl">✓</span>
          <span className="font-medium">No structural issues found!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {validation.issues.map((issue, index) => {
            const colors = getIssueColor(issue.severity);
            return (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${colors.bg} ${colors.border}`}>
                <p className="text-xs font-bold uppercase text-slate-500 mb-1">{issue.code}</p>
                <p className="text-sm">{issue.message}</p>
                {issue.suggestion && (
                  <p className="text-xs text-slate-500 mt-1">💡 {issue.suggestion}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {validation.recommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm font-semibold text-indigo-600 mb-2">Recommendations</p>
          <ul className="space-y-2">
            {validation.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-indigo-500 mt-0.5">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}