/**
 * Unified Extraction Engine
 * Centralizes regex patterns and extraction logic for story elements.
 */

export const STORY_PATTERNS = {
	TITLE_1: /^Title:[ \t]*(\S[^\r\n]*)$/im,
	TITLE_2: /^#+[ \t]+(\S[^\r\n]*)$/m,
	CHARACTER: /^Character:[ \t]*([A-Za-z][^,\r\n]*?)(?:,[ \t]*role:[ \t]*(\w+))?$/gim,
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
	},
	THEMES: {
		love: /love|romance/i,
		power: /power|control/i,
		survival: /survival|survive|endure/i,
		destiny: /destiny|heritage/i,
	},
};

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
	STORY_PATTERNS.CHARACTER.lastIndex = 0;
	let match: RegExpExecArray | null;
	let charIdx = 0;
	const foundNames = new Set<string>();

	// 2a. Regex extraction
	while ((match = STORY_PATTERNS.CHARACTER.exec(text)) !== null) {
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
	for (const name of STORY_PATTERNS.ENTITY_DICTIONARY.characters) {
		if (foundNames.has(name)) continue;
		const regex = new RegExp(name, "g");
		if (regex.test(text)) {
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
	STORY_PATTERNS.EVENT.lastIndex = 0;
	let eventIdx = 0;
	while ((match = STORY_PATTERNS.EVENT.exec(text)) !== null) {
		results.events.push({
			type: "event",
			name: match[1].trim(),
			index: eventIdx++,
			raw: match[0],
		});
	}

	// 4. Extract Conflicts
	STORY_PATTERNS.CONFLICT.lastIndex = 0;
	let conflictIdx = 0;
	while ((match = STORY_PATTERNS.CONFLICT.exec(text)) !== null) {
		results.conflicts.push({
			type: "conflict",
			name: match[1].trim(),
			index: conflictIdx++,
			raw: match[0],
		});
	}

	// 5. Extract Scenes
	STORY_PATTERNS.SCENE.lastIndex = 0;
	let sceneIdx = 0;
	while ((match = STORY_PATTERNS.SCENE.exec(text)) !== null) {
		results.scenes.push({
			type: "scene",
			name: match[1].trim(),
			index: sceneIdx++,
			raw: match[0],
		});
	}

	// 6. Extract Locations (New: improved logic)
	let locIdx = 0;
	for (const keyword of STORY_PATTERNS.LOCATION_KEYWORDS) {
		const regex = new RegExp(`\\b${keyword}\\b`, "gi");
		if (regex.test(text)) {
			results.locations.push({
				type: "location",
				name: keyword,
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
