/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tool: search_entries
 *
 * Searches story text and extracts ALL entities (characters, scenes, locations, creatures, objects).
 * Performs entity resolution to identify name variations (aliases).
 * Generates markdown files with both metadata (frontmatter) and content (body).
 *
 * This is a SEARCH tool - it finds and catalogs entities, not analyzes story quality.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import { z } from "zod";
import entitiesConfig from "../../known/entities.json" assert { type: "json" };
import { STORY_PATTERNS } from "../core/parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lazy-loaded compiled Handlebars templates.
// Avoids blocking the event loop with synchronous file I/O at module load time.
let _templateCache: {
	character: ReturnType<typeof Handlebars.compile>;
	scene: ReturnType<typeof Handlebars.compile>;
	location: ReturnType<typeof Handlebars.compile>;
} | null = null;

function getTemplates() {
	if (_templateCache) return _templateCache;
	const base = join(__dirname, "../templates");
	_templateCache = {
		character: Handlebars.compile(
			readFileSync(join(base, "characters/character.md"), "utf8"),
		),
		scene: Handlebars.compile(
			readFileSync(join(base, "scene/scene.md"), "utf8"),
		),
		location: Handlebars.compile(
			readFileSync(join(base, "world/location.md"), "utf8"),
		),
	};
	return _templateCache;
}

// ============================================================================
// Types
// ============================================================================

interface RawEntry {
	type: "character" | "scene" | "location" | "conflict";
	name: string;
	mentions: Mention[];
	context?: Record<string, unknown>;
}

interface Mention {
	chapter: string;
	nameUsed: string;
	context: string;
	speaker?: string;
	surroundingText?: string;
}

interface StoredEntry {
	entityType: string;
	metadata: Record<string, unknown>;
	content: string;
}

// ============================================================================
// Entity Resolution
// ============================================================================

class EntityManager {
	private entities: Map<string, RawEntry> = new Map();

	add(entry: RawEntry): void {
		const key = `${entry.type}:${entry.name.toLowerCase()}`;
		const existing = this.entities.get(key);

		if (existing) {
			// Merge mentions
			existing.mentions.push(...entry.mentions);
		} else {
			this.entities.set(key, entry);
		}
	}

	getAll(): RawEntry[] {
		return Array.from(this.entities.values());
	}

	resolve(name: string, type: string): RawEntry | undefined {
		const key = `${type}:${name.toLowerCase()}`;
		return this.entities.get(key);
	}
}

// ============================================================================
// Extraction Functions
// ============================================================================

export function extractCharacters(
	text: string,
	chapterNum: number,
): RawEntry[] {
	const characters: RawEntry[] = [];
	const lines = text.split("\n");

	// 1. Regex patterns
	const charPattern = STORY_PATTERNS.CHARACTER;
	const dialoguePattern = STORY_PATTERNS.DIALOGUE;
	const foundNames = new Set<string>();

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Reset global regex indices for each line
		charPattern.lastIndex = 0;
		dialoguePattern.lastIndex = 0;

		// Extract from dialogue
		while (true) {
			const match = dialoguePattern.exec(line);
			if (match === null) break;
			const [_, dialogue, speaker] = match;
			const name = speaker.trim();
			foundNames.add(name.toLowerCase());
			characters.push({
				type: "character",
				name: name,
				mentions: [
					{
						chapter: `chapter-${chapterNum}`,
						nameUsed: name,
						context: dialogue.trim(),
						speaker: "narrator",
						surroundingText: line.trim(),
					},
				],
			});
		}

		// Extract from explicit character lines
		while (true) {
			const match = charPattern.exec(line);
			if (match === null) break;
			const name = match[1].trim();
			// Filter out common words
			if (["The", "A", "An", "Chapter", "Title"].includes(name)) continue;

			foundNames.add(name.toLowerCase());
			characters.push({
				type: "character",
				name: name,
				mentions: [
					{
						chapter: `chapter-${chapterNum}`,
						nameUsed: name,
						context: "narration",
						surroundingText: line.trim(),
					},
				],
			});
		}
	}

	// 2. Dictionary extraction (bridge from v1 & Thai support)
	for (const name of STORY_PATTERNS.ENTITY_DICTIONARY.characters) {
		if (foundNames.has(name.toLowerCase())) continue;

		// Simple search for the name in the whole text
		const lines = text.split("\n");
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.includes(name)) {
				foundNames.add(name.toLowerCase());
				characters.push({
					type: "character",
					name: name,
					mentions: [
						{
							chapter: `chapter-${chapterNum}`,
							nameUsed: name,
							context: line.trim().substring(0, 100),
							speaker: "narrator",
							surroundingText: line.trim(),
						},
					],
				});
				// Found once, we'll dedup later anyway
			}
		}
	}

	// Deduplicate
	const deduped = new Map<string, RawEntry>();
	for (const char of characters) {
		const key = char.name.toLowerCase();
		if (deduped.has(key)) {
			deduped.get(key)?.mentions.push(...char.mentions);
		} else {
			deduped.set(key, char);
		}
	}

	return Array.from(deduped.values());
}

export function extractScenes(text: string, chapterNum: number): RawEntry[] {
	const scenes: RawEntry[] = [];

	// Extract chapter/scene headers
	const scenePattern = STORY_PATTERNS.SCENE;
	scenePattern.lastIndex = 0;

	while (true) {
		const match = scenePattern.exec(text);
		if (match === null) break;
		scenes.push({
			type: "scene",
			name: match[1].trim() || `Chapter ${chapterNum}`,
			mentions: [
				{
					chapter: `chapter-${chapterNum}`,
					nameUsed: match[0],
					context: "scene header",
					speaker: "narrator",
				},
			],
			context: { act: 1, importance: "normal" },
		});
	}

	if (scenes.length === 0) {
		// Default scene for chapter
		scenes.push({
			type: "scene",
			name: `Chapter ${chapterNum}`,
			mentions: [
				{
					chapter: `chapter-${chapterNum}`,
					nameUsed: `Chapter ${chapterNum}`,
					context: "default scene",
					speaker: "narrator",
				},
			],
			context: { act: 1, importance: "normal" },
		});
	}

	return scenes;
}

export function extractLocations(text: string, chapterNum: number): RawEntry[] {
	const locations: RawEntry[] = [];

	// Common location keywords (English + Thai from Unified Engine)
	const locationKeywords = STORY_PATTERNS.LOCATION_KEYWORDS;

	for (const keyword of locationKeywords) {
		// Use word boundary for English, but not for Thai (as Thai has no spaces)
		const isThai = /[\u0E00-\u0E7F]/.test(keyword);
		const pattern = isThai ? keyword : `\\b${keyword}\\b`;
		const regex = new RegExp(pattern, "gi");

		while (true) {
			const match = regex.exec(text);
			if (match === null) break;
			const context = text.substring(
				Math.max(0, match.index - 50),
				match.index + 50,
			);
			locations.push({
				type: "location",
				name: keyword, // Use the keyword as the name for consistency
				mentions: [
					{
						chapter: `chapter-${chapterNum}`,
						nameUsed: match[0].trim(),
						context: "location mention",
						speaker: "narrator",
						surroundingText: context,
					},
				],
			});
		}
	}

	// Deduplicate
	const deduped = new Map<string, RawEntry>();
	for (const loc of locations) {
		const key = loc.name.toLowerCase();
		if (deduped.has(key)) {
			deduped.get(key)?.mentions.push(...loc.mentions);
		} else {
			deduped.set(key, loc);
		}
	}

	return Array.from(deduped.values());
}

// ============================================================================
// Entity Resolution & Alias Detection
// ============================================================================

function resolveAliases(entries: RawEntry[]): StoredEntry[] {
	const stored: StoredEntry[] = [];

	// Group by type
	const byType = new Map<string, RawEntry[]>();
	for (const entry of entries) {
		if (!byType.has(entry.type)) {
			byType.set(entry.type, []);
		}
		byType.get(entry.type)?.push(entry);
	}

	// Process each type
	for (const [type, typeEntries] of byType.entries()) {
		// Simple alias detection: same mention context
		const canonicalMap = new Map<string, RawEntry>();

		for (const entry of typeEntries) {
			const canonicalName = entry.name; // In real version, use AI to resolve
			const existing = canonicalMap.get(canonicalName.toLowerCase());

			if (existing) {
				// Merge as alias
				existing.mentions.push(...entry.mentions);
			} else {
				canonicalMap.set(canonicalName.toLowerCase(), entry);
			}
		}

		// Convert to stored entries
		for (const [_, entry] of canonicalMap.entries()) {
			stored.push(createStoredEntry(entry, type));
		}
	}

	return stored;
}

function createStoredEntry(entry: RawEntry, type: string): StoredEntry {
	const id = generateId(type, entry.name);

	// Extract aliases from mentions
	const aliases = extractAliasesFromMentions(entry.mentions);

	// Generate content (summary, essence, etc.)
	const content = generateContent(entry, type);

	return {
		entityType: type,
		metadata: {
			type,
			id,
			canonicalName: entry.name,
			aliases,
			mentions: entry.mentions,
			relationships: [],
			tags: generateTags(entry),
			status: type === "character" ? "alive" : undefined,
		},
		content,
	};
}

function generateId(type: string, name: string): string {
	const prefix =
		type === "character" ? "char" : type === "scene" ? "scene" : "loc";
	return `${prefix}_${name
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "")}`;
}

function extractAliasesFromMentions(mentions: Mention[]): string[] {
	const aliases: string[] = [];
	const namesUsed = new Set<string>();

	for (const mention of mentions) {
		if (!namesUsed.has(mention.nameUsed)) {
			namesUsed.add(mention.nameUsed);
			aliases.push(mention.nameUsed);
		}
	}

	return aliases;
}

function generateContent(entry: RawEntry, type: string): string {
	const summary = generateSummary(entry);
	const essence = generateEssence(entry, type);
	const templates = getTemplates();

	if (type === "character") {
		return templates.character({
			name: entry.name,
			summary,
			essence,
			mentions: entry.mentions,
			events: extractEvents(entry),
			quotes: extractKeyQuotes(entry.mentions),
		});
	}
	if (type === "scene") {
		return templates.scene({
			name: entry.name,
			summary,
			essence,
			mentions: entry.mentions,
		});
	}
	return templates.location({
		name: entry.name,
		summary,
		essence,
		mentions: entry.mentions,
	});
}

function generateSummary(entry: RawEntry): string {
	const firstMention = entry.mentions[0];
	return `First mentioned in ${firstMention.chapter}: "${firstMention.context}"`;
}

function generateEssence(entry: RawEntry, type: string): string {
	return `A ${type} named ${entry.name} with ${entry.mentions.length} total mentions.`;
}

function generateTags(entry: RawEntry): string[] {
	const tags = [entry.type];
	if (entry.mentions.length > 5) tags.push("frequent");
	return tags;
}

function extractKeyQuotes(mentions: Mention[]): string[] {
	const quotes: string[] = [];

	for (const mention of mentions) {
		if (mention.speaker === "narrator" && mention.context.length > 10) {
			quotes.push(mention.context);
		}
	}

	return quotes;
}

function extractEvents(entry: RawEntry): Record<string, unknown>[] {
	return entry.mentions.map((m) => ({
		description: m.context,
		chapter: m.chapter,
	}));
}

// ============================================================================
// Tool Definition
// ============================================================================

export const searchEntriesTool = {
	name: "search_entries",
	description: `Search and extract ALL entities from story text.

WHAT THIS TOOL DOES:
1. FIND entries - Extract characters (with aliases), scenes, locations, creatures, objects
2. STORE entries - Build metadata (for machine) and content (for human)  
3. BUILD profiles - Generate markdown files with wiki links [[name]]

WHAT THIS TOOL DOES NOT DO:
- Analyze story quality or structure
- Make recommendations
- Judge writing quality

OUTPUT:
- Markdown files with frontmatter (metadata) + body (content)
- JSON blocks for machine reading
- Wiki links [[name]] for connections between files
- Entity resolution (identifies name variations like "พี่นาง" = "เจ้าหญิง" = same person)

BEST FOR:
- Cataloging all characters in a chapter
- Finding all locations mentioned
- Tracking name variations for same character
- Creating searchable story database`,

	inputSchema: z.object({
		text: z.string().describe("Story text to search for entities"),
		chapterNumber: z
			.number()
			.optional()
			.describe("Chapter number for organization (1, 2, 3...)"),
		extractOptions: z
			.object({
				characters: z
					.boolean()
					.default(true)
					.describe("Extract characters (including name variations)"),
				scenes: z.boolean().default(true).describe("Extract scenes/chapters"),
				locations: z
					.boolean()
					.default(true)
					.describe("Extract locations/places"),
				creatures: z
					.boolean()
					.default(false)
					.describe("Extract monsters/creatures"),
				objects: z
					.boolean()
					.default(false)
					.describe("Extract important objects/items"),
			})
			.optional(),
	}),

	async execute(args: z.infer<(typeof searchEntriesTool)["inputSchema"]>) {
		const entityManager = new EntityManager();

		// 1. FIND - Extract entries
		if (args.extractOptions?.characters !== false) {
			const characters = extractCharacters(args.text, args.chapterNumber || 1);
			for (const c of characters) {
				entityManager.add(c);
			}
		}

		if (args.extractOptions?.scenes !== false) {
			const scenes = extractScenes(args.text, args.chapterNumber || 1);
			for (const s of scenes) {
				entityManager.add(s);
			}
		}

		if (args.extractOptions?.locations !== false) {
			const locations = extractLocations(args.text, args.chapterNumber || 1);
			for (const l of locations) {
				entityManager.add(l);
			}
		}

		// 2. STORE - Build metadata + content with entity resolution
		const storedEntries = resolveAliases(entityManager.getAll());

		// 3. COUNT - Count entries by type (no file generation needed for summary)
		const charCount = storedEntries.filter(
			(e) => e.entityType === "character",
		).length;
		const sceneCount = storedEntries.filter(
			(e) => e.entityType === "scene",
		).length;
		const locCount = storedEntries.filter(
			(e) => e.entityType === "location",
		).length;
		const totalFiles = charCount + sceneCount + locCount + 1; // +1 for index.md

		// Return summary
		return {
			content: [
				{
					type: "text" as const,
					text: `✅ Searched: Chapter ${args.chapterNumber || "new"}\n\n📊 Found:\n- Characters: ${charCount}\n- Scenes: ${sceneCount}\n- Locations: ${locCount}\n\n📁 Prepared ${totalFiles} files:\n- characters/*.md (${charCount} files)\n- scenes/*.md (${sceneCount} files)\n- locations/*.md (${locCount} files)\n- index.md\n\n🔗 Next steps:\n- Run "search_entries" again for next chapter\n- Run "export_files" to upload to GitHub\n- Open index.md to see all entries`,
				},
			],
		};
	},
};
