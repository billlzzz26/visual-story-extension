/**
 * Test script for v2 extraction engine
 * Calls the actual extraction functions from the package
 * and compares results with v1
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { 
    extractCharacters, 
    extractScenes, 
    extractLocations 
} from "../packages/bl1nk/tools/search-entries.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the combined story
const storyPath = join(__dirname, "./test-input/combined-story.md");
const storyText = readFileSync(storyPath, "utf8");

async function runV2Extraction() {
	console.log("🚀 Running V2 Extraction (Unified Engine)...\n");

	try {
		// 1. Extract Entities using the new engine
		const characters = extractCharacters(storyText, 1);
		const scenes = extractScenes(storyText, 1);
		const locations = extractLocations(storyText, 1);

		console.log("✅ V2 Results:\n");
		console.log("📊 Stats:");
		console.log(`   - Characters: ${characters.length}`);
		console.log(`   - Scenes: ${scenes.length}`);
		console.log(`   - Locations: ${locations.length}\n`);

		console.log("📝 Characters Found (V2):");
		// Dedup by name
		const uniqueChars = new Map();
		for (const c of characters) {
			if (!uniqueChars.has(c.name)) {
				uniqueChars.set(c.name, c);
			} else {
				uniqueChars.get(c.name).mentions.push(...c.mentions);
			}
		}
		
		for (const [name, c] of uniqueChars.entries()) {
			console.log(`   - ${name} (${c.mentions.length} mentions)`);
		}

		console.log("\n🎬 Scenes Found (V2):");
		for (const s of scenes) {
			console.log(`   - ${s.name}`);
		}

		console.log("\n📍 Locations Found (V2):");
		for (const l of locations) {
			console.log(`   - ${l.name}`);
		}

		// Save output for comparison
		const outputDir = join(__dirname, "./test-output/v2");
		mkdirSync(outputDir, { recursive: true });

		const resultData = {
			stats: {
				characters: uniqueChars.size,
				scenes: scenes.length,
				locations: locations.length
			},
			characters: Array.from(uniqueChars.values()),
			scenes,
			locations
		};

		// Save the full JSON result
		writeFileSync(join(outputDir, "result.json"), JSON.stringify(resultData, null, 2));

		console.log(`\n📁 V2 results saved in: ${outputDir}`);

		return resultData;
	} catch (error) {
		console.error("❌ Error running V2 extraction:", error);
	}
}

runV2Extraction();
