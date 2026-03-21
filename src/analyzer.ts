import {
	Character,
	Conflict,
	EventNode,
	Relationship,
	type StoryGraph,
} from "./types.js";

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

	// Extract title
	const titleMatch =
		text.match(/^Title:[ \t]*(\S[^\r\n]*)$/im) ||
		text.match(/^#+[ \t]+(\S[^\r\n]*)$/m);
	if (titleMatch) graph.meta.title = titleMatch[1].trim();

	// Extract characters: "Character: Name, role: protagonist"
	const charPattern =
		/^Character:[ \t]*([A-Za-z][^,\r\n]*?)(?:,[ \t]*role:[ \t]*(\w+))?$/gim;
	let match = charPattern.exec(text);
	let charIndex = 0;
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
		match = charPattern.exec(text);
	}

	// Extract events: "Event: Event name"
	const eventPattern = /^Event:[ \t]*(\S[^\r\n]*)$/gim;
	let eventIndex = 0;
	match = eventPattern.exec(text);
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
   sequenceInAct: act === 1 ? eventIndex + 1 : act === 2 ? eventIndex - 3 : eventIndex - 8,
			characters: [],
			conflicts: [],
			emotionalTone: "neutral",
			consequence: "",
		});
		match = eventPattern.exec(text);
	}

	// Extract conflicts: "Conflict: Description"
	const conflictPattern = /^Conflict:[ \t]*(\S[^\r\n]*)$/gim;
	let conflictIndex = 0;
	match = conflictPattern.exec(text);
	while (match !== null) {
		const description = match[1].trim();
		const lowerDesc = description.toLowerCase();
		const type =
			lowerDesc.includes("vs") || lowerDesc.includes("against")
				? "external"
				: lowerDesc.includes("self") || lowerDesc.includes("doubt")
					? "internal"
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
		match = conflictPattern.exec(text);
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

	// Assign characters to events (optimized: pre-calculate lowercase values)
	const charData = graph.characters.map((c) => ({
		id: c.id,
		lowerName: c.name.toLowerCase(),
	}));
	for (const event of graph.events) {
		const lowerLabel = event.label.toLowerCase();
		for (const char of charData) {
			if (lowerLabel.includes(char.lowerName)) {
				event.characters.push(char.id);
			}
		}
	}

	// Extract themes
	const lower = text.toLowerCase();
	if (lower.includes("love") || lower.includes("romance"))
		graph.tags.push("love");
	if (lower.includes("power") || lower.includes("control"))
		graph.tags.push("power");
	if (lower.includes("survive") || lower.includes("endure"))
		graph.tags.push("survival");
	if (lower.includes("destiny") || lower.includes("heritage"))
		graph.tags.push("destiny");

	return graph;
}
