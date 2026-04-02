/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CSV Generator for StoryGraph data.
 */

import type { StoryGraph } from '../types.js';

/**
 * Generate CSV files from StoryGraph
 */
export function generateCSV(graph: StoryGraph): string {
  const lines: string[] = [];

  // Characters CSV
  lines.push('--- characters.csv ---');
  lines.push('id,name,role,status,tags');
  for (const char of graph.characters) {
    lines.push(`${char.id},"${char.name}",${char.role},alive,"${char.tags?.join(',') || ''}"`);
  }

  // Events CSV
  lines.push('\n--- events.csv ---');
  lines.push('id,label,act,importance,characters');
  for (const event of graph.events) {
    lines.push(`${event.id},"${event.label}",${event.act},${event.importance || 'normal'},"${event.characters?.join(',') || ''}"`);
  }

  // Conflicts CSV
  lines.push('\n--- conflicts.csv ---');
  lines.push('id,type,description,relatedCharacters');
  for (const conflict of graph.conflicts) {
    lines.push(`${conflict.id},${conflict.type},"${conflict.description}","${conflict.relatedCharacters?.join(',') || ''}"`);
  }

  return lines.join('\n');
}

/**
 * Generate individual CSV files
 */
export function generateIndividualCSVs(graph: StoryGraph): Record<string, string> {
  return {
    'characters.csv': generateCharactersCSV(graph.characters),
    'events.csv': generateEventsCSV(graph.events),
    'conflicts.csv': generateConflictsCSV(graph.conflicts),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateCharactersCSV(characters: any[]): string {
  const headers = ['id', 'name', 'role', 'status', 'tags'];
  const rows = characters.map(char => [
    char.id,
    `"${char.name}"`,
    char.role,
    'alive',
    `"${char.tags?.join(',') || ''}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function generateEventsCSV(events: any[]): string {
  const headers = ['id', 'label', 'act', 'importance', 'characters'];
  const rows = events.map(event => [
    event.id,
    `"${event.label}"`,
    event.act,
    event.importance || 'normal',
    `"${event.characters?.join(',') || ''}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function generateConflictsCSV(conflicts: any[]): string {
  const headers = ['id', 'type', 'description', 'relatedCharacters'];
  const rows = conflicts.map(conflict => [
    conflict.id,
    conflict.type,
    `"${conflict.description}"`,
    `"${conflict.relatedCharacters?.join(',') || ''}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
