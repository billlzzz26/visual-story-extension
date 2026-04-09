/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tool: generate_artifacts
 *
 * Generate ALL artifacts from StoryGraph automatically.
 * No format selection needed - generates everything.
 */

import { z } from "zod";
import { toCanvasJSON } from "../exporters/canvas.js";
import { toDashboard } from "../exporters/dashboard.js";
import { toMarkdown } from "../exporters/markdown.js";
import { toMermaid } from "../exporters/mermaid.js";
import type { StoryGraph } from "../types.js";
import { generateCSV } from "../utils/csv-generator.js";

export const generateArtifactsTool = {
	name: "generate_artifacts",
	description: `Generate ALL artifacts from StoryGraph automatically.

GENERATES ALL FORMATS:
- mermaid.md: Mermaid diagram (GitHub/Obsidian preview)
- canvas.json: Canvas JSON (Obsidian canvas)
- story.md: Markdown document (reading)
- dashboard.html: HTML dashboard (interactive view)
- database.csv: CSV files (Notion/Airtable import)

NO FORMAT SELECTION NEEDED - generates everything automatically.`,

	inputSchema: z.object({
		graph: z.any().describe("StoryGraph JSON object"),
	}),

	async execute(args: z.infer<(typeof generateArtifactsTool)["inputSchema"]>) {
		const graph: StoryGraph = args.graph;

		// Generate ALL formats automatically
		const artifacts = {
			"mermaid.md": toMermaid(graph, {
				style: "default",
				includeMetadata: true,
			}),
			"canvas.json": JSON.stringify(
				toCanvasJSON(graph, { includeMetadata: true }),
				null,
				2,
			),
			"story.md": toMarkdown(graph, {
				includeMetadata: true,
				includeAnalysis: true,
			}),
			"dashboard.html": toDashboard(graph, {
				includeStats: true,
				includeRecommendations: true,
			}),
			"database.csv": generateCSV(graph),
		};

		// Return all files
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(
						{
							generated: Object.keys(artifacts),
							files: artifacts,
						},
						null,
						2,
					),
				},
			],
		};
	},
};
