import {
	Character,
	Conflict,
	EventNode,
	Relationship,
	type StoryGraph,
} from "./types.js";

// Pre-compiled regex patterns to avoid re-compilation on every buildInitialGraph call
const TITLE_PATTERN_1 = /^Title:[ \t]*(\S[^\r\n]*)$/im;
const TITLE_PATTERN_2 = /^#+[ \t]+(\S[^\r\n]*)$/m;
const CHAR_PATTERN =
	/^Character:[ \t]*([A-Za-z][^,\r\n]*?)(?:,[ \t]*role:[ \t]*(\w+))?$/gim;
const EVENT_PATTERN = /^Event:[ \t]*(\S[^\r\n]*)$/gim;
const CONFLICT_PATTERN = /^Conflict:[ \t]*(\S[^\r\n]*)$/gim;

// Pre-compiled theme patterns (optimized to avoid large string allocations via toLowerCase())
const THEME_PATTERNS = {
	love: /love|romance/i,
	power: /power|control/i,
 survival: /survival|survive|endure/i,
	destiny: /destiny|heritage/i,
};

/**
 * Builds an initial StoryGraph by extracting metadata, characters, events, conflicts, relationships, and tags from plain text.
 *
 * @param text - Source text to parse for story elements (recognizes patterns such as `Title:`, `Character:`, `Event:`, and `Conflict:` lines)
 * @returns A StoryGraph populated with default metadata and arrays of characters, events, conflicts, relationships, and tags inferred from the input
 */
export function buildInitialGraph(text: string): StoryGraph {
	const graph: StoryGraph = {
		meta: {
			title: "Untitled Story",
			createdAt: "",
			updatedAt: "",
			version: "1.0.0",
		},
		characters: [],
		conflicts: [],
		events: [],
		relationships: [],
		tags: [],
	};

	// Reset global regex indices for stateful patterns
	CHAR_PATTERN.lastIndex = 0;
	EVENT_PATTERN.lastIndex = 0;
	CONFLICT_PATTERN.lastIndex = 0;

	// Extract title
	const titleMatch =
		TITLE_PATTERN_1.exec(text) || TITLE_PATTERN_2.exec(text);
	if (titleMatch) graph.meta.title = titleMatch[1].trim();

	// Extract characters: "Character: Name, role: protagonist"
	let charIndex = 0;
	let match = CHAR_PATTERN.exec(text);
	while (match !== null) {
		const name = match[1].trim();
		const roleText = match[2]?.toLowerCase() || "";
		const role = roleText.includes("protagonist")
			? "protagonist"
			: roleText.includes("antagonist")
				? "antagonist"
				: roleText.includes("mentor")
					? "mentor"
					: "supporting";

		graph.characters.push({
			id: `char_${charIndex++}`,
			name,
			role,
			traits: [],
			arc: {
				start: "",
				midpoint: "",
				end: "",
				transformation: "",
				emotionalJourney: [],
			},
			relationships: [],
			motivations: [],
			fears: [],
			secretsOrLies: [],
			actAppearances: [1, 2, 3],
		});
		match = CHAR_PATTERN.exec(text);
	}

	// Extract events: "Event: Event name"
	let eventIndex = 0;
	match = EVENT_PATTERN.exec(text);
	while (match !== null) {
		const label = match[1].trim();
		const lowerLabel = label.toLowerCase();
		const act = eventIndex < 4 ? 1 : eventIndex < 9 ? 2 : 3;
		const importance = lowerLabel.includes("inciting")
			? "inciting"
			: lowerLabel.includes("midpoint")
				? "midpoint"
				: lowerLabel.includes("climax") || lowerLabel.includes("final")
					? "climax"
					: lowerLabel.includes("resolution") || lowerLabel.includes("embraces")
						? "resolution"
						: "rising";

		graph.events.push({
			id: `event_${eventIndex++}`,
			label,
			description: label,
			act,
			importance,
			sequenceInAct:
				act === 1 ? eventIndex : act === 2 ? eventIndex - 4 : eventIndex - 9,
			characters: [],
			conflicts: [],
			emotionalTone: "neutral",
			consequence: "",
		});
		match = EVENT_PATTERN.exec(text);
	}

	// Extract conflicts: "Conflict: Description"
	let conflictIndex = 0;
	match = CONFLICT_PATTERN.exec(text);
	while (match !== null) {
		const description = match[1].trim();
		const lowerDesc = description.toLowerCase();
		const type =
			lowerDesc.includes("self") || lowerDesc.includes("doubt")
				? "internal"
				: lowerDesc.includes("vs") || lowerDesc.includes("against")
					? "external"
					: "external";

		graph.conflicts.push({
			id: `conflict_${conflictIndex++}`,
			type,
			description,
			relatedCharacters: [],
			rootCause: "",
			escalations: [
				{ stage: 1, description, intensity: 5, affectedCharacters: [] },
			],
			resolution: "",
			actIntroduced: 1,
		});
		match = CONFLICT_PATTERN.exec(text);
	}

	// Build relationships
	for (let i = 0; i < graph.characters.length; i++) {
		for (let j = i + 1; j < graph.characters.length; j++) {
			graph.relationships.push({
				from: graph.characters[i].id,
				to: graph.characters[j].id,
				type: "interacts-with",
				strength: 5,
			});
		}
	}

	// Assign characters to events (optimized: pre-calculate regex patterns)
	const charData = graph.characters.map((c) => {
		const escapedName = c.name
			.toLowerCase()
			.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		return {
			id: c.id,
			pattern: new RegExp(`\\b${escapedName}\\b`, "i"),
		};
	});

	for (const event of graph.events) {
		for (const char of charData) {
			if (char.pattern.test(event.label)) {
				event.characters.push(char.id);
			}
		}
	}

	// Extract themes (optimized: use pre-compiled regex to avoid large string allocations)
	if (THEME_PATTERNS.love.test(text)) graph.tags.push("love");
	if (THEME_PATTERNS.power.test(text)) graph.tags.push("power");
	if (THEME_PATTERNS.survival.test(text)) graph.tags.push("survival");
	if (THEME_PATTERNS.destiny.test(text)) graph.tags.push("destiny");

	return graph;
}
