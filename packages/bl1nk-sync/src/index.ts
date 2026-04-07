/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * GitHub Sync App
 *
 * Syncs markdown files from GitHub to Notion automatically.
 * Triggered by GitHub webhooks on push events.
 */

import { createHmac } from "node:crypto";
import { createServer } from "node:http";
import { parse as parseCSV } from "csv-parse/sync";
import { parse } from "gray-matter";

// Environment variables
const PORT = process.env.PORT || "3000";
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

// Simple HTTP server for GitHub webhooks
const server = createServer(async (req, res) => {
	if (req.method !== "POST") {
		res.writeHead(404);
		res.end("Not found");
		return;
	}

	// Verify webhook signature
	const signature = req.headers["x-hub-signature-256"] as string;
	const body = await getRequestBody(req);

	if (!verifyWebhook(signature, body)) {
		res.writeHead(401);
		res.end("Unauthorized");
		return;
	}

	// Parse webhook event
	const event = req.headers["x-github-event"] as string;
	const payload = JSON.parse(body);

	if (event === "push") {
		await handlePushEvent(payload);
	}

	res.writeHead(200);
	res.end("OK");
});

server.listen(PORT, () => {
	console.log(`GitHub Sync App listening on port ${PORT}`);
});

// ============================================================================
// Webhook Handlers
// ============================================================================

async function handlePushEvent(payload: any) {
	const commits = payload.commits || [];

	for (const commit of commits) {
		const added = commit.added || [];
		const modified = commit.modified || [];

		// Process markdown files
		for (const file of [...added, ...modified]) {
			if (file.endsWith(".md")) {
				await syncMarkdownToNotion(file, commit);
			}

			if (file.endsWith(".csv")) {
				await syncCSVToNotion(file, commit);
			}
		}
	}
}

// ============================================================================
// Sync Functions
// ============================================================================

async function syncMarkdownToNotion(file: string, commit: any) {
	// Fetch file content from GitHub
	const content = await fetchFileContent(file);

	// Parse frontmatter
	const { data, content: body } = parse(content);

	// Create/update Notion page based on type
	if (data.type === "character") {
		await syncCharacterToNotion(data, body);
	} else if (data.type === "scene") {
		await syncSceneToNotion(data, body);
	} else if (data.type === "location") {
		await syncLocationToNotion(data, body);
	}
}

async function syncCSVToNotion(file: string, commit: any) {
	// Fetch file content from GitHub
	const content = await fetchFileContent(file);

	// Parse CSV
	const records = parseCSV(content, { columns: true });

	// Sync to Notion database
	if (file.includes("characters.csv")) {
		await syncCharactersCSV(records);
	} else if (file.includes("scenes.csv")) {
		await syncScenesCSV(records);
	} else if (file.includes("locations.csv")) {
		await syncLocationsCSV(records);
	}
}

// ============================================================================
// Notion Sync Functions
// ============================================================================

async function syncCharacterToNotion(data: any, body: string) {
	// Create/update character in Notion
	console.log(`Syncing character: ${data.canonicalName}`);
	// TODO: Implement Notion API calls
}

async function syncSceneToNotion(data: any, body: string) {
	console.log(`Syncing scene: ${data.canonicalName}`);
	// TODO: Implement Notion API calls
}

async function syncLocationToNotion(data: any, body: string) {
	console.log(`Syncing location: ${data.canonicalName}`);
	// TODO: Implement Notion API calls
}

async function syncCharactersCSV(records: any[]) {
	console.log(`Syncing ${records.length} characters from CSV`);
	// TODO: Implement Notion API calls
}

async function syncScenesCSV(records: any[]) {
	console.log(`Syncing ${records.length} scenes from CSV`);
	// TODO: Implement Notion API calls
}

async function syncLocationsCSV(records: any[]) {
	console.log(`Syncing ${records.length} locations from CSV`);
	// TODO: Implement Notion API calls
}

// ============================================================================
// Helper Functions
// ============================================================================

function getRequestBody(req: any): Promise<string> {
	return new Promise((resolve) => {
		let body = "";
		req.on("data", (chunk: string) => {
			body += chunk;
		});
		req.on("end", () => {
			resolve(body);
		});
	});
}

function verifyWebhook(signature: string, body: string): boolean {
	if (!WEBHOOK_SECRET) return true; // Skip verification if no secret

	const hmac = createHmac("sha256", WEBHOOK_SECRET);
	const digest = `sha256=${hmac.update(body).digest("hex")}`;

	return signature === digest;
}

async function fetchFileContent(file: string): Promise<string> {
	// TODO: Fetch file content from GitHub API
	return "";
}
