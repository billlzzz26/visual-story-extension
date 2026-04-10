/**
 * Unified Extraction Engine
 * Centralizes regex patterns and extraction logic for story elements.
 */

export const STORY_PATTERNS = {
	TITLE_1: /^Title:[ \t]*(\S[^\r\n]*)$/im,
	TITLE_2: /^#+[ \t]+(\S[^\r\n]*)$/m,
	CHARACTER:
		/^Character:[ \t]*([A-Za-z][^,\r\n]*?)(?:,[ \t]*role:[ \t]*(\w+))?$/gim,
	EVENT: /^Event:[ \t]*(\S[^\r\n]*)$/gim,
	CONFLICT: /^Conflict:[ \t]*(\S[^\r\n]*)$/gim,
	SCENE: /(?:Chapter|Scene)\s*\d*:?\s*(.+)/gi,
	DIALOGUE: /"([^"]+)"\s*-\s*([A-Z][a-z]+)/g,
	LOCATION_KEYWORDS: [
		"castle",
		"forest",
		"temple",
		"woods",
		"forge",
		"village",
		"city",
		"mountain",
		"river",
		"cave",
		"dungeon",
		"palace",
		"tavern",
		"inn",
		"market",
		"square",
		"gate",
		"wall",
		"tower",
		"keep",
		"bridge",
		"road",
		"path",
		"trail",
		// Thai Keywords
		"ปราสาท",
		"ป่า",
		"วัด",
		"วิหาร",
		"ป่าไม้",
		"โรงตีเหล็ก",
		"หมู่บ้าน",
		"เมือง",
		"ภูเขา",
		"แม่น้ำ",
		"ถ้ำ",
		"คุกใต้ดิน",
		"พระราชวัง",
		"โรงเตี๊ยม",
		"ตลาด",
		"จัตุรัส",
		"ประตูเมือง",
		"กำแพง",
		"หอคอย",
		"ป้อม",
		"สะพาน",
		"ถนน",
		"เส้นทาง",
		"ทุ่งหญ้า",
		"กำแพงเมือง",
	],
	// Optimized: Combined regex for location keywords (O(N) vs O(K*N))
	LOCATION_REGEX: /$.^/g,
	ENTITY_DICTIONARY: {
		characters: [
			"อิกนัส",
			"ซิลเวอร์ไนท์",
			"ลิโอเรน อิกนัส",
			"เบลซ",
			"ลูฟัส",
			"ลูฟัส กลอส",
			"อีริก",
			"ซาเบล",
			"โนเอล",
			"หญิงสาวเมด",
			"การ์ดภารกิจ",
		],
		// Optimized: Combined regex for dictionary characters
		CHARACTER_REGEX: /$.^/g,
	},
	THEMES: {
		love: /love|romance/i,
		power: /power|control/i,
		survival: /survival|survive|endure/i,
		destiny: /destiny|heritage/i,
	},
};

// Initialize optimized regexes
// Sort keywords by length descending to match longest possible entity first (handles overlaps)
STORY_PATTERNS.LOCATION_REGEX = new RegExp(
	`\\b(${[...STORY_PATTERNS.LOCATION_KEYWORDS]
		.sort((a, b) => b.length - a.length)
		.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join("|")})\\b`,
	"gi",
);
STORY_PATTERNS.ENTITY_DICTIONARY.CHARACTER_REGEX = new RegExp(
	`(${[...STORY_PATTERNS.ENTITY_DICTIONARY.characters]
		.sort((a, b) => b.length - a.length)
		.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join("|")})`,
	"g",
);

export interface ExtractedEntity {
	type: "character" | "event" | "conflict" | "scene" | "location";
	name: string;
	role?: string;
	description?: string;
	raw?: string;
	index: number;
}

/**
 * Extracts all basic story entities from text using central patterns.
 */
export function extractStoryEntities(text: string) {
	const results = {
		title: "",
		characters: [] as ExtractedEntity[],
		events: [] as ExtractedEntity[],
		conflicts: [] as ExtractedEntity[],
		scenes: [] as ExtractedEntity[],
		locations: [] as ExtractedEntity[],
		themes: [] as string[],
	};

	// 1. Extract Title
	const titleMatch =
		STORY_PATTERNS.TITLE_1.exec(text) || STORY_PATTERNS.TITLE_2.exec(text);
	if (titleMatch) results.title = titleMatch[1].trim();

	// 2. Extract Characters
	let charIdx = 0;
	const foundNames = new Set<string>();

	// 2a. Regex extraction (matchAll avoids mutating regex lastIndex)
	for (const match of text.matchAll(STORY_PATTERNS.CHARACTER)) {
		const name = match[1].trim();
		foundNames.add(name);
		results.characters.push({
			type: "character",
			name,
			role: match[2]?.toLowerCase() || "supporting",
			index: charIdx++,
			raw: match[0],
		});
	}

	// 2b. Dictionary extraction (bridge from v1)
	// Optimized: Single pass using combined regex
	for (const match of text.matchAll(
		STORY_PATTERNS.ENTITY_DICTIONARY.CHARACTER_REGEX,
	)) {
		const name = match[0];
		if (!foundNames.has(name)) {
			foundNames.add(name);
			results.characters.push({
				type: "character",
				name,
				role: "supporting",
				index: charIdx++,
			});
		}
	}

	// 3. Extract Events
	let eventIdx = 0;
	for (const match of text.matchAll(STORY_PATTERNS.EVENT)) {
		results.events.push({
			type: "event",
			name: match[1].trim(),
			index: eventIdx++,
			raw: match[0],
		});
	}

	// 4. Extract Conflicts
	let conflictIdx = 0;
	for (const match of text.matchAll(STORY_PATTERNS.CONFLICT)) {
		results.conflicts.push({
			type: "conflict",
			name: match[1].trim(),
			index: conflictIdx++,
			raw: match[0],
		});
	}

	// 5. Extract Scenes
	let sceneIdx = 0;
	for (const match of text.matchAll(STORY_PATTERNS.SCENE)) {
		results.scenes.push({
			type: "scene",
			name: match[1].trim(),
			index: sceneIdx++,
			raw: match[0],
		});
	}

	// 6. Extract Locations (New: improved logic)
	// Optimized: Single pass using combined regex
	let locIdx = 0;
	const foundLocations = new Set<string>();
	for (const match of text.matchAll(STORY_PATTERNS.LOCATION_REGEX)) {
		const name = match[0].toLowerCase();
		if (!foundLocations.has(name)) {
			foundLocations.add(name);
			results.locations.push({
				type: "location",
				name: match[0],
				index: locIdx++,
			});
		}
	}

	// 7. Extract Themes
	for (const [theme, pattern] of Object.entries(STORY_PATTERNS.THEMES)) {
		if (pattern.test(text)) {
			results.themes.push(theme);
		}
	}

	return results;
}
