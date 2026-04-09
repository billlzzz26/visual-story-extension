/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * CSV Generator for StoryGraph data.
 */

import type { Character, Conflict, EventNode, StoryGraph } from "../types.js";

/**
 * Escape a CSV cell value to prevent formula injection attacks.
 * Prefixes values starting with =, +, -, @ with a single quote
 * to prevent execution in spreadsheet applications.
 */
function escapeCsvCell(value: string): string {
	if (value.length === 0) return value;
	const dangerousPrefixes = ["=", "+", "-", "@"];
	if (dangerousPrefixes.some((p) => value.startsWith(p))) {
		return `'${value}`;
	}
	// Also escape internal quotes
	return value.replace(/"/g, '""');
}

/**
 * Generate CSV files from StoryGraph
 */
export function generateCSV(graph: StoryGraph): string {
	const lines: string[] = [];

	// Characters CSV
	lines.push("--- characters.csv ---");
	lines.push("id,name,role,status,tags");
	for (const char of graph.characters) {
		lines.push(
			`${char.id},"${escapeCsvCell(char.name)}",${char.role},alive,"${escapeCsvCell(char.tags?.join(",") || "")}"`,
		);
	}

	// Events CSV
	lines.push("\n--- events.csv ---");
	lines.push("id,label,act,importance,characters");
	for (const event of graph.events) {
		lines.push(
			`${event.id},"${escapeCsvCell(event.label)}",${event.act},${event.importance || "normal"},"${escapeCsvCell(event.characters?.join(",") || "")}"`,
		);
	}

	// Conflicts CSV
	lines.push("\n--- conflicts.csv ---");
	lines.push("id,type,description,relatedCharacters");
	for (const conflict of graph.conflicts) {
		lines.push(
			`${conflict.id},${conflict.type},"${escapeCsvCell(conflict.description)}","${escapeCsvCell(conflict.relatedCharacters?.join(",") || "")}"`,
		);
	}

	return lines.join("\n");
}

/**
 * Generate individual CSV files
 */
export function generateIndividualCSVs(
	graph: StoryGraph,
): Record<string, string> {
	return {
		"characters.csv": generateCharactersCSV(graph.characters),
		"events.csv": generateEventsCSV(graph.events),
		"conflicts.csv": generateConflictsCSV(graph.conflicts),
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateCharactersCSV(characters: Character[]): string {
	const headers = ["id", "name", "role", "status", "tags"];
	const rows = characters.map((char) => [
		char.id,
		`"${escapeCsvCell(char.name)}"`,
		char.role,
		"alive",
		`"${escapeCsvCell(char.tags?.join(",") || "")}"`,
	]);

	return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function generateEventsCSV(events: EventNode[]): string {
	const headers = ["id", "label", "act", "importance", "characters"];
	const rows = events.map((event) => [
		event.id,
		`"${escapeCsvCell(event.label)}"`,
		event.act,
		event.importance || "normal",
		`"${escapeCsvCell(event.characters?.join(",") || "")}"`,
	]);

	return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function generateConflictsCSV(conflicts: Conflict[]): string {
	const headers = ["id", "type", "description", "relatedCharacters"];
	const rows = conflicts.map((conflict) => [
		conflict.id,
		conflict.type,
		`"${escapeCsvCell(conflict.description)}"`,
		`"${escapeCsvCell(conflict.relatedCharacters?.join(",") || "")}"`,
	]);

	return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
