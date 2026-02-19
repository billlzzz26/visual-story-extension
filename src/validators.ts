import { StoryGraph, ValidationResult } from './types.js';

export function validateGraph(graph: StoryGraph, strict = false): ValidationResult {
  const issues: Array<{ severity: string; code: string; message: string; suggestion?: string }> = [];
  const addIssue = (severity: string, code: string, message: string, suggestion?: string) => {
    issues.push({ severity, code, message, suggestion });
  };

  // Structure checks
  if (!graph.meta.title || graph.meta.title.trim() === '') addIssue('error', 'MISSING_TITLE', 'Story must have a title');
  if (graph.characters.length === 0) addIssue('error', 'NO_CHARACTERS', 'Story must have at least one character');
  if (!graph.characters.some(c => c.role === 'protagonist')) addIssue('error', 'NO_PROTAGONIST', 'Story must have a protagonist');
  
  const acts = new Set(graph.events.map(e => e.act));
  if (!acts.has(1)) addIssue('error', 'MISSING_ACT1', 'Story must have Act 1 events');
  if (!acts.has(2)) addIssue('error', 'MISSING_ACT2', 'Story must have Act 2 events');
  if (!acts.has(3)) addIssue('error', 'MISSING_ACT3', 'Story must have Act 3 events');
  
  if (!graph.events.some(e => e.importance === 'climax')) addIssue('warning', 'NO_CLIMAX', 'Story should have a climax event', 'Add a climactic event');
  if (!graph.events.some(e => e.importance === 'midpoint')) addIssue('warning', 'NO_MIDPOINT', 'Story should have a midpoint event', 'Add a midpoint event');
  if (graph.conflicts.length === 0) addIssue('warning', 'NO_CONFLICTS', 'Story should have at least one conflict');

  // Strict checks
  if (strict) {
    graph.characters.forEach(c => {
      if (!c.motivations || c.motivations.length === 0) addIssue('error', 'NO_MOTIVATION', `${c.name} has no motivations`);
    });
  }

  // Analysis
  const actCounts = { act1: graph.events.filter(e => e.act === 1).length, act2: graph.events.filter(e => e.act === 2).length, act3: graph.events.filter(e => e.act === 3).length };
  const total = actCounts.act1 + actCounts.act2 + actCounts.act3;
  const balance = total > 0 ? Math.min(actCounts.act1, actCounts.act2, actCounts.act3) / Math.max(actCounts.act1, actCounts.act2, actCounts.act3) : 0;

  const recommendations: string[] = [];
  if (balance < 0.5) recommendations.push('Balance events across acts');
  if (!graph.events.some(e => e.importance === 'midpoint')) recommendations.push('Add a midpoint event');
  if (!graph.events.some(e => e.importance === 'climax')) recommendations.push('Add a climax event');

  return {
    isValid: !issues.some(i => i.severity === 'error'),
    issues,
    analysis: {
      actBalance: { ...actCounts, balance },
      characterCount: graph.characters.length,
      conflictCount: graph.conflicts.length,
      eventCount: total,
      hasMidpoint: graph.events.some(e => e.importance === 'midpoint'),
      hasClimax: graph.events.some(e => e.importance === 'climax'),
      pacing: total < 5 ? 'slow' : total > 15 ? 'fast' : 'balanced',
    },
    recommendations,
  };
}
