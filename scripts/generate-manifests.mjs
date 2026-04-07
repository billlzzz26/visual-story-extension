#!/usr/bin/env node
/**
 * Generate all agent manifests from manifest-source.json
 *
 * Usage: node scripts/generate-manifests.mjs
 *
 * Reads manifest-source.json and generates:
 * - qwen-extension.json
 * - gemini-extension.json
 * - .claude-plugin/plugin.json
 * - kilo.jsonc
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");

// Read source of truth
const source = JSON.parse(
	readFileSync(join(root, "manifest-source.json"), "utf8"),
);

const entryPoint = source.mcpServer.entryPoint.replace(/\//g, "${/}");

// ============================================================================
// 1. Qwen Extension Manifest
// ============================================================================
const qwenManifest = {
	name: source.name,
	version: source.version,
	contextFileName: source.contextFiles.qwen,
	commands: "commands",
	skills: "skills",
	settings: source.settings,
	mcpServers: {
		bl1nkVisualServer: {
			command: source.mcpServer.command,
			args: ["${extensionPath}${/}" + entryPoint],
			cwd: "${extensionPath}",
		},
	},
	tools: source.tools,
};

writeFileSync(
	join(root, "qwen-extension.json"),
	JSON.stringify(qwenManifest, null, "\t") + "\n",
);
console.log("✅ qwen-extension.json");

// ============================================================================
// 2. Gemini Extension Manifest
// ============================================================================
const geminiManifest = {
	name: source.name,
	version: source.version,
	contextFileName: source.contextFiles.gemini,
	settings: source.settings,
	mcpServers: {
		bl1nkVisualServer: {
			command: source.mcpServer.command,
			args: ["${extensionPath}${/}" + entryPoint],
			cwd: "${extensionPath}",
		},
	},
	tools: source.tools,
};

writeFileSync(
	join(root, "gemini-extension.json"),
	JSON.stringify(geminiManifest, null, "\t") + "\n",
);
console.log("✅ gemini-extension.json");

// ============================================================================
// 3. Claude Plugin Manifest
// ============================================================================
if (!existsSync(join(root, ".claude-plugin"))) {
	mkdirSync(join(root, ".claude-plugin"), { recursive: true });
}

const claudeManifest = {
	name: source.name,
	description: source.description,
	version: source.version,
	author: source.author,
};

writeFileSync(
	join(root, ".claude-plugin", "plugin.json"),
	JSON.stringify(claudeManifest, null, "\t") + "\n",
);
console.log("✅ .claude-plugin/plugin.json");

// ============================================================================
// 4. Claude .mcp.json (updated with correct path)
// ============================================================================
const claudeMcp = {
	bl1nkVisualServer: {
		command: source.mcpServer.command,
		args: ["${extensionRoot}/" + source.mcpServer.entryPoint],
		cwd: "${extensionRoot}",
	},
};

writeFileSync(
	join(root, ".mcp.json"),
	JSON.stringify(claudeMcp, null, "\t") + "\n",
);
console.log("✅ .mcp.json");

// ============================================================================
// 5. Kilo Code config (kilo.jsonc)
// ============================================================================
const kiloConfig = {
	agent: {
		"story-analyzer": {
			description:
				"Analyzes story structure using bl1nk MCP tools — validates 3-act structure, tracks character arcs, maps conflicts, and generates visual diagrams.",
			mode: "subagent",
		},
		"story-validator": {
			description:
				"Validates story structure against industry standards — checks act distribution, midpoint, climax, pacing, and character development.",
			mode: "subagent",
		},
		"story-exporter": {
			description:
				"Exports StoryGraph to multiple formats — Mermaid diagrams, Canvas JSON, HTML dashboards, Markdown documents, and CSV data.",
			mode: "subagent",
		},
	},
};

// Write as JSON (comment out if you want true JSONC with comments)
writeFileSync(
	join(root, "kilo.jsonc"),
	JSON.stringify(kiloConfig, null, "\t") + "\n",
);
console.log("✅ kilo.jsonc");

// ============================================================================
// Summary
// ============================================================================
console.log(`\n📋 Generated ${Object.keys(source.tools).length} tools across all manifests`);
console.log(`📦 MCP server: ${source.mcpServer.entryPoint}`);
console.log("🔗 All manifests generated from manifest-source.json");
