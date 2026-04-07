import { extractStoryEntities } from "./core/parser.js";
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
	const entities = extractStoryEntities(text);

	const graph: StoryGraph = {
		meta: {
			title: entities.title || "Untitled Story",
			createdAt: "",
			updatedAt: "",
			version: "1.0.0",
		},
		characters: [],
		conflicts: [],
		events: [],
		relationships: [],
		tags: entities.themes,
	};

	// Map characters
	for (const char of entities.characters) {
		const roleText = char.role || "";
		const role = roleText.includes("protagonist")
			? "protagonist"
			: roleText.includes("antagonist")
				? "antagonist"
				: roleText.includes("mentor")
					? "mentor"
					: "supporting";

		graph.characters.push({
			id: `char_${char.index}`,
			name: char.name,
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
	}

	// Map events
	for (const event of entities.events) {
		const label = event.name;
		const lowerLabel = label.toLowerCase();
		const act = event.index < 4 ? 1 : event.index < 9 ? 2 : 3;
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
			id: `event_${event.index}`,
			label,
			description: label,
			act,
			importance,
			sequenceInAct:
				act === 1
					? event.index + 1
					: act === 2
						? event.index - 3
						: event.index - 8,
			characters: [],
			conflicts: [],
			emotionalTone: "neutral",
			consequence: "",
		});
	}

	// Map conflicts
	for (const conflict of entities.conflicts) {
		const description = conflict.name;
		const lowerDesc = description.toLowerCase();
		const type =
			lowerDesc.includes("self") || lowerDesc.includes("doubt")
				? "internal"
				: lowerDesc.includes("vs") || lowerDesc.includes("against")
					? "external"
					: "external";

		graph.conflicts.push({
			id: `conflict_${conflict.index}`,
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

	return graph;
}
